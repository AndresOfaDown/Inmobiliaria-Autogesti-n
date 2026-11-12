const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const count = await p.chat.count();
  if (count === 0) {
    // Buscar o usar Carlos (id 2) y Leonardo (id 6)
    const carlos = await p.usuario.findUnique({ where: { email: 'carlos@inmobiliaria.com' } });
    const leonardo = await p.usuario.findUnique({ where: { email: 'leonardo@inmueble.com' } });

    if (carlos && leonardo) {
      const chat = await p.chat.create({
        data: {
          inmueble_id: 4,
          participante1_id: leonardo.id,
          participante2_id: carlos.id,
          ultimo_mensaje: 'Hola Carlos, me encantó el departamento. ¿Cuándo podría mudarme?',
          fecha_ultimo: new Date(),
        },
      });

      // Mensajes de la conversación
      await p.mensaje.createMany({
        data: [
          {
            chat_id: chat.id,
            remitente_id: leonardo.id,
            tipo: 'texto',
            contenido: 'Hola Carlos, estuve viendo el departamento en alquiler que publicaste en la plataforma.',
            createdAt: new Date(Date.now() - 3600000 * 2),
            leido: true,
          },
          {
            chat_id: chat.id,
            remitente_id: carlos.id,
            tipo: 'texto',
            contenido: '¡Hola Leonardo! Qué tal. Sí, está totalmente disponible y equipado con cerradura inteligente y recorrido 360°.',
            createdAt: new Date(Date.now() - 3600000 * 1.5),
            leido: true,
          },
          {
            chat_id: chat.id,
            remitente_id: leonardo.id,
            tipo: 'texto',
            contenido: 'Hola Carlos, me encantó el departamento. ¿Cuándo podría mudarme?',
            createdAt: new Date(Date.now() - 3600000 * 0.5),
            leido: false,
          },
        ],
      });

      console.log('Chat y mensajes iniciales creados exitosamente');
    }
  } else {
    console.log('Ya existen chats en la base de datos');
  }
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
