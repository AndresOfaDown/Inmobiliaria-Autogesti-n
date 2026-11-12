const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  let tipo = await p.tipoContrato.findFirst();
  if (!tipo) {
    tipo = await p.tipoContrato.create({
      data: {
        nombre: 'Alquiler Habitacional',
        descripcion: 'Contrato estándar de arrendamiento de vivienda',
      },
    });
  }

  const count = await p.contrato.count();
  if (count === 0) {
    const timestamp = new Date().toISOString();
    const txId = '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
    const bloque = 1044;

    const evento = {
      txId,
      txName: 'crearContrato',
      txType: 'crearContrato',
      blockNumber: bloque,
      timestamp,
      actor: 'carlos@inmobiliaria.com',
      data: {
        smart_contract_id: 'CON-1',
        inmueble_id: 4,
        monto: 3500,
        moneda: 'BOB',
        inicio: '2026-11-01',
        fin: '2027-10-31',
        estado: 'enviado',
        red: 'SAIPI Ledger (Hyperledger Fabric v2.5)',
        consenso: 'Raft BFT',
      },
    };

    await p.contrato.create({
      data: {
        inmueble_id: 4,
        propietario_id: 2,
        inquilino_id: 6,
        tipo_contrato_id: tipo.id,
        monto: 3500,
        moneda: 'BOB',
        deposito: 3500,
        dia_pago: 5,
        forma_pago: 'Stripe',
        inicio: new Date('2026-11-01'),
        fin: new Date('2027-10-31'),
        estado: 'enviado',
        antecedentes: 'El PROPIETARIO es legítimo dueño del inmueble matriculado bajo Folio Real N° 7.01.1.01.0024987 verificado legalmente con IA.',
        clausulas: 'EL INQUILINO se compromete a cancelar el canon de arrendamiento mensual por adelantado hasta el 5to día de cada mes mediante la plataforma.',
        uso_exclusivo: 'Vivienda familiar unifamiliar exclusivamente.',
        condiciones_uso: 'Mantener las instalaciones sanitarias y eléctricas en perfecto estado.',
        penalidades: 'Interés por mora del 1% diario transcurridos 5 días de retraso.',
        politica_cancelacion: 'Preaviso obligatorio por escrito de 30 días calendario.',
        incluye_servicios: 'Expensas comunes y consumo de agua potable incluidos.',
        restricciones: 'Prohibido el subarrendamiento y la tenencia de sustancias peligrosas.',
        smart_contract_id: 'CON-1',
        blockchain_tx: txId,
        blockchain_block: bloque,
        blockchain_audit: [evento],
      },
    });
    console.log('Contrato CON-1 creado exitosamente en la BD');
  } else {
    console.log('Ya existen contratos en la BD');
  }
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
