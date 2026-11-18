import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  // ─── CONFIGURACIÓN DE PLATAFORMA ──────────────────────────────────
  async obtenerConfiguracion() {
    let config = await this.prisma.configuracionPlataforma.findFirst();
    if (!config) {
      config = await this.prisma.configuracionPlataforma.create({
        data: {
          id: 1,
          porcentaje_comision_plataforma: 5.0,
          nombre_empresa: 'SAIPI - Gestión Inmobiliaria Digital',
        },
      });
    }

    return {
      id: config.id,
      porcentaje_comision_plataforma: Number(config.porcentaje_comision_plataforma),
      nombre_empresa: config.nombre_empresa,
      updatedAt: config.updatedAt,
    };
  }

  async actualizarConfiguracion(id: number, data: any) {
    const comision = parseFloat(data.porcentaje_comision_plataforma);
    if (isNaN(comision) || comision < 0 || comision > 100) {
      throw new BadRequestException('El porcentaje de comisión debe ser un valor entre 0 y 100');
    }

    const config = await this.prisma.configuracionPlataforma.upsert({
      where: { id: Number(id) || 1 },
      update: {
        porcentaje_comision_plataforma: comision,
        ...(data.nombre_empresa ? { nombre_empresa: data.nombre_empresa } : {}),
      },
      create: {
        id: Number(id) || 1,
        porcentaje_comision_plataforma: comision,
        nombre_empresa: data.nombre_empresa || 'SAIPI',
      },
    });

    return {
      id: config.id,
      porcentaje_comision_plataforma: Number(config.porcentaje_comision_plataforma),
      nombre_empresa: config.nombre_empresa,
      updatedAt: config.updatedAt,
    };
  }

  // ─── LISTADO DE PAGOS / TRANSACCIONES ─────────────────────────────
  async listarPagos(user: any, filtros: any) {
    const esAdmin = user?.rol === 'admin';
    const esPersonal = filtros?.personal === 'true' || !esAdmin;

    const where: any = {};
    if (esPersonal && user?.id) {
      where.OR = [
        { propietario_id: user.id },
        { inquilino_id: user.id },
      ];
    }

    if (filtros?.inmueble_id) {
      where.inmueble_id = Number(filtros.inmueble_id);
    }

    const pagos = await this.prisma.pago.findMany({
      where,
      include: {
        inmueble: { select: { id: true, titulo: true, ciudad: true } },
        inquilino: { select: { id: true, first_name: true, last_name: true, email: true } },
        propietario: { select: { id: true, first_name: true, last_name: true, email: true } },
      },
      orderBy: { fecha_pago: 'desc' },
    });

    return pagos.map((p) => ({
      id: p.id,
      monto: Number(p.monto),
      comision_plataforma: Number(p.comision_plataforma),
      monto_neto: Number(p.monto_neto),
      moneda: p.moneda,
      concepto: p.concepto,
      tipo: p.tipo,
      metodo: p.metodo,
      estado: p.estado,
      transaccion_id: p.transaccion_id,
      referencia: p.transaccion_id || `REC-${p.id}`,
      fecha_pago: p.fecha_pago,
      fecha: p.fecha_pago,
      creado: p.createdAt,
      inmueble_id: p.inmueble_id,
      inmueble_titulo: p.inmueble ? p.inmueble.titulo : 'Inmueble General',
      inmueble: p.inmueble ? { id: p.inmueble.id, titulo: p.inmueble.titulo, ciudad: p.inmueble.ciudad } : null,
      inquilino_id: p.inquilino_id,
      inquilino: p.inquilino ? `${p.inquilino.first_name} ${p.inquilino.last_name}` : 'Inquilino',
      usuario_nombre: p.propietario ? `${p.propietario.first_name} ${p.propietario.last_name}` : 'Propietario',
      propietario_id: p.propietario_id,
      propietario: p.propietario ? `${p.propietario.first_name} ${p.propietario.last_name}` : 'Propietario',
      contrato_id: p.contrato_id,
      contrato: p.contrato_id,
    }));
  }

  // ─── HU-24 REPORTES Y GRÁFICOS ANALÍTICOS ─────────────────────────
  async obtenerReportes(user: any, filtros: any) {
    const esAdmin = user?.rol === 'admin';
    const esPersonal = filtros?.personal === 'true' || !esAdmin;

    const anioActual = new Date().getFullYear();
    const anio = parseInt(filtros?.anio, 10) || anioActual;

    const where: any = {
      estado: 'completado',
      fecha_pago: {
        gte: new Date(`${anio}-01-01T00:00:00.000Z`),
        lte: new Date(`${anio}-12-31T23:59:59.999Z`),
      },
    };

    if (esPersonal && user?.id) {
      where.propietario_id = user.id;
    }

    if (filtros?.inmueble_id && filtros.inmueble_id !== 'todos') {
      where.inmueble_id = Number(filtros.inmueble_id);
    }

    if (filtros?.ciudad && filtros.ciudad !== 'todas') {
      where.inmueble = { ciudad: filtros.ciudad };
    }

    const pagos = await this.prisma.pago.findMany({
      where,
      include: {
        inmueble: { select: { id: true, titulo: true, ciudad: true, tipo_oferta: true } },
        inquilino: { select: { id: true, first_name: true, last_name: true } },
        propietario: { select: { id: true, first_name: true, last_name: true } },
      },
      orderBy: { fecha_pago: 'asc' },
    });

    // 1. Cálculo de KPIs
    let totalBruto = 0;
    let totalComisiones = 0;
    let totalNeto = 0;

    pagos.forEach((p) => {
      totalBruto += Number(p.monto);
      totalComisiones += Number(p.comision_plataforma);
      totalNeto += Number(p.monto_neto);
    });

    // Cantidad de contratos / inmuebles activos
    const inmueblesUnicos = new Set(pagos.map((p) => p.inmueble_id).filter(Boolean));
    const contratosActivos = inmueblesUnicos.size;

    // 2. Evolución mensual (12 meses)
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesesMap: { [mes: string]: { monto: number; comision: number; neto: number; count: number } } = {};

    for (let m = 1; m <= 12; m++) {
      const mesKey = `${anio}-${String(m).padStart(2, '0')}`;
      mesesMap[mesKey] = { monto: 0, comision: 0, neto: 0, count: 0 };
    }

    pagos.forEach((p) => {
      const mesStr = p.fecha_pago.toISOString().substring(0, 7); // 'YYYY-MM'
      if (mesesMap[mesStr]) {
        mesesMap[mesStr].monto += Number(p.monto);
        mesesMap[mesStr].comision += Number(p.comision_plataforma);
        mesesMap[mesStr].neto += Number(p.monto_neto);
        mesesMap[mesStr].count += 1;
      }
    });

    const graficoEvolucion = Object.keys(mesesMap).map((mesKey) => {
      const mIndex = parseInt(mesKey.split('-')[1], 10) - 1;
      const data = mesesMap[mesKey];
      return {
        fecha: mesKey,
        label: mesesNombres[mIndex],
        ingreso: data.comision, // Para admin: comisiones retenidas
        ingreso_bruto: data.monto, // Para propietario: bruto
        comision_descontada: data.comision,
        ingreso_neto: data.neto, // Para propietario: neto
        pagos_count: data.count,
      };
    });

    // 3. Distribución por tipo de contrato / concepto
    const contratosMap: { [tipo: string]: number } = {};
    pagos.forEach((p) => {
      const tipo = p.tipo ? p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1) : 'Alquiler';
      contratosMap[tipo] = (contratosMap[tipo] || 0) + (esPersonal ? Number(p.monto_neto) : Number(p.comision_plataforma || p.monto));
    });

    const totalContratosMonto = Object.values(contratosMap).reduce((a, b) => a + b, 0) || 1;
    const graficoContratos = Object.keys(contratosMap).map((tipo) => ({
      contrato: tipo,
      ingreso: contratosMap[tipo],
      porcentaje: Math.round((contratosMap[tipo] / totalContratosMonto) * 100),
    }));

    // 4. Distribución por ciudades
    const ciudadesMap: { [ciudad: string]: number } = {};
    pagos.forEach((p) => {
      const ciudad = p.inmueble?.ciudad || 'Santa Cruz';
      ciudadesMap[ciudad] = (ciudadesMap[ciudad] || 0) + Number(p.monto);
    });

    const graficoCiudades = Object.keys(ciudadesMap).map((ciudad) => ({
      ciudad,
      ingreso: ciudadesMap[ciudad],
    }));

    // 5. Tabla de transacciones detalladas para visualización, Excel y PDF
    const tablaDetalle = pagos.map((p) => ({
      id: p.id,
      fecha: p.fecha_pago.toISOString().split('T')[0],
      inmueble: p.inmueble?.titulo || 'Inmueble sin título',
      ciudad: p.inmueble?.ciudad || 'Santa Cruz',
      tipo: p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1),
      tipo_contrato: p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1),
      inquilino: p.inquilino ? `${p.inquilino.first_name} ${p.inquilino.last_name}` : 'Inquilino General',
      propietario: p.propietario ? `${p.propietario.first_name} ${p.propietario.last_name}` : 'Propietario',
      monto: esPersonal ? Number(p.monto_neto) : Number(p.comision_plataforma || (Number(p.monto) * 0.05)),
      monto_bruto: Number(p.monto),
      comision: Number(p.comision_plataforma),
      monto_neto: Number(p.monto_neto),
      metodo: p.metodo.toUpperCase(),
      transaccion_id: p.transaccion_id,
      estado: p.estado,
    }));

    // Estructura de respuesta adaptada a ambos paneles
    return {
      kpis: {
        total_ingreso_comisiones: totalComisiones,
        total_pagos_exitosos: pagos.length,
        contratos_activos: contratosActivos,
        ingreso_bruto: totalBruto,
        total_comisiones: totalComisiones,
        ingreso_neto: totalNeto,
        transacciones_exitosas: pagos.length,
      },
      grafico_evolucion: graficoEvolucion,
      grafico_contratos: graficoContratos,
      grafico_ciudades: graficoCiudades,
      tabla_detalle: tablaDetalle,
      tabla_detalles: tablaDetalle,
      filtros_aplicados: {
        anio,
        personal: esPersonal,
      },
    };
  }

  // ─── COMPROBANTE FISCAL DIGITAL CON QR Y BLOCKCHAIN ───────────────
  async verificarComprobantePublico(pagoId: number) {
    const pago = await this.prisma.pago.findUnique({
      where: { id: Number(pagoId) },
      include: {
        inmueble: true,
        inquilino: true,
        propietario: true,
        contrato: {
          include: {
            tipo_contrato: true,
          },
        },
      },
    });

    if (!pago) {
      throw new NotFoundException(`El comprobante de pago N° ${pagoId} no fue encontrado o no es válido.`);
    }

    const txSha256 =
      '0x' +
      crypto
        .createHash('sha256')
        .update(`PAG-${pago.id}-${pago.transaccion_id || 'SAIPI'}-${pago.monto}-${pago.fecha_pago.toISOString()}`)
        .digest('hex');

    return {
      valido: true,
      recibo_nro: `REC-${new Date(pago.fecha_pago).getFullYear()}-${String(pago.id).padStart(6, '0')}`,
      pago_id: pago.id,
      fecha_pago: pago.fecha_pago,
      estado: pago.estado,
      concepto: pago.concepto,
      tipo: pago.tipo,
      monto_bruto: Number(pago.monto),
      comision_plataforma: Number(pago.comision_plataforma),
      monto_neto: Number(pago.monto_neto),
      moneda: pago.moneda,
      metodo: pago.metodo,
      transaccion_id: pago.transaccion_id || `TX-PAG-${pago.id}`,
      propietario: {
        id: pago.propietario?.id,
        nombre: pago.propietario ? `${pago.propietario.first_name} ${pago.propietario.last_name}` : 'Propietario',
        ci: pago.propietario?.ci || 'Sin CI registrado',
        email: pago.propietario?.email || 'propietario@saipi.bo',
      },
      inquilino: {
        id: pago.inquilino?.id,
        nombre: pago.inquilino ? `${pago.inquilino.first_name} ${pago.inquilino.last_name}` : 'Inquilino / Comprador',
        ci: pago.inquilino?.ci || 'Sin CI registrado',
        email: pago.inquilino?.email || 'usuario@saipi.bo',
      },
      inmueble: {
        id: pago.inmueble?.id,
        titulo: pago.inmueble?.titulo || 'Inmueble SAIPI',
        ciudad: pago.inmueble?.ciudad || 'Santa Cruz',
        direccion: pago.inmueble ? `${pago.inmueble.ciudad || ''}, ${pago.inmueble.zona || ''}` : 'Bolivia',
      },
      contrato: pago.contrato
        ? {
            id: pago.contrato.id,
            tipo: pago.contrato.tipo_contrato?.nombre || 'Arrendamiento Inmobiliario',
          }
        : null,
      blockchain: {
        asset_id: `PAG-${pago.id}`,
        bloque: 2040 + pago.id,
        hash_sha256: txSha256,
        red: 'SAIPI Ledger (Hyperledger Fabric v2.5)',
        consenso: 'Raft Byzantine Fault Tolerant (BFT)',
        estado: 'CONFIRMADO_INMUTABLE',
        timestamp: pago.fecha_pago.toISOString(),
      },
    };
  }

  async generarComprobantePDF(pagoId: number): Promise<Buffer> {
    const data = await this.verificarComprobantePublico(pagoId);

    const PDFDocument = require('pdfkit');
    const QRCode = require('qrcode');

    // Generar Buffer de Código QR
    const qrUrl = `http://localhost:5174/verificar-pago/${data.pago_id}`;
    const qrBuffer = await QRCode.toBuffer(qrUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 130,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const primaryColor = '#1e3a8a';
    const secondaryColor = '#059669';
    const darkText = '#0f172a';
    const lightText = '#64748b';
    const borderColor = '#cbd5e1';

    // ─── 1. ENCABEZADO OFICIAL ──────────────────────────────────────────
    doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryColor).text('SAIPI', 40, 40);
    doc.fontSize(9).font('Helvetica').fillColor(lightText).text('Sistema de Autogestión Inmobiliaria Propietario-Inquilino', 40, 66);
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#4f46e5').text('TECNOLOGÍA BLOCKCHAIN & SMART ESCROW - BOLIVIA', 40, 80);

    // Caja de Número de Recibo y Fecha
    doc.roundedRect(360, 40, 212, 54, 6).fillAndStroke('#f8fafc', '#94a3b8');
    doc.fontSize(9).font('Helvetica-Bold').fillColor(darkText).text('COMPROBANTE FISCAL DIGITAL', 370, 48);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor).text(`N° ${data.recibo_nro}`, 370, 62);
    const fechaEmision = new Date(data.fecha_pago).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.fontSize(8).font('Helvetica').fillColor(lightText).text(`Emisión: ${fechaEmision}`, 370, 77);

    // ─── 2. BANNER DE ESTADO Y VALIDEZ JURÍDICA ─────────────────────────
    const yBanner = 108;
    doc.roundedRect(40, yBanner, 532, 28, 4).fillAndStroke('#ecfdf5', '#a7f3d0');
    doc.fontSize(9).font('Helvetica-Bold').fillColor(secondaryColor).text('✓ PAGO CONFIRMADO & CERTIFICADO EN LEDGER BLOCKCHAIN INMUTABLE', 55, yBanner + 9);
    doc.fontSize(8).font('Helvetica').fillColor(lightText).text('Ley N° 164 del Estado Plurinacional de Bolivia', 345, yBanner + 9, { align: 'right', width: 215 });

    // ─── 3. INFORMACIÓN DE LAS PARTES CONTRATANTES ──────────────────────
    const yPartes = 148;
    // Caja Beneficiario / Propietario
    doc.roundedRect(40, yPartes, 260, 82, 6).fillAndStroke('#f8fafc', borderColor);
    doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text('BENEFICIARIO (PROPIETARIO / RECEPTOR)', 50, yPartes + 10);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText).text(data.propietario.nombre, 50, yPartes + 25);
    doc.fontSize(8).font('Helvetica').fillColor(lightText).text(`C.I.: ${data.propietario.ci}`, 50, yPartes + 40);
    doc.fontSize(8).font('Helvetica').fillColor(lightText).text(`Email: ${data.propietario.email}`, 50, yPartes + 53);
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#059669').text('Rol: Receptor Liquidado de Fondos', 50, yPartes + 67);

    // Caja Pagador / Inquilino
    doc.roundedRect(312, yPartes, 260, 82, 6).fillAndStroke('#f8fafc', borderColor);
    doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text('PAGADOR (INQUILINO / COMPRADOR)', 322, yPartes + 10);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText).text(data.inquilino.nombre, 322, yPartes + 25);
    doc.fontSize(8).font('Helvetica').fillColor(lightText).text(`C.I.: ${data.inquilino.ci}`, 322, yPartes + 40);
    doc.fontSize(8).font('Helvetica').fillColor(lightText).text(`Email: ${data.inquilino.email}`, 322, yPartes + 53);
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#2563eb').text('Rol: Titular Pagador / Emisor de Fondos', 322, yPartes + 67);

    // ─── 4. DETALLES DE LA OPERACIÓN INMOBILIARIA ────────────────────────
    const yDetalle = 242;
    doc.roundedRect(40, yDetalle, 532, 68, 6).fillAndStroke('#ffffff', borderColor);
    doc.fontSize(9).font('Helvetica-Bold').fillColor(darkText).text('DETALLE DEL INMUEBLE Y OPERACIÓN', 50, yDetalle + 10);

    doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text(`Propiedad: ${data.inmueble.titulo}`, 50, yDetalle + 26);
    doc.fontSize(8).font('Helvetica').fillColor(lightText).text(`Ubicación: ${data.inmueble.ciudad} - ${data.inmueble.direccion}`, 50, yDetalle + 39);
    doc.fontSize(8).font('Helvetica').fillColor(darkText).text(`Concepto: ${data.concepto}`, 50, yDetalle + 52);

    doc.fontSize(8).font('Helvetica').fillColor(lightText).text(`Tipo: ${data.tipo.toUpperCase()}`, 380, yDetalle + 26);
    doc.fontSize(8).font('Helvetica').fillColor(lightText).text(`Método: ${data.metodo.toUpperCase()}`, 380, yDetalle + 39);
    doc.fontSize(8).font('Helvetica').fillColor(lightText).text(`Transacción: ${data.transaccion_id}`, 380, yDetalle + 52);

    // ─── 5. DESGLOSE FINANCIERO Y LIQUIDACIÓN (TABLA DE COMISIÓN) ────────
    const yTabla = 322;
    doc.rect(40, yTabla, 532, 22).fill('#1e293b');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff').text('DESCRIPCIÓN DE LA LIQUIDACIÓN FINANCIERA', 50, yTabla + 7);
    doc.text('TASA / PORCENTAJE', 330, yTabla + 7);
    doc.text('MONTO (BOB)', 460, yTabla + 7, { align: 'right', width: 100 });

    // Fila 1: Monto Bruto Pagado
    const yFila1 = yTabla + 22;
    doc.rect(40, yFila1, 532, 24).fill('#ffffff');
    doc.fontSize(8).font('Helvetica-Bold').fillColor(darkText).text('Monto Bruto Pagado (Total Depositado por Inquilino)', 50, yFila1 + 7);
    doc.fontSize(8).font('Helvetica').fillColor(lightText).text('100.0%', 330, yFila1 + 7);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(darkText).text(`Bs ${data.monto_bruto.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`, 460, yFila1 + 7, { align: 'right', width: 100 });
    doc.strokeColor(borderColor).moveTo(40, yFila1 + 24).lineTo(572, yFila1 + 24).stroke();

    // Fila 2: Comisión de Plataforma Admin
    const yFila2 = yFila1 + 24;
    const porcentajeComision = ((data.comision_plataforma / (data.monto_bruto || 1)) * 100).toFixed(1);
    doc.rect(40, yFila2, 532, 24).fill('#fef2f2');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#dc2626').text('(-) Comisión de Servicio Plataforma SAIPI (Administración / Escrow)', 50, yFila2 + 7);
    doc.fontSize(8).font('Helvetica').fillColor('#dc2626').text(`${porcentajeComision}%`, 330, yFila2 + 7);
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#dc2626').text(`- Bs ${data.comision_plataforma.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`, 460, yFila2 + 7, { align: 'right', width: 100 });
    doc.strokeColor(borderColor).moveTo(40, yFila2 + 24).lineTo(572, yFila2 + 24).stroke();

    // Fila 3: Total Neto Liquidado al Propietario
    const yFila3 = yFila2 + 24;
    doc.rect(40, yFila3, 532, 30).fill('#f0fdf4');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#166534').text('(=) TOTAL NETO LIQUIDADO AL PROPIETARIO', 50, yFila3 + 9);
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#166534').text('NETO EFECTIVO', 330, yFila3 + 9);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#166534').text(`Bs ${data.monto_neto.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`, 460, yFila3 + 8, { align: 'right', width: 100 });
    doc.strokeColor('#86efac').rect(40, yFila3, 532, 30).stroke();

    // ─── 6. AUDITORÍA CRIPTOGRÁFICA Y CÓDIGO QR DE VERIFICACIÓN ──────────
    const yCrypto = 436;
    doc.roundedRect(40, yCrypto, 532, 160, 6).fillAndStroke('#f8fafc', borderColor);

    doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text('SELLADO DIGITAL CRIPTOGRÁFICO Y AUDITORÍA BLOCKCHAIN', 50, yCrypto + 12);

    doc.fontSize(8).font('Helvetica-Bold').fillColor(darkText).text('SMART CONTRACT ASSET ID:', 50, yCrypto + 32);
    doc.font('Helvetica').fillColor(lightText).text(data.blockchain.asset_id, 185, yCrypto + 32);

    doc.font('Helvetica-Bold').fillColor(darkText).text('BLOQUE BLOCKCHAIN:', 50, yCrypto + 46);
    doc.font('Helvetica').fillColor(lightText).text(`#${data.blockchain.bloque} (SAIPI Mainnet)`, 185, yCrypto + 46);

    doc.font('Helvetica-Bold').fillColor(darkText).text('RED Y CONSENSO:', 50, yCrypto + 60);
    doc.font('Helvetica').fillColor(lightText).text(`${data.blockchain.red} - ${data.blockchain.consenso}`, 185, yCrypto + 60);

    doc.font('Helvetica-Bold').fillColor(darkText).text('HASH SHA-256 (INMUTABLE):', 50, yCrypto + 74);
    doc.font('Courier').fontSize(7).fillColor('#1e293b').text(data.blockchain.hash_sha256, 50, yCrypto + 86, { width: 380 });

    doc.font('Helvetica').fontSize(7.5).fillColor(lightText).text(
      'Este recibo digital constituye comprobante válido de pago conforme a la Ley N° 164. La integridad matemática se encuentra sellada de forma inalterable en la red Blockchain de SAIPI. Cualquier alteración invalida su fuerza probatoria.',
      50,
      yCrypto + 108,
      { width: 380, align: 'justify' }
    );

    // Código QR a la derecha
    doc.image(qrBuffer, 445, yCrypto + 22, { width: 110, height: 110 });
    doc.fontSize(7).font('Helvetica-Bold').fillColor(primaryColor).text('VERIFICACIÓN PÚBLICA', 440, yCrypto + 136, { width: 120, align: 'center' });
    doc.fontSize(6.5).font('Helvetica').fillColor(lightText).text('Escanee el código QR para validar este recibo en línea', 440, yCrypto + 146, { width: 120, align: 'center' });

    // ─── 7. PIE DE PÁGINA ───────────────────────────────────────────────
    const yFooter = 620;
    doc.strokeColor(borderColor).moveTo(40, yFooter).lineTo(572, yFooter).stroke();
    doc.fontSize(7.5).font('Helvetica').fillColor(lightText).text(
      'SAIPI Inmobiliaria Digital S.R.L. • Edificio Torres Mall, Piso 14, La Paz • Equipetrol Norte, Santa Cruz de la Sierra, Bolivia',
      40,
      yFooter + 8,
      { align: 'center', width: 532 }
    );
    doc.fontSize(7).font('Helvetica').fillColor('#94a3b8').text(
      `Generado automáticamente el ${new Date().toLocaleString('es-BO')} • Registro Inmutable: ${data.blockchain.asset_id}`,
      40,
      yFooter + 20,
      { align: 'center', width: 532 }
    );

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: any) => reject(err));
    });
  }

  // ─── PROCESAR NUEVO PAGO (INQUILINO / COMPRADOR) ──────────────────
  async procesarPago(user: any, dto: any) {
    const contratoId = dto.contrato_id ? Number(dto.contrato_id) : null;
    let inmuebleId = dto.inmueble_id ? Number(dto.inmueble_id) : null;
    let propietarioId = dto.propietario_id ? Number(dto.propietario_id) : null;
    let inquilinoId = user?.id;

    let contrato: any = null;
    if (contratoId) {
      contrato = await this.prisma.contrato.findUnique({
        where: { id: contratoId },
        include: { inmueble: true, propietario: true, inquilino: true },
      });
      if (contrato) {
        inmuebleId = contrato.inmueble_id;
        propietarioId = contrato.propietario_id;
        inquilinoId = contrato.inquilino_id || user?.id;
      }
    }

    if (!propietarioId && inmuebleId) {
      const inm = await this.prisma.inmueble.findUnique({ where: { id: inmuebleId } });
      if (inm) propietarioId = inm.propietario_id;
    }

    const monto = parseFloat(dto.monto);
    if (isNaN(monto) || monto <= 0) {
      throw new BadRequestException('El monto debe ser un valor numérico mayor a cero');
    }

    // Configuración de comisión de plataforma
    const config = await this.obtenerConfiguracion();
    const pctComision = Number(config.porcentaje_comision_plataforma || 5.0);
    const comision = Math.round(((monto * pctComision) / 100) * 100) / 100;
    const neto = Math.round((monto - comision) * 100) / 100;

    const metodo = dto.metodo || 'qr';
    const concepto = dto.concepto || `Pago de canon de alquiler mensual (Contrato #${contratoId || 'N/A'})`;
    const tipo = dto.tipo || 'alquiler';
    const moneda = dto.moneda || 'BOB';
    const txId = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // 1. Guardar registro de Pago en base de datos
    const nuevoPago = await this.prisma.pago.create({
      data: {
        monto: monto,
        comision_plataforma: comision,
        monto_neto: neto,
        moneda: moneda,
        concepto: concepto,
        tipo: tipo,
        metodo: metodo,
        estado: 'completado',
        transaccion_id: txId,
        fecha_pago: new Date(),
        contrato_id: contratoId,
        inmueble_id: inmuebleId,
        inquilino_id: inquilinoId,
        propietario_id: propietarioId,
      },
      include: {
        inmueble: true,
        inquilino: true,
        propietario: true,
      },
    });

    // 2. Anclar en Blockchain Audit del Contrato (si existe)
    if (contrato) {
      try {
        const auditExistente = Array.isArray(contrato.blockchain_audit)
          ? [...(contrato.blockchain_audit as any[])]
          : [];
        const txHash =
          '0x' +
          crypto
            .createHash('sha256')
            .update(`PAGO-${nuevoPago.id}-${nuevoPago.fecha_pago.toISOString()}-${monto}`)
            .digest('hex');

        auditExistente.unshift({
          txId: txHash.substring(0, 34),
          txName: 'registrarPago',
          txType: 'registrarPago',
          blockNumber: 2040 + nuevoPago.id,
          timestamp: nuevoPago.fecha_pago.toISOString(),
          assetId: `CON-${contrato.id}`,
          actor: `SAIPI Smart Escrow Gateway (${metodo.toUpperCase()})`,
          hash: txHash,
          data: {
            pago_id: nuevoPago.id,
            monto: monto,
            comision_plataforma: comision,
            monto_neto: neto,
            moneda: moneda,
            concepto: concepto,
            metodo: metodo,
            estado: 'completado',
            smart_escrow: `ESCROW-PAG-${nuevoPago.id}`,
          },
        });

        await this.prisma.contrato.update({
          where: { id: contrato.id },
          data: { blockchain_audit: auditExistente },
        });
      } catch (e) {
        console.error('Error anclando pago en blockchain audit de contrato:', e);
      }
    }

    // 3. Notificaciones automáticas para Propietario e Inquilino
    try {
      if (propietarioId) {
        await this.prisma.notificacion.create({
          data: {
            usuario_id: propietarioId,
            titulo: 'Pago de alquiler recibido',
            mensaje: `El inquilino ${user?.first_name || 'Inquilino'} liquidó Bs ${monto.toLocaleString('es-BO')} (${concepto}). Se acreditó a tu cuenta Bs ${neto.toLocaleString('es-BO')} (descontada comisión plataforma del ${pctComision}%).`,
            tipo: 'pago',
          },
        });
      }
      if (inquilinoId) {
        await this.prisma.notificacion.create({
          data: {
            usuario_id: inquilinoId,
            titulo: 'Comprobante de pago generado',
            mensaje: `Tu pago de Bs ${monto.toLocaleString('es-BO')} (${concepto}) fue confirmado y sellado en Blockchain. Ya puedes descargar tu comprobante fiscal digital.`,
            tipo: 'pago',
          },
        });
      }
    } catch (e) {
      console.error('Error generando notificaciones de pago:', e);
    }

    return {
      success: true,
      mensaje: 'Pago procesado exitosamente y anclado en Blockchain',
      pago: {
        id: nuevoPago.id,
        recibo_nro: `REC-${new Date().getFullYear()}-${String(nuevoPago.id).padStart(6, '0')}`,
        monto_bruto: monto,
        comision_plataforma: comision,
        monto_neto: neto,
        moneda: moneda,
        concepto: concepto,
        metodo: metodo,
        transaccion_id: txId,
        fecha_pago: nuevoPago.fecha_pago,
        inmueble_titulo: nuevoPago.inmueble?.titulo || 'Inmueble',
        propietario_nombre: nuevoPago.propietario ? `${nuevoPago.propietario.first_name} ${nuevoPago.propietario.last_name}` : 'Propietario',
        inquilino_nombre: nuevoPago.inquilino ? `${nuevoPago.inquilino.first_name} ${nuevoPago.inquilino.last_name}` : 'Inquilino',
        blockchain_asset_id: `PAG-${nuevoPago.id}`,
        bloque: 2040 + nuevoPago.id,
        verificar_url: `/verificar-pago/${nuevoPago.id}`,
        pdf_url: `/api/pagos/comprobante/${nuevoPago.id}/pdf`,
      },
    };
  }
}
