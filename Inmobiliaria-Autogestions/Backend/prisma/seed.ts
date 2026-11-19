import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando sembrado integral de datos para Producción...');

  // 1. ROLES
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'admin' },
    update: { descripcion: 'Administrador' },
    create: { id: 1, nombre: 'admin', descripcion: 'Administrador' },
  });

  const rolUsuario = await prisma.rol.upsert({
    where: { nombre: 'usuario' },
    update: { descripcion: 'Usuario' },
    create: { id: 2, nombre: 'usuario', descripcion: 'Usuario' },
  });
  console.log(`✅ Roles listos: [1] ${rolAdmin.nombre}, [2] ${rolUsuario.nombre}`);

  // 2. TIPOS DE CONTRATO
  const tiposContratoData = [
    { nombre: 'Alquiler Habitacional', descripcion: 'Contrato de arrendamiento para vivienda' },
    { nombre: 'Alquiler Comercial', descripcion: 'Contrato de arrendamiento para oficinas o comercio' },
    { nombre: 'Anticrético', descripcion: 'Contrato de anticresis con garantía hipotecaria' },
    { nombre: 'Venta Definitiva', descripcion: 'Contrato de compraventa de inmueble' },
  ];
  const tiposContratoMap: Record<string, number> = {};
  for (const tc of tiposContratoData) {
    const res = await prisma.tipoContrato.upsert({
      where: { nombre: tc.nombre },
      update: { descripcion: tc.descripcion },
      create: { nombre: tc.nombre, descripcion: tc.descripcion },
    });
    tiposContratoMap[tc.nombre] = res.id;
  }
  console.log('✅ Tipos de contrato listos.');

  // 3. USUARIOS
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordUser = await bcrypt.hash('password123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@inmobiliaria.com' },
    update: { rol_id: rolAdmin.id, activo: true },
    create: {
      email: 'admin@inmobiliaria.com',
      password: passwordAdmin,
      first_name: 'Administrador',
      last_name: 'Principal',
      telefono: '70000000',
      ci: '1000001',
      rol_id: rolAdmin.id,
      activo: true,
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
  });

  const carlos = await prisma.usuario.upsert({
    where: { email: 'carlos@inmobiliaria.com' },
    update: { rol_id: rolUsuario.id, activo: true },
    create: {
      email: 'carlos@inmobiliaria.com',
      password: passwordUser,
      first_name: 'Carlos',
      last_name: 'Perez',
      telefono: '77712345',
      ci: '6133314',
      rol_id: rolUsuario.id,
      activo: true,
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
  });

  const inquilino = await prisma.usuario.upsert({
    where: { email: 'inquilino@inmobiliaria.com' },
    update: { rol_id: rolUsuario.id, activo: true },
    create: {
      email: 'inquilino@inmobiliaria.com',
      password: passwordUser,
      first_name: 'María Laura',
      last_name: 'Flores',
      telefono: '76543210',
      ci: '8941203',
      rol_id: rolUsuario.id,
      activo: true,
      foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
  });

  const passwordLeo = await bcrypt.hash('12345678', 10);
  const leonardo = await prisma.usuario.upsert({
    where: { email: 'leonardo@inmueble.com' },
    update: { rol_id: rolAdmin.id, activo: true },
    create: {
      email: 'leonardo@inmueble.com',
      password: passwordLeo,
      first_name: 'Leonardo',
      last_name: 'Administrador',
      telefono: '78899001',
      ci: '61333148',
      rol_id: rolAdmin.id,
      activo: true,
    },
  });
  console.log(`✅ Usuarios listos: Admin (${admin.email}), Leonardo (${leonardo.email}), Propietario (${carlos.email}), Inquilino (${inquilino.email})`);

  // 4. TIPOS DE INMUEBLE
  const tiposData = [
    { nombre: 'Casa', descripcion: 'Vivienda unifamiliar independiente' },
    { nombre: 'Departamento', descripcion: 'Unidad residencial en edificio o condominio' },
    { nombre: 'Oficina', descripcion: 'Espacio corporativo o profesional' },
    { nombre: 'Terreno', descripcion: 'Lote o terreno para construcción o inversión' },
    { nombre: 'Local Comercial', descripcion: 'Espacio para actividades comerciales y tiendas' },
  ];

  const tiposMap: Record<string, number> = {};
  for (const t of tiposData) {
    const res = await prisma.tipoInmueble.upsert({
      where: { nombre: t.nombre },
      update: { descripcion: t.descripcion },
      create: { nombre: t.nombre, descripcion: t.descripcion },
    });
    tiposMap[t.nombre] = res.id;
  }
  console.log('✅ Categorías de inmuebles listas.');

  // LIMPIEZA IDEMPOTENTE DE REGISTROS PREVIOS
  console.log('🧹 Limpiando inmuebles y relaciones anteriores para refrescar...');
  await prisma.pago.deleteMany({});
  await prisma.reglaAccesoIoT.deleteMany({});
  await prisma.historialAccionIoT.deleteMany({});
  await prisma.contrato.deleteMany({});
  await prisma.dispositivoIoT.deleteMany({});
  await prisma.inmueble.deleteMany({});

  // 5. INMUEBLES CON FOTOS Y RECORRIDOS 360° COMPLETOS
  const inmueblesData = [
    // === VENTA 1: MANSIÓN CON RECORRIDO VIRTUAL 360° COMPLETO ===
    {
      titulo: 'Mansión Moderna en Urubó Golf',
      descripcion: 'Impresionante residencia con diseño contemporáneo, acabados en mármol, ventanales de doble altura, piscina infinita temperada y amplia galería churrasquera con vista panorámica a la vegetación. Cuenta con Recorrido Virtual 360° inmersivo en todas sus plantas.',
      tipo_id: tiposMap['Casa'],
      propietario_id: carlos.id,
      ciudad: 'Santa Cruz',
      zona: 'Urubó',
      calle: 'Av. Las Palmas, Condominio Los Tajibos #45',
      precio: 420000,
      tipo_oferta: 'venta',
      superficie: 650,
      habitaciones: 5,
      banos: 6,
      garaje: true,
      estado: 'disponible',
      verificacion_estado: 'verificado',
      verificacion_datos: {
        score_confianza: 99.2,
        resumen_publico: 'Folio Real 7.01.2.01.0049182 verificado ante DDRR. Sin gravámenes ni anotaciones preventivas.',
        resultado_ia: 'APROBADO_CON_ALTA_CONFIANZA',
        hash_bloque: '0000a89f91e7c5b201f98bc19582d49102837bc901a88b54823901bce47101ef',
        fecha_verificacion: new Date().toISOString(),
      },
      imagen_principal: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      multimedia: [
        { id: 1, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', principal: true, descripcion: 'Fachada Principal y Piscina' },
        { id: 2, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', principal: false, descripcion: 'Galería Social' },
        { id: 3, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', principal: false, descripcion: 'Interiores' },
        // Panoramas 360° interactivos interconectados con Hotspots 3D
        {
          id: 11,
          tipo: 'panorama360',
          archivo: '/pano_prueba.png',
          descripcion: 'Piso 1 | Sala Principal y Galería',
          orden: 1,
          hotspots: [
            { pitch: -2, yaw: 110, escena_destino: 12, texto_ayuda: 'Subir a Master Suite' },
            { pitch: -4, yaw: -65, escena_destino: 13, texto_ayuda: 'Ir a Dormitorio de Huéspedes' },
          ],
        },
        {
          id: 12,
          tipo: 'panorama360',
          archivo: '/pano_suite_balcon_prueba.png',
          descripcion: 'Piso 2 | Master Suite con Balcón Panorámico',
          orden: 2,
          hotspots: [
            { pitch: -5, yaw: -80, escena_destino: 11, texto_ayuda: 'Bajar a Sala Principal' },
          ],
        },
        {
          id: 13,
          tipo: 'panorama360',
          archivo: '/pano_habitacion_prueba.png',
          descripcion: 'Piso 1 | Dormitorio de Huéspedes',
          orden: 3,
          hotspots: [
            { pitch: -3, yaw: 40, escena_destino: 11, texto_ayuda: 'Volver a Sala Principal' },
          ],
        },
        // Música ambiental relajante para el modo VR
        {
          id: 21,
          tipo: 'musica',
          archivo: '/inspirar.mp3',
          descripcion: 'Música ambiental inmersiva',
        },
      ],
    },

    // === VENTA 2: PENTHOUSE EN CALACOTO ===
    {
      titulo: 'Penthouse Dúplex con Terraza y Vista al Illimani',
      descripcion: 'Exclusivo penthouse ubicado en la zona más residencial de Calacoto. Cuenta con chimenea ecológica, suite principal con jacuzzi y vestidor amplio, terraza privada con parrillero y domótica integrada.',
      tipo_id: tiposMap['Departamento'],
      propietario_id: carlos.id,
      ciudad: 'La Paz',
      zona: 'Calacoto',
      calle: 'Calle 15 de Calacoto, Edificio Las Cumbres Piso 14',
      precio: 285000,
      tipo_oferta: 'venta',
      superficie: 320,
      habitaciones: 4,
      banos: 5,
      garaje: true,
      estado: 'disponible',
      verificacion_estado: 'verificado',
      verificacion_datos: {
        score_confianza: 98.4,
        resumen_publico: 'Folio Real 2.01.1.02.0019284 verificado ante DDRR La Paz. Propietario con titularidad legítima.',
        resultado_ia: 'APROBADO_CON_ALTA_CONFIANZA',
        hash_bloque: '0000c14b82d991f82736184910283bcde1029384756182930491823746591023',
        fecha_verificacion: new Date().toISOString(),
      },
      imagen_principal: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      multimedia: [
        { id: 1, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', principal: true },
        { id: 2, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80', principal: false },
      ],
    },

    // === VENTA 3: RESIDENCIA EN TIQUIPAYA ===
    {
      titulo: 'Residencia Campestre Familiar en Tiquipaya',
      descripcion: 'Propiedad con microclima privilegiado rodeada de árboles frutales y jardines paisajísticos. Consta de 4 dormitorios, estar familiar, pozo de agua propio, sistema de riego automatizado y casa de huéspedes.',
      tipo_id: tiposMap['Casa'],
      propietario_id: carlos.id,
      ciudad: 'Cochabamba',
      zona: 'Tiquipaya',
      calle: 'Av. Ecológica Km 4.5 #120',
      precio: 198000,
      tipo_oferta: 'venta',
      superficie: 480,
      habitaciones: 4,
      banos: 4,
      garaje: true,
      estado: 'disponible',
      verificacion_estado: 'verificado',
      verificacion_datos: {
        score_confianza: 96.8,
        resumen_publico: 'Folio Real 3.01.4.03.0039182 verificado ante DDRR Quillacollo/Cochabamba. Estado libre de litigios.',
        resultado_ia: 'APROBADO_CON_ALTA_CONFIANZA',
        hash_bloque: '0000f89102384716293847162938471629384716293847162938471629384716',
        fecha_verificacion: new Date().toISOString(),
      },
      imagen_principal: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      multimedia: [
        { id: 1, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', principal: true },
        { id: 2, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', principal: false },
      ],
    },

    // === VENTA 4: TERRENO CRISTO REDENTOR ===
    {
      titulo: 'Terreno Estratégico Comercial en Av. Cristo Redentor',
      descripcion: 'Lote de terreno de 950 m² con frente de 22 metros sobre avenida de alto tráfico. Ideal para supermercado, torre mixta, concesionaria o clínica privada. Documentación totalmente al día.',
      tipo_id: tiposMap['Terreno'],
      propietario_id: carlos.id,
      ciudad: 'Santa Cruz',
      zona: 'Norte',
      calle: 'Av. Cristo Redentor entre 5to y 6to Anillo',
      precio: 350000,
      tipo_oferta: 'venta',
      superficie: 950,
      habitaciones: 0,
      banos: 0,
      garaje: false,
      estado: 'disponible',
      verificacion_estado: 'verificado',
      verificacion_datos: {
        score_confianza: 98.9,
        resumen_publico: 'Folio Real 7.01.1.01.0094821 validado. Plano de uso de suelo aprobado por la Alcaldía de Santa Cruz.',
        resultado_ia: 'APROBADO_CON_ALTA_CONFIANZA',
        hash_bloque: '0000491028374659182374659182374659182374659182374659182374659182',
        fecha_verificacion: new Date().toISOString(),
      },
      imagen_principal: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      multimedia: [
        { id: 1, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', principal: true },
      ],
    },

    // === ALQUILER 1: SMART LOFT CON RECORRIDO VIRTUAL 360° COMPLETO ===
    {
      titulo: 'Smart Loft Amoblado en Equipetrol Norte',
      descripcion: 'Loft de concepto abierto con domótica e IoT integrado. Cerradura inteligente Yale de última generación con acceso mediante app o PIN dinámico. Incluye internet de alta velocidad, smart TV 65", cocina equipada, balcón panorámico y Recorrido Virtual 360° en alta definición.',
      tipo_id: tiposMap['Departamento'],
      propietario_id: carlos.id,
      ciudad: 'Santa Cruz',
      zona: 'Equipetrol',
      calle: 'Calle Las Begonias #102, Edificio Smart Tower Piso 5',
      precio: 4200,
      tipo_oferta: 'alquiler',
      superficie: 88,
      habitaciones: 2,
      banos: 2,
      garaje: true,
      estado: 'disponible',
      verificacion_estado: 'verificado',
      verificacion_datos: {
        score_confianza: 98.7,
        resumen_publico: 'Verificado legalmente. Inmueble con contrato inteligente, cerradura IoT vinculada y Recorrido Virtual 360°.',
        resultado_ia: 'APROBADO_CON_ALTA_CONFIANZA',
        hash_bloque: '0000918237465918237465918237465918237465918237465918237465918237',
        fecha_verificacion: new Date().toISOString(),
      },
      imagen_principal: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      multimedia: [
        { id: 1, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', principal: true, descripcion: 'Vista General del Loft' },
        { id: 2, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', principal: false, descripcion: 'Living y Cocina Americana' },
        { id: 3, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', principal: false, descripcion: 'Dormitorio' },
        // Panoramas 360° interactivos interconectados con Hotspots 3D
        {
          id: 31,
          tipo: 'panorama360',
          archivo: '/pano_prueba.png',
          descripcion: 'Piso 1 | Sala de Estar y Cocina Integrada',
          orden: 1,
          hotspots: [
            { pitch: -2, yaw: 95, escena_destino: 32, texto_ayuda: 'Ir a Suite con Balcón' },
            { pitch: -3, yaw: -85, escena_destino: 33, texto_ayuda: 'Ir a Dormitorio 2' },
          ],
        },
        {
          id: 32,
          tipo: 'panorama360',
          archivo: '/pano_suite_balcon_prueba.png',
          descripcion: 'Piso 1 | Suite Principal con Balcón',
          orden: 2,
          hotspots: [
            { pitch: -5, yaw: -70, escena_destino: 31, texto_ayuda: 'Volver a Sala' },
          ],
        },
        {
          id: 33,
          tipo: 'panorama360',
          archivo: '/pano_cuarto_simple_prueba.png',
          descripcion: 'Piso 1 | Dormitorio 2 / Estudio',
          orden: 3,
          hotspots: [
            { pitch: -2, yaw: 50, escena_destino: 31, texto_ayuda: 'Volver a Sala' },
          ],
        },
        // Música ambiental lounge para el modo VR
        {
          id: 41,
          tipo: 'musica',
          archivo: '/musicadefondo.mp3',
          descripcion: 'Música ambiental lounge',
        },
      ],
    },

    // === ALQUILER 2: SOPOCACHI ===
    {
      titulo: 'Departamento Minimalista en Sopocachi',
      descripcion: 'Departamento muy soleado, piso de madera de ingeniería, cocina americana con mesones de cuarzo blanco, vista panorámica al valle de La Paz. Cerradura inteligente IoT y calefacción central.',
      tipo_id: tiposMap['Departamento'],
      propietario_id: carlos.id,
      ciudad: 'La Paz',
      zona: 'Sopocachi',
      calle: 'Av. 20 de Octubre esq. Guachalla, Torre Aurora Piso 8',
      precio: 3200,
      tipo_oferta: 'alquiler',
      superficie: 95,
      habitaciones: 2,
      banos: 2,
      garaje: true,
      estado: 'disponible',
      verificacion_estado: 'verificado',
      verificacion_datos: {
        score_confianza: 96.5,
        resumen_publico: 'Folio Real verificado. Sin observaciones legales.',
        resultado_ia: 'APROBADO_CON_ALTA_CONFIANZA',
        hash_bloque: '0000384716293847162938471629384716293847162938471629384716293847',
        fecha_verificacion: new Date().toISOString(),
      },
      imagen_principal: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80',
      multimedia: [
        { id: 1, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80', principal: true },
        { id: 2, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', principal: false },
      ],
    },

    // === ALQUILER 3: OFICINA TORRE PLATINUM ===
    {
      titulo: 'Oficina Corporativa Piso Alto en Torre Equipetrol',
      descripcion: 'Espacio de trabajo corporativo con divisiones de vidrio templado, sala de juntas ejecutiva, aire acondicionado central inverter, cableado estructurado categoría 6A y sistema de acceso biométrico IoT.',
      tipo_id: tiposMap['Oficina'],
      propietario_id: carlos.id,
      ciudad: 'Santa Cruz',
      zona: 'Equipetrol',
      calle: 'Av. San Martín esq. Calle 7, Torre Platinum Piso 11',
      precio: 5500,
      tipo_oferta: 'alquiler',
      superficie: 115,
      habitaciones: 3,
      banos: 2,
      garaje: true,
      estado: 'disponible',
      verificacion_estado: 'verificado',
      verificacion_datos: {
        score_confianza: 97.9,
        resumen_publico: 'Inmueble comercial verificado ante autoridades municipales y DDRR.',
        resultado_ia: 'APROBADO_CON_ALTA_CONFIANZA',
        hash_bloque: '0000716293847162938471629384716293847162938471629384716293847162',
        fecha_verificacion: new Date().toISOString(),
      },
      imagen_principal: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      multimedia: [
        { id: 1, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', principal: true },
        { id: 2, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80', principal: false },
      ],
    },

    // === ALQUILER 4: CASA LAS PALMAS ===
    {
      titulo: 'Casa Colonial Moderna en Barrio Las Palmas',
      descripcion: 'Hermosa casa que combina la arquitectura tradicional cruceña con comodidades modernas. Galerías con pilares de madera cuchi, jardín con palmeras, piscina privada y control de portón y cerradura inteligente IoT.',
      tipo_id: tiposMap['Casa'],
      propietario_id: carlos.id,
      ciudad: 'Santa Cruz',
      zona: 'Las Palmas',
      calle: 'Calle Las Azucenas #310',
      precio: 7500,
      tipo_oferta: 'alquiler',
      superficie: 380,
      habitaciones: 4,
      banos: 4,
      garaje: true,
      estado: 'disponible',
      verificacion_estado: 'verificado',
      verificacion_datos: {
        score_confianza: 99.1,
        resumen_publico: 'Título de propiedad perfecto verificado mediante OCR e Inteligencia Legal.',
        resultado_ia: 'APROBADO_CON_ALTA_CONFIANZA',
        hash_bloque: '0000847162938471629384716293847162938471629384716293847162938471',
        fecha_verificacion: new Date().toISOString(),
      },
      imagen_principal: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      multimedia: [
        { id: 1, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', principal: true },
        { id: 2, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', principal: false },
      ],
    },

    // === ANTICRÉTICO: QUERU QUERU ===
    {
      titulo: 'Departamento de Estilo Europeo en Queru Queru',
      descripcion: 'Exclusiva oferta en anticrético. Departamento con pisos entablonados, caldera propia, cocina equipada con despensa, 3 dormitorios en suite, 2 parqueos cubiertos y amplia baulera.',
      tipo_id: tiposMap['Departamento'],
      propietario_id: carlos.id,
      ciudad: 'Cochabamba',
      zona: 'Queru Queru',
      calle: 'Av. Pando esq. Portales, Condominio Jardines Piso 4',
      precio: 48000,
      tipo_oferta: 'anticretico',
      superficie: 145,
      habitaciones: 3,
      banos: 3,
      garaje: true,
      estado: 'disponible',
      verificacion_estado: 'verificado',
      verificacion_datos: {
        score_confianza: 98.6,
        resumen_publico: 'Folio Real libre de hipotecas. Inscripción preferente para contrato de anticrético garantizada.',
        resultado_ia: 'APROBADO_CON_ALTA_CONFIANZA',
        hash_bloque: '0000938471629384716293847162938471629384716293847162938471629384',
        fecha_verificacion: new Date().toISOString(),
      },
      imagen_principal: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      multimedia: [
        { id: 1, tipo: 'imagen', archivo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', principal: true },
      ],
    },
  ];

  const createdInmuebles: any[] = [];
  for (const item of inmueblesData) {
    const inm = await prisma.inmueble.create({
      data: item,
    });
    createdInmuebles.push(inm);
    const has360 = (item.multimedia as any[])?.some(m => m.tipo === 'panorama360');
    console.log(`🏠 Inmueble creado: [${inm.tipo_oferta.toUpperCase()}] ${inm.titulo} (${inm.ciudad}) - Id: ${inm.id} ${has360 ? '🧭 [TOUR 360° ACTIVO]' : ''}`);
  }

  // 6. CERRADURAS INTELIGENTES IOT PARA ALQUILERES
  const smartLoft = createdInmuebles.find((i) => i.titulo.includes('Smart Loft'));
  const casaPalmas = createdInmuebles.find((i) => i.titulo.includes('Las Palmas'));
  const deptoSopocachi = createdInmuebles.find((i) => i.titulo.includes('Sopocachi'));

  if (smartLoft) {
    await prisma.dispositivoIoT.create({
      data: {
        inmueble_id: smartLoft.id,
        nombre: 'Cerradura Inteligente Puerta Principal',
        tipo: 'cerradura',
        serial_id: `LOCK-LOFT-${smartLoft.id}`,
        marca: 'Yale SmartLock Assure 2',
        modelo: 'Touch + Wi-Fi / Bluetooth',
        ubicacion: 'Puerta Principal - Piso 5',
        estado_conexion: 'online',
        bateria: 94,
        bloqueado: true,
        codigo_maestro: '889900',
        configuracion: {
          auto_bloqueo_segundos: 10,
          notificar_apertura: true,
        },
      },
    });

    await prisma.dispositivoIoT.create({
      data: {
        inmueble_id: smartLoft.id,
        nombre: 'Sensor de Seguridad Ventana y Balcón',
        tipo: 'sensor_apertura',
        serial_id: `SENS-BALCON-${smartLoft.id}`,
        marca: 'Aqara Smart Sensor',
        modelo: 'Door & Window T1',
        ubicacion: 'Marco Balcón',
        estado_conexion: 'online',
        bateria: 100,
        bloqueado: true,
      },
    });
    console.log(`🔒 Dispositivos IoT creados para Smart Loft (Id: ${smartLoft.id})`);
  }

  if (casaPalmas) {
    await prisma.dispositivoIoT.create({
      data: {
        inmueble_id: casaPalmas.id,
        nombre: 'Cerradura Portón y Puerta de Entrada',
        tipo: 'cerradura',
        serial_id: `LOCK-PALMAS-${casaPalmas.id}`,
        marca: 'Schlage Encode Plus',
        modelo: 'WiFi Deadbolt Smart Lock',
        ubicacion: 'Entrada Principal',
        estado_conexion: 'online',
        bateria: 88,
        bloqueado: true,
        codigo_maestro: '112233',
      },
    });
    console.log(`🔒 Cerradura IoT creada para Casa Las Palmas (Id: ${casaPalmas.id})`);
  }

  if (deptoSopocachi) {
    await prisma.dispositivoIoT.create({
      data: {
        inmueble_id: deptoSopocachi.id,
        nombre: 'Cerradura Inteligente Departamental',
        tipo: 'cerradura',
        serial_id: `LOCK-SOPO-${deptoSopocachi.id}`,
        marca: 'Ultraloq U-Bolt Pro',
        modelo: 'Biométrica 6 en 1',
        ubicacion: 'Puerta Principal - Piso 8',
        estado_conexion: 'online',
        bateria: 91,
        bloqueado: true,
        codigo_maestro: '445566',
      },
    });
    console.log(`🔒 Cerradura IoT creada para Depto Sopocachi (Id: ${deptoSopocachi.id})`);
  }

  // 7. CONTRATO DE PRUEBA Y PAGOS PARA ACTIVAR FINANZAS Y BLOCKCHAIN
  if (smartLoft) {
    const contrato = await prisma.contrato.create({
      data: {
        inmueble_id: smartLoft.id,
        propietario_id: carlos.id,
        inquilino_id: inquilino.id,
        tipo_contrato_id: tiposContratoMap['Alquiler Habitacional'],
        monto: 4200,
        moneda: 'BOB',
        inicio: new Date('2026-11-01'),
        fin: new Date('2027-11-01'),
        dia_pago: 5,
        deposito: 4200,
        estado: 'activo',
        clausulas: 'Contrato inteligente de alquiler con cláusula modular y desbloqueo IoT automatizado.',
      },
    });

    const lock = await prisma.dispositivoIoT.findFirst({
      where: { inmueble_id: smartLoft.id, tipo: 'cerradura' },
    });
    if (lock) {
      await prisma.reglaAccesoIoT.create({
        data: {
          dispositivo_id: lock.id,
          usuario_id: inquilino.id,
          contrato_id: contrato.id,
          tipo_acceso: 'contrato',
          pin_codigo: '592814',
          fecha_inicio: contrato.inicio,
          fecha_fin: contrato.fin,
          estado: 'activo',
        },
      });

      await prisma.historialAccionIoT.create({
        data: {
          dispositivo_id: lock.id,
          usuario_id: inquilino.id,
          accion: 'desbloquear',
          metodo: 'app',
          resultado: 'exitoso',
          detalles: 'Apertura digital autorizada por Smart Contract vigente',
          ip: '18.218.252.15',
        },
      });
    }

    await prisma.pago.create({
      data: {
        inmueble_id: smartLoft.id,
        contrato_id: contrato.id,
        inquilino_id: inquilino.id,
        propietario_id: carlos.id,
        monto: 4200,
        comision_plataforma: 210,
        monto_neto: 3990,
        moneda: 'BOB',
        tipo: 'alquiler',
        metodo: 'qr',
        estado: 'completado',
        concepto: 'Pago Alquiler Noviembre 2026',
        transaccion_id: 'TRX-QR-2026-8841',
        fecha_pago: new Date(),
      },
    });

    console.log('✅ Contrato, regla IoT y Pago financiero de prueba creados exitosamente.');
  }

  console.log('🎉 ¡Sembrado de datos con Recorridos 360° finalizado con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
