const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const tipo = await p.tipoContrato.findFirst();

  const count = await p.contrato.count();
  if (count <= 1) {
    const timestamp = new Date().toISOString();
    const txId = '0x8a91b2c3d4e5f601728394a5b6c7d8e9f0123456789abcdef0123456789abcde';
    const bloque = 1045;

    const evento = {
      txId,
      txName: 'crearContrato',
      txType: 'crearContrato',
      blockNumber: bloque,
      timestamp,
      actor: 'leonardo@inmueble.com',
      data: {
        smart_contract_id: 'CON-2',
        inmueble_id: 3,
        monto: 4200,
        moneda: 'BOB',
        inicio: '2026-12-01',
        fin: '2027-11-30',
        estado: 'enviado',
        red: 'SAIPI Ledger (Hyperledger Fabric v2.5)',
        consenso: 'Raft BFT',
      },
    };

    await p.contrato.create({
      data: {
        inmueble_id: 3,
        propietario_id: 6, // Leonardo como Propietario
        inquilino_id: 2,   // Carlos como Inquilino
        tipo_contrato_id: tipo ? tipo.id : 1,
        monto: 4200,
        moneda: 'BOB',
        deposito: 4200,
        dia_pago: 10,
        forma_pago: 'Stripe',
        inicio: new Date('2026-12-01'),
        fin: new Date('2027-11-30'),
        estado: 'enviado',
        antecedentes: 'El PROPIETARIO es titular con derecho propietario registrado bajo Folio Real verificado con sello Blockchain.',
        clausulas: 'EL INQUILINO se compromete a conservar las áreas verdes y pagar expensas.',
        uso_exclusivo: 'Vivienda unifamiliar.',
        condiciones_uso: 'Cuidado y mantenimiento general.',
        penalidades: '1% diario por mora tras 5 días.',
        politica_cancelacion: '30 días de anticipación.',
        incluye_servicios: 'Servicio de jardinería y expensas comunes.',
        restricciones: 'Subarrendamiento no permitido.',
        smart_contract_id: 'CON-2',
        blockchain_tx: txId,
        blockchain_block: bloque,
        blockchain_audit: [evento],
      },
    });
    console.log('Contrato CON-2 creado exitosamente en la BD');
  }
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
