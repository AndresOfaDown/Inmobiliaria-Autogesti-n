const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const count = await p.dispositivoIoT.count();
  if (count === 0) {
    // 1. Dispositivo 1: Cerradura Inteligente en Inmueble 4
    const lock1 = await p.dispositivoIoT.create({
      data: {
        inmueble_id: 4,
        nombre: 'Cerradura Inteligente Puerta Principal',
        tipo: 'cerradura',
        serial_id: 'LOCK-DEPTO-401',
        marca: 'Yale SmartLock Assure 2',
        modelo: 'Touch + Wi-Fi / Bluetooth',
        ubicacion: 'Puerta Principal - Piso 1',
        estado_conexion: 'online',
        bateria: 92,
        bloqueado: true,
        codigo_maestro: '889900',
        configuracion: {
          auto_bloqueo_segundos: 10,
          notificar_apertura: true,
          alarma_forzado: true,
        },
      },
    });

    // 2. Dispositivo 2: Sensor de Apertura en Inmueble 4
    const sensor1 = await p.dispositivoIoT.create({
      data: {
        inmueble_id: 4,
        nombre: 'Sensor de Apertura y Seguridad',
        tipo: 'sensor_apertura',
        serial_id: 'SENS-DOOR-401',
        marca: 'Aqara Smart Sensor',
        modelo: 'Door & Window T1',
        ubicacion: 'Marco de Puerta Principal',
        estado_conexion: 'online',
        bateria: 100,
        bloqueado: true,
        configuracion: {
          sensibilidad: 'alta',
        },
      },
    });

    // 3. Dispositivo 3: Cerradura en Inmueble 3 (Casa Toborochi)
    const lock2 = await p.dispositivoIoT.create({
      data: {
        inmueble_id: 3,
        nombre: 'Cerradura Portón de Entrada',
        tipo: 'cerradura',
        serial_id: 'LOCK-CASA-301',
        marca: 'Schlage Encode Plus',
        modelo: 'WiFi Deadbolt Smart Lock',
        ubicacion: 'Entrada Principal',
        estado_conexion: 'online',
        bateria: 85,
        bloqueado: true,
        codigo_maestro: '112233',
      },
    });

    // 4. Regla de Acceso ligada al Contrato CON-1 para el Inquilino (usuario id 6)
    const contrato1 = await p.contrato.findFirst({ where: { smart_contract_id: 'CON-1' } });
    if (contrato1) {
      await p.reglaAccesoIoT.create({
        data: {
          dispositivo_id: lock1.id,
          usuario_id: contrato1.inquilino_id,
          contrato_id: contrato1.id,
          tipo_acceso: 'contrato',
          pin_codigo: '749201',
          fecha_inicio: contrato1.inicio,
          fecha_fin: contrato1.fin,
          estado: 'activo',
        },
      });

      // Registro inicial de prueba en historial
      await p.historialAccionIoT.create({
        data: {
          dispositivo_id: lock1.id,
          usuario_id: contrato1.inquilino_id,
          accion: 'desbloquear',
          metodo: 'app',
          resultado: 'exitoso',
          detalles: 'Apertura digital autorizada por Smart Contract CON-1 activo',
          ip: '190.181.42.10',
        },
      });
    }

    console.log('Dispositivos IoT y Reglas de acceso iniciales creados exitosamente');
  } else {
    console.log('Ya existen dispositivos IoT en la base de datos');
  }
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
