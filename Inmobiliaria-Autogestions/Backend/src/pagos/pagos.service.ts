import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
      fecha_pago: p.fecha_pago,
      creado: p.createdAt,
      inmueble: p.inmueble ? { id: p.inmueble.id, titulo: p.inmueble.titulo, ciudad: p.inmueble.ciudad } : null,
      inquilino: p.inquilino ? `${p.inquilino.first_name} ${p.inquilino.last_name}` : 'Inquilino',
      propietario: p.propietario ? `${p.propietario.first_name} ${p.propietario.last_name}` : 'Propietario',
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
      inquilino: p.inquilino ? `${p.inquilino.first_name} ${p.inquilino.last_name}` : 'Inquilino General',
      propietario: p.propietario ? `${p.propietario.first_name} ${p.propietario.last_name}` : 'Propietario',
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
      filtros_aplicados: {
        anio,
        personal: esPersonal,
      },
    };
  }
}
