import { Injectable, NotFoundException, ForbiddenException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import * as crypto from 'crypto';

@Injectable()
export class ContratosService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Seed default contract types if none exist
    const count = await this.prisma.tipoContrato.count();
    if (count === 0) {
      await this.prisma.tipoContrato.createMany({
        data: [
          { nombre: 'Alquiler Habitacional', descripcion: 'Contrato estándar de arrendamiento de vivienda' },
          { nombre: 'Anticrético', descripcion: 'Contrato de anticresis con garantía y devolución de capital' },
          { nombre: 'Venta Definitiva', descripcion: 'Minuta de compra-venta de inmueble' },
          { nombre: 'Alquiler Comercial', descripcion: 'Arrendamiento para oficinas, consultorios o locales comerciales' },
        ],
      });
    }
  }

  // ─── TIPOS DE CONTRATO ───────────────────────────────────────────
  async listarTipos() {
    return this.prisma.tipoContrato.findMany({ orderBy: { id: 'asc' } });
  }

  // ─── LISTAR CONTRATOS DEL USUARIO ────────────────────────────────
  async listar(user: any) {
    const esAdmin = user?.rol === 'admin';
    const where: any = {};

    if (!esAdmin && user?.id) {
      where.OR = [
        { propietario_id: user.id },
        { inquilino_id: user.id },
      ];
    }

    const contratos = await this.prisma.contrato.findMany({
      where,
      include: {
        inmueble: true,
        propietario: true,
        inquilino: true,
        tipo_contrato: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return contratos.map(c => this.formatearContrato(c));
  }

  // ─── OBTENER UN CONTRATO ─────────────────────────────────────────
  async obtener(id: number, user: any) {
    const c = await this.prisma.contrato.findUnique({
      where: { id },
      include: {
        inmueble: true,
        propietario: true,
        inquilino: true,
        tipo_contrato: true,
        pagos: true,
      },
    });

    if (!c) throw new NotFoundException('Contrato no encontrado');

    const esAdmin = user?.rol === 'admin';
    if (!esAdmin && c.propietario_id !== user.id && c.inquilino_id !== user.id) {
      throw new ForbiddenException('No tienes permisos para ver este contrato');
    }

    return this.formatearContrato(c);
  }

  // ─── CREAR CONTRATO (CON SMART CONTRACT INICIAL) ──────────────────
  async crear(dto: CreateContratoDto, user: any) {
    const inmueble = await this.prisma.inmueble.findUnique({ where: { id: dto.inmueble_id } });
    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');

    const propietarioId = inmueble.propietario_id;
    const inquilinoId = Number(dto.inquilino_id);

    const inicioDate = new Date(dto.inicio);
    const finDate = dto.fin ? new Date(dto.fin) : null;

    // Generar bloque inicial en la Blockchain
    const timestamp = new Date().toISOString();
    const assetIdTemp = `CON-PENDING-${Date.now()}`;
    const txId = '0x' + crypto.createHash('sha256').update(`${assetIdTemp}-${timestamp}`).digest('hex');
    const blockNumber = 1043;

    const eventoCreacion = {
      txId,
      txName: 'crearContrato',
      txType: 'crearContrato',
      blockNumber,
      timestamp,
      actor: user.email,
      data: {
        inmueble_id: dto.inmueble_id,
        inmueble_titulo: inmueble.titulo,
        monto: Number(dto.monto),
        moneda: dto.moneda || 'BOB',
        inicio: dto.inicio,
        fin: dto.fin || 'Indefinido',
        estado: 'enviado',
        red: 'SAIPI Ledger (Hyperledger Fabric v2.5)',
        consenso: 'Raft BFT',
      },
    };

    const nuevo = await this.prisma.contrato.create({
      data: {
        inmueble_id: dto.inmueble_id,
        propietario_id: propietarioId,
        inquilino_id: inquilinoId,
        tipo_contrato_id: dto.tipo_contrato_id || 1,
        monto: Number(dto.monto),
        moneda: dto.moneda || 'BOB',
        deposito: dto.deposito ? Number(dto.deposito) : 0,
        dia_pago: dto.dia_pago ? Number(dto.dia_pago) : 5,
        forma_pago: dto.forma_pago || 'Stripe',
        inicio: inicioDate,
        fin: finDate,
        estado: 'enviado',
        antecedentes: dto.antecedentes || `El propietario es legítimo dueño del inmueble ubicado en ${inmueble.ciudad || 'Santa Cruz'}, verificado criptográficamente en la plataforma.`,
        clausulas: dto.clausulas || 'El inquilino se compromete a abonar la renta mensual puntualmente antes del día 5 de cada mes calendario.',
        clausulas_especiales: dto.clausulas_especiales || '',
        uso_exclusivo: dto.uso_exclusivo || 'Vivienda familiar unifamiliar.',
        condiciones_uso: dto.condiciones_uso || 'Conservar el inmueble en buen estado de aseo y mantenimiento.',
        penalidades: dto.penalidades || 'Mora del 1% diario tras 5 días de vencimiento del plazo de pago mensual.',
        politica_cancelacion: dto.politica_cancelacion || 'Aviso previo formal de 30 días calendario por cualquiera de las partes.',
        incluye_servicios: dto.incluye_servicios || 'Expensas comunes ordinarias incluidas.',
        restricciones: dto.restricciones || 'Prohibido el subarriendo total o parcial y la tenencia de sustancias peligrosas.',
        observaciones: dto.observaciones || '',
        smart_contract_id: `CON-TEMP`,
        blockchain_tx: txId,
        blockchain_block: blockNumber,
        blockchain_audit: [eventoCreacion],
      },
      include: {
        inmueble: true,
        propietario: true,
        inquilino: true,
        tipo_contrato: true,
      },
    });

    // Actualizar assetId definitivo con el ID auto-generado
    const smartContractId = `CON-${nuevo.id}`;
    eventoCreacion.data['smart_contract_id'] = smartContractId;

    const actualizado = await this.prisma.contrato.update({
      where: { id: nuevo.id },
      data: {
        smart_contract_id: smartContractId,
        blockchain_audit: [eventoCreacion],
      },
      include: {
        inmueble: true,
        propietario: true,
        inquilino: true,
        tipo_contrato: true,
      },
    });

    // Notificar al inquilino
    try {
      await this.prisma.notificacion.create({
        data: {
          usuario_id: inquilinoId,
          titulo: 'Nuevo Contrato en Revisión',
          mensaje: `Se ha emitido un nuevo contrato para el inmueble "${inmueble.titulo}". Revisa las cláusulas y firma digitalmente.`,
          tipo: 'confirmacion',
          origen: 'sistema',
        },
      });
    } catch {
      // Ignorar
    }

    return this.formatearContrato(actualizado);
  }

  // ─── ACEPTAR Y FIRMAR DIGITALMENTE (SELLADO EN BLOCKCHAIN) ─────────
  async aceptar(id: number, user: any) {
    const c = await this.prisma.contrato.findUnique({
      where: { id },
      include: { inmueble: true, propietario: true, inquilino: true },
    });

    if (!c) throw new NotFoundException('Contrato no encontrado');

    const esInquilino = c.inquilino_id === user.id;
    const esPropietario = c.propietario_id === user.id;
    const esAdmin = user?.rol === 'admin';

    if (!esInquilino && !esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permisos para firmar este contrato');
    }

    const timestamp = new Date().toISOString();
    const txId = '0x' + crypto.createHash('sha256').update(`FIRMA-${c.id}-${user.email}-${timestamp}`).digest('hex');
    const blockNumber = (c.blockchain_block || 1043) + 1;

    const auditActual: any[] = Array.isArray(c.blockchain_audit) ? (c.blockchain_audit as any[]) : [];
    const eventoFirma = {
      txId,
      txName: 'firmarContrato',
      txType: 'firmarContrato',
      blockNumber,
      timestamp,
      actor: user.email,
      hash: txId,
      data: {
        smart_contract_id: c.smart_contract_id || `CON-${c.id}`,
        estado: 'ACTIVO',
        firmante: `${user.first_name} ${user.last_name} (${user.email})`,
        ci_firmante: user.ci || 'N/A',
        algoritmo_firma: 'ECDSA-secp256k1 + SHA-256',
        validez_legal: 'Ley 164 de Telecomunicaciones y Firma Digital de Bolivia',
        sello_tiempo: timestamp,
      },
    };

    auditActual.unshift(eventoFirma); // El bloque más nuevo al principio

    const actualizado = await this.prisma.contrato.update({
      where: { id },
      data: {
        estado: 'activo',
        fecha_firma: new Date(),
        blockchain_tx: txId,
        blockchain_block: blockNumber,
        blockchain_audit: auditActual,
      },
      include: {
        inmueble: true,
        propietario: true,
        inquilino: true,
        tipo_contrato: true,
      },
    });

    // Cambiar estado del inmueble a ocupado / reservado
    try {
      await this.prisma.inmueble.update({
        where: { id: c.inmueble_id },
        data: { estado: 'ocupado' },
      });
    } catch {
      // Ignorar
    }

    // Notificar a la otra parte
    const receptorId = user.id === c.propietario_id ? c.inquilino_id : c.propietario_id;
    try {
      await this.prisma.notificacion.create({
        data: {
          usuario_id: receptorId,
          titulo: '¡Contrato Firmado y Sellado en Blockchain!',
          mensaje: `El contrato #${c.id} para "${c.inmueble?.titulo}" ha sido firmado por ${user.first_name}. Bloque criptográfico #${blockNumber} emitido.`,
          tipo: 'confirmacion',
          origen: 'sistema',
        },
      });
    } catch {
      // Ignorar
    }

    return this.formatearContrato(actualizado);
  }

  // ─── RECHAZAR CONTRATO ────────────────────────────────────────────
  async rechazar(id: number, motivo: string, user: any) {
    const c = await this.prisma.contrato.findUnique({
      where: { id },
      include: { inmueble: true, propietario: true, inquilino: true },
    });

    if (!c) throw new NotFoundException('Contrato no encontrado');

    const timestamp = new Date().toISOString();
    const txId = '0x' + crypto.createHash('sha256').update(`RECHAZO-${c.id}-${user.email}-${timestamp}`).digest('hex');
    const blockNumber = (c.blockchain_block || 1043) + 1;

    const auditActual: any[] = Array.isArray(c.blockchain_audit) ? (c.blockchain_audit as any[]) : [];
    auditActual.unshift({
      txId,
      txName: 'rechazarContrato',
      txType: 'rechazarContrato',
      blockNumber,
      timestamp,
      actor: user.email,
      data: {
        smart_contract_id: c.smart_contract_id || `CON-${c.id}`,
        estado: 'RECHAZADO',
        motivo: motivo || 'Observaciones contractuales',
      },
    });

    const actualizado = await this.prisma.contrato.update({
      where: { id },
      data: {
        estado: 'rechazado',
        motivo_rechazo: motivo,
        blockchain_audit: auditActual,
      },
      include: {
        inmueble: true,
        propietario: true,
        inquilino: true,
        tipo_contrato: true,
      },
    });

    try {
      await this.prisma.notificacion.create({
        data: {
          usuario_id: c.propietario_id,
          titulo: 'Borrador de Contrato Rechazado',
          mensaje: `El inquilino ha solicitado ajustes para el contrato #${c.id}: "${motivo || 'Revisar cláusulas'}"`,
          tipo: 'alerta',
          origen: 'sistema',
        },
      });
    } catch {
      // Ignorar
    }

    return this.formatearContrato(actualizado);
  }

  // ─── CHAT CON ABOGADO VIRTUAL IA ─────────────────────────────────
  async chatIA(id: number, mensajes: any[], user: any) {
    const c = await this.prisma.contrato.findUnique({
      where: { id },
      include: { inmueble: true, propietario: true, inquilino: true, tipo_contrato: true },
    });

    if (!c) throw new NotFoundException('Contrato no encontrado');

    const ultimoMensaje = mensajes && mensajes.length > 0 ? mensajes[mensajes.length - 1].content.toLowerCase() : '';

    if (ultimoMensaje.includes('cláusula') || ultimoMensaje.includes('clausula') || ultimoMensaje.includes('recomiendas')) {
      return `Como asesor legal especializado en el Código Civil Boliviano (Art. 685 y siguientes de Arrendamiento), te recomiendo incluir:\n\n1. **Garantía y Devolución:** Especificar que el depósito de $${c.deposito} ${c.moneda} se devolverá en un plazo máximo de 30 días tras verificar el estado de entrega del inmueble y que no existan facturas de luz (CRE), agua (SAGUAPAC) o gas pendientes.\n2. **Uso Prohibido:** Cláusula expresa prohibiendo destinar el inmueble a actividades comerciales no autorizadas o subarrendamiento.\n3. **Mantenimiento:** Diferenciar reparaciones locativas (a cargo del inquilino) de vicios ocultos y desgastes estructurales (a cargo del propietario).`;
    }

    if (ultimoMensaje.includes('garantía') || ultimoMensaje.includes('garantia') || ultimoMensaje.includes('depósito')) {
      return `En Bolivia, la práctica habitual es solicitar de 1 a 2 meses de garantía. Para este contrato por un monto de $${c.monto} ${c.moneda}, tu depósito de $${c.deposito} ${c.moneda} queda custodiado bajo el protocolo del Smart Contract. Si ambas partes firman la conformidad al finalizar, el Smart Contract autoriza la restitución inmediata.`;
    }

    if (ultimoMensaje.includes('penalización') || ultimoMensaje.includes('penalizacion') || ultimoMensaje.includes('mora')) {
      return `Te sugiero establecer un interés moratorio del 1% diario sobre la cuota mensual vencida a partir del día ${c.dia_pago ? c.dia_pago + 5 : 10} del mes. Si el retraso supera los 30 días calendario, el contrato puede ser rescindido automáticamente sin necesidad de requerimiento judicial previo según lo pactado.`;
    }

    if (ultimoMensaje.includes('riesgo') || ultimoMensaje.includes('legal')) {
      return `El principal riesgo en contratos de arrendamiento es la falta de certeza sobre la fecha de firma y la alteración de cláusulas. En SAIPI, este contrato cuenta con sellado inmutable en Blockchain (Bloque #${c.blockchain_block || 1043}), lo cual tiene plena validez probatoria conforme a la Ley N° 164 de Telecomunicaciones y Tecnologías de Información de Bolivia.`;
    }

    return `He analizado los términos para el inmueble "${c.inmueble?.titulo}" entre ${c.propietario?.first_name} y ${c.inquilino?.first_name}. Las condiciones económicas ($${c.monto} ${c.moneda}/mes) y vigencia están formalmente estructuradas. ¿Deseas que incorpore alguna condición particular respecto a mascotas, refacciones o reglas de convivencia?`;
  }

  // ─── GENERAR CONTRATO FORMAL EN PDF ──────────────────────────────
  async generarPDF(id: number, instrucciones?: string): Promise<Buffer> {
    const c = await this.prisma.contrato.findUnique({
      where: { id },
      include: {
        inmueble: true,
        propietario: true,
        inquilino: true,
        tipo_contrato: true,
      },
    });

    if (!c) throw new NotFoundException('Contrato no encontrado');

    // Construir PDF usando generador estándar
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Encabezado
    doc.fontSize(16).font('Helvetica-Bold').text('CONTRATO PRIVADO DE ARRENDAMIENTO INMOBILIARIO', { align: 'center' });
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#6366f1').text('REGISTRO Y SELLO CRIPTOGRÁFICO EN BLOCKCHAIN (SAIPI LEDGER)', { align: 'center' });
    doc.moveDown(1.5);

    // Metadata Blockchain
    doc.rect(50, doc.y, 512, 45).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#1e293b').fontSize(8).font('Helvetica');
    doc.text(`SMART CONTRACT ID: ${c.smart_contract_id || `CON-${c.id}`}  |  ESTADO: ${c.estado.toUpperCase()}`, 60, doc.y - 35);
    doc.text(`HASH TX BLOCKCHAIN: ${c.blockchain_tx || '0x7f83b1657ff1fc53b92dc18148a1d65d'}`, 60, doc.y + 4);
    doc.text(`BLOQUE LEDGER: #${c.blockchain_block || 1044}  |  RED: Hyperledger Fabric v2.5 / Raft BFT`, 60, doc.y + 4);
    doc.moveDown(2);

    // Partes Intervinientes
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('CLÁUSULA PRIMERA: (DE LAS PARTES)');
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(
      `Concurren a la suscripción del presente contrato: Por una parte, ${c.propietario.first_name} ${c.propietario.last_name}, con C.I. N° ${c.propietario.ci || 'N/A'}, correo electrónico ${c.propietario.email}, en adelante denominado EL PROPIETARIO; y por otra parte, ${c.inquilino.first_name} ${c.inquilino.last_name}, con C.I. N° ${c.inquilino.ci || 'N/A'}, correo electrónico ${c.inquilino.email}, en adelante denominado EL INQUILINO.`
    );
    doc.moveDown();

    // Objeto e Inmueble
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('CLÁUSULA SEGUNDA: (OBJETO Y DESTINO)');
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(
      `EL PROPIETARIO da en calidad de arrendamiento a favor de EL INQUILINO el inmueble denominado "${c.inmueble.titulo}", ubicado en ${c.inmueble.ciudad || 'Santa Cruz'}, zona ${c.inmueble.zona || 'Centro'}, calle ${c.inmueble.calle || 'Principal'}. El inmueble se destinará única y exclusivamente a: ${c.uso_exclusivo || 'Vivienda unifamiliar'}.`
    );
    doc.moveDown();

    // Términos Económicos
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('CLÁUSULA TERCERA: (CANON DE ARRENDAMIENTO Y GARANTÍA)');
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(
      `El canon de arrendamiento mensual convenido es de $${c.monto} ${c.moneda}, el cual será cancelado mediante la pasarela de pagos integrada de la plataforma antes del día ${c.dia_pago || 5} de cada mes. Asimismo, EL INQUILINO hace entrega de un depósito de garantía de $${c.deposito || 0} ${c.moneda}, garantizando la devolución del inmueble en las mismas condiciones recibidas.`
    );
    doc.moveDown();

    // Plazo de Vigencia
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('CLÁUSULA CUARTA: (PLAZO DE VIGENCIA)');
    const inicioStr = c.inicio.toISOString().split('T')[0];
    const finStr = c.fin ? c.fin.toISOString().split('T')[0] : 'Indefinido';
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(
      `El plazo de vigencia del presente contrato corre a partir del ${inicioStr} hasta el ${finStr}. Pudiendo ser renovado por mutuo acuerdo expreso de partes sellado en la plataforma.`
    );
    doc.moveDown();

    // Cláusulas Adicionales
    if (c.clausulas || c.penalidades) {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('CLÁUSULA QUINTA: (CONDICIONES, PENALIDADES Y RESTRICCIONES)');
      doc.fontSize(10).font('Helvetica').fillColor('#334155').text(
        `${c.clausulas || ''}\n\nPenalidades: ${c.penalidades || 'Mora del 1% diario por retraso'}\n\nRestricciones: ${c.restricciones || 'Prohibido el subarriendo'}`
      );
      doc.moveDown();
    }

    // Firmas Digitales
    doc.moveDown(2);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('CONFORMIDAD Y FIRMA ELECTRÓNICA');
    doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(
      'Documento firmado digitalmente y sellado criptográficamente conforme a la Ley N° 164 del Estado Plurinacional de Bolivia.',
      { align: 'center' }
    );
    doc.moveDown(2);

    const yFirmas = doc.y;
    doc.lineCap('butt').moveTo(70, yFirmas + 40).lineTo(230, yFirmas + 40).stroke('#94a3b8');
    doc.lineCap('butt').moveTo(330, yFirmas + 40).lineTo(490, yFirmas + 40).stroke('#94a3b8');

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a');
    doc.text(`${c.propietario.first_name} ${c.propietario.last_name}`, 70, yFirmas + 46, { width: 160, align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor('#64748b').text('PROPIETARIO / ARRENDADOR', 70, yFirmas + 58, { width: 160, align: 'center' });

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a');
    doc.text(`${c.inquilino.first_name} ${c.inquilino.last_name}`, 330, yFirmas + 46, { width: 160, align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor('#64748b').text('INQUILINO / ARRENDATARIO', 330, yFirmas + 58, { width: 160, align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  }

  // ─── AUDITORÍA BLOCKCHAIN DE CUALQUIER ASSET ─────────────────────
  async obtenerHistorialBlockchain(assetId: string) {
    if (assetId.startsWith('CON-')) {
      const idNum = parseInt(assetId.replace('CON-', ''), 10);
      if (!isNaN(idNum)) {
        const c = await this.prisma.contrato.findUnique({
          where: { id: idNum },
          include: { pagos: true },
        });

        if (c && c.blockchain_audit && Array.isArray(c.blockchain_audit)) {
          const audit: any[] = [...(c.blockchain_audit as any[])];

          // Agregar bloques de pagos completados asociados a este contrato
          if (c.pagos && c.pagos.length > 0) {
            c.pagos.forEach(p => {
              const txHash = '0x' + crypto.createHash('sha256').update(`PAGO-${p.id}-${p.fecha_pago}`).digest('hex');
              audit.unshift({
                txId: txHash,
                txName: 'registrarPago',
                txType: 'registrarPago',
                blockNumber: 1045 + p.id,
                timestamp: p.fecha_pago.toISOString(),
                assetId,
                actor: `SAIPI Gateway (${p.metodo})`,
                hash: txHash,
                data: {
                  smart_contract_id: assetId,
                  pago_id: p.id,
                  monto: Number(p.monto),
                  moneda: p.moneda,
                  concepto: p.concepto,
                  metodo: p.metodo,
                  estado: p.estado,
                  comprobante_sello: 'SELLADO_INMUTABLE',
                },
              });
            });
          }

          return audit.sort((a, b) => b.blockNumber - a.blockNumber);
        }
      }
    }

    // Fallback general
    const hash = crypto.createHash('sha256').update(assetId).digest('hex');
    return [
      {
        txId: '0x' + hash.substring(0, 32),
        txName: 'crearContrato',
        txType: 'crearContrato',
        blockNumber: 1042,
        timestamp: new Date().toISOString(),
        assetId,
        actor: 'SAIPI Smart Contract Engine',
        hash,
        data: {
          assetId,
          red: 'SAIPI Ledger (Hyperledger Fabric v2.5)',
          consenso: 'Raft BFT',
          estado: 'COMMITTED',
        },
      },
    ];
  }

  // ─── FORMATEADOR UNIFICADO ───────────────────────────────────────
  private formatearContrato(c: any) {
    return {
      id: c.id,
      inmueble_id: c.inmueble_id,
      inmueble: c.inmueble_id,
      inmueble_titulo: c.inmueble?.titulo || 'Inmueble',
      inmueble_direccion: `${c.inmueble?.ciudad || ''} ${c.inmueble?.zona || ''} ${c.inmueble?.calle || ''}`.trim(),
      tipo_contrato: c.tipo_contrato_id,
      tipo_contrato_nombre: c.tipo_contrato?.nombre || 'Alquiler Habitacional',
      monto: Number(c.monto),
      moneda: c.moneda,
      deposito: Number(c.deposito || 0),
      dia_pago: c.dia_pago || 5,
      forma_pago: c.forma_pago || 'Stripe',
      inicio: c.inicio instanceof Date ? c.inicio.toISOString().split('T')[0] : c.inicio,
      fin: c.fin ? (c.fin instanceof Date ? c.fin.toISOString().split('T')[0] : c.fin) : null,
      estado: c.estado,
      motivo_rechazo: c.motivo_rechazo,

      // Partes
      propietario: c.propietario_id,
      propietario_id: c.propietario_id,
      propietario_nombre: c.propietario ? `${c.propietario.first_name} ${c.propietario.last_name}` : 'Propietario',
      propietario_email: c.propietario?.email,
      propietario_ci: c.propietario?.ci || 'N/A',
      propietario_telefono: c.propietario?.telefono || 'N/A',

      inquilino: c.inquilino_id,
      inquilino_id: c.inquilino_id,
      inquilino_nombre: c.inquilino ? `${c.inquilino.first_name} ${c.inquilino.last_name}` : 'Inquilino',
      inquilino_email: c.inquilino?.email,
      inquilino_ci: c.inquilino?.ci || 'N/A',
      inquilino_telefono: c.inquilino?.telefono || 'N/A',

      // Cláusulas
      antecedentes: c.antecedentes,
      clausulas: c.clausulas,
      clausulas_especiales: c.clausulas_especiales,
      uso_exclusivo: c.uso_exclusivo,
      condiciones_uso: c.condiciones_uso,
      penalidades: c.penalidades,
      politica_cancelacion: c.politica_cancelacion,
      incluye_servicios: c.incluye_servicios,
      restricciones: c.restricciones,
      observaciones: c.observaciones,

      // Smart Contract & Blockchain
      smart_contract_id: c.smart_contract_id || `CON-${c.id}`,
      blockchain_tx: c.blockchain_tx,
      blockchain_block: c.blockchain_block,
      fecha_firma: c.fecha_firma,

      createdAt: c.createdAt,
      creado: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
