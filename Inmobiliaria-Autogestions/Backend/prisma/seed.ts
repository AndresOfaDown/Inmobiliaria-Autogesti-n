import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // 1. Sembrar roles en la tabla 'roles'
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'admin' },
    update: { descripcion: 'Administrador' },
    create: {
      id: 1,
      nombre: 'admin',
      descripcion: 'Administrador',
    },
  });

  const rolUsuario = await prisma.rol.upsert({
    where: { nombre: 'usuario' },
    update: { descripcion: 'Usuario' },
    create: {
      id: 2,
      nombre: 'usuario',
      descripcion: 'Usuario',
    },
  });
  console.log(`✅ Roles listos en PostgreSQL: [1] ${rolAdmin.nombre}, [2] ${rolUsuario.nombre}`);

  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordUser = await bcrypt.hash('password123', 10);

  // 2. Crear o actualizar Administrador del sistema
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@inmobiliaria.com' },
    update: {
      rol_id: rolAdmin.id,
      activo: true,
    },
    create: {
      email: 'admin@inmobiliaria.com',
      password: passwordAdmin,
      first_name: 'Administrador',
      last_name: 'Principal',
      telefono: '70000000',
      ci: '1000001',
      rol_id: rolAdmin.id,
      activo: true,
    },
  });
  console.log(`✅ Administrador listo: ${admin.email} (rol_id: ${admin.rol_id})`);

  // 3. Crear o actualizar Usuario convencional (Dueño / Inquilino)
  const cliente = await prisma.usuario.upsert({
    where: { email: 'carlos@inmobiliaria.com' },
    update: {
      rol_id: rolUsuario.id,
      activo: true,
    },
    create: {
      email: 'carlos@inmobiliaria.com',
      password: passwordUser,
      first_name: 'Carlos',
      last_name: 'Perez',
      telefono: '77712345',
      ci: '6133314',
      rol_id: rolUsuario.id,
      activo: true,
    },
  });
  console.log(`✅ Usuario convencional (dueño/inquilino) listo: ${cliente.email} (rol_id: ${cliente.rol_id})`);

  // 4. Sembrar categorías / tipos de inmuebles iniciales
  const tipos = [
    { nombre: 'Casa', descripcion: 'Vivienda unifamiliar independiente' },
    { nombre: 'Departamento', descripcion: 'Unidad residencial en edificio o condominio' },
    { nombre: 'Terreno', descripcion: 'Lote o terreno para construcción o inversión' },
    { nombre: 'Oficina', descripcion: 'Espacio corporativo o profesional' },
    { nombre: 'Local Comercial', descripcion: 'Espacio para actividades comerciales y tiendas' },
  ];

  for (const t of tipos) {
    await prisma.tipoInmueble.upsert({
      where: { nombre: t.nombre },
      update: { descripcion: t.descripcion },
      create: { nombre: t.nombre, descripcion: t.descripcion },
    });
  }
  console.log('✅ Categorías de inmuebles listas (Casa, Departamento, Terreno, Oficina, Local Comercial)');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
