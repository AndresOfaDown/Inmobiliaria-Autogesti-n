import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { TipoInmueble } from '../inmuebles/entities/tipo-inmueble.entity';
import { TipoContrato } from '../contratos/entities/tipo-contrato.entity';
import { TipoPago } from '../pagos/entities/tipo-pago.entity';
import { ConfiguracionSistema } from '../pagos/entities/configuracion-sistema.entity';
import { PropertiesService } from '../inmuebles/properties.service';
import { TipoMultimedia } from '../inmuebles/entities/multimedia.entity';
import { TipoOferta } from '../inmuebles/entities/publicacion.entity';
import { ContractsService } from '../contratos/contracts.service';
import { PaymentsService } from '../pagos/payments.service';
import { TipoOperacionStripe } from '../pagos/entities/transaccion-stripe.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Usuario)
    private usersRepo: Repository<Usuario>,
    @InjectRepository(TipoInmueble)
    private tipoInmuebleRepo: Repository<TipoInmueble>,
    @InjectRepository(TipoContrato)
    private tipoContratoRepo: Repository<TipoContrato>,
    @InjectRepository(TipoPago)
    private tipoPagoRepo: Repository<TipoPago>,
    @InjectRepository(ConfiguracionSistema)
    private configRepo: Repository<ConfiguracionSistema>,

    private propertiesService: PropertiesService,
    private contractsService: ContractsService,
    private paymentsService: PaymentsService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Iniciando verificación y siembra de datos iniciales...');
    await this.seedBaseCatalogs();
    await this.seedUsersAndProperties();
    this.logger.log('Siembra de datos completada exitosamente.');
  }

  private async seedBaseCatalogs() {
    // 1. Tipos de Inmueble
    const tipos = ['Departamento', 'Casa', 'Oficina', 'Terreno', 'Local Comercial'];
    for (const t of tipos) {
      const exists = await this.tipoInmuebleRepo.findOne({ where: { nombre: t } });
      if (!exists) {
        await this.tipoInmuebleRepo.save(
          this.tipoInmuebleRepo.create({
            nombre: t,
            descripcion: `Inmueble tipo ${t} para uso residencial o comercial`,
          }),
        );
      }
    }

    // 2. Tipos de Contrato
    const contratos = ['Alquiler', 'Venta', 'Anticrético', 'Mixto'];
    for (const c of contratos) {
      const exists = await this.tipoContratoRepo.findOne({ where: { nombre: c } });
      if (!exists) {
        await this.tipoContratoRepo.save(
          this.tipoContratoRepo.create({
            nombre: c,
            descripcion: `Contrato legal de ${c} regulado civilmente`,
          }),
        );
      }
    }

    // 3. Tipos de Pago
    const pagos = ['Stripe', 'Tarjeta de Débito/Crédito', 'Transferencia Bancaria', 'QR Interbancario', 'Efectivo'];
    for (const p of pagos) {
      const exists = await this.tipoPagoRepo.findOne({ where: { nombre: p } });
      if (!exists) {
        await this.tipoPagoRepo.save(
          this.tipoPagoRepo.create({ nombre: p, activo: true }),
        );
      }
    }

    // 4. Configuración Sistema
    const conf = await this.configRepo.findOne({ where: {} });
    if (!conf) {
      await this.configRepo.save(
        this.configRepo.create({ porcentajeComisionPlataforma: 5.0 }),
      );
    }
  }

  private async seedUsersAndProperties() {
    // 1. Admin
    let admin = await this.usersRepo.findOne({
      where: { email: 'admin@inmobiliaria.com' },
    });
    if (!admin) {
      const pass = await bcrypt.hash('admin123', 10);
      admin = await this.usersRepo.save(
        this.usersRepo.create({
          email: 'admin@inmobiliaria.com',
          password: pass,
          nombre: 'Administrador',
          apellido: 'Principal',
          rol: RolUsuario.ADMIN,
          telefono: '+591 70011223',
          ci: '1029384 SC',
          direccion: 'Av. San Martín #150, Equipetrol',
          activo: true,
        }),
      );
      this.logger.log('Usuario Admin creado: admin@inmobiliaria.com / admin123');
    }

    // 2. Propietario Demo (Carlos Méndez)
    let propietario = await this.usersRepo.findOne({
      where: { email: 'carlos.propietario@gmail.com' },
    });
    if (!propietario) {
      const pass = await bcrypt.hash('user123', 10);
      propietario = await this.usersRepo.save(
        this.usersRepo.create({
          email: 'carlos.propietario@gmail.com',
          password: pass,
          nombre: 'Carlos',
          apellido: 'Méndez Suárez',
          rol: RolUsuario.USUARIO,
          telefono: '+591 76543210',
          ci: '5849201 LP',
          direccion: 'Zona Sur, Calacoto Calle 15',
          fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          activo: true,
        }),
      );
      this.logger.log('Usuario Propietario creado: carlos.propietario@gmail.com / user123');
    }

    // 3. Inquilino Demo (Lucía Flores)
    let inquilino = await this.usersRepo.findOne({
      where: { email: 'lucia.inquilino@gmail.com' },
    });
    if (!inquilino) {
      const pass = await bcrypt.hash('user123', 10);
      inquilino = await this.usersRepo.save(
        this.usersRepo.create({
          email: 'lucia.inquilino@gmail.com',
          password: pass,
          nombre: 'Lucía',
          apellido: 'Flores Valdivia',
          rol: RolUsuario.USUARIO,
          telefono: '+591 71234567',
          ci: '8392014 CB',
          direccion: 'Sopocachi, Calle Aspiazu #400',
          fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          activo: true,
        }),
      );
      this.logger.log('Usuario Inquilino creado: lucia.inquilino@gmail.com / user123');
    }

    // 4. Inmuebles Demo
    const existingProps = await this.propertiesService.searchProperties({});
    if (existingProps.length === 0) {
      const tipoDepto = await this.tipoInmuebleRepo.findOne({
        where: { nombre: 'Departamento' },
      });
      const tipoCasa = await this.tipoInmuebleRepo.findOne({
        where: { nombre: 'Casa' },
      });

      // Inmueble 1: Penthouse Equipetrol con Visor 360 y Modelo 3D AR
      const prop1 = await this.propertiesService.createProperty(propietario.id, {
        tipoId: tipoDepto.id,
        titulo: 'Penthouse de Lujo Equipetrol con Vista Panorámica',
        descripcion:
          'Espectacular penthouse con acabados italianos de primera, ventanales de piso a techo, terraza privada con jacuzzi, domótica inteligente y seguridad 24/7. Incluye recorrido inmersivo 360° y visualización AR 3D.',
        superficie: 210,
        largo: 15,
        ancho: 14,
        habitaciones: 3,
        banos: 3,
        garaje: true,
        gps: '-17.7689, -63.1950',
        modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb',
        valorActivo: 240000,
        direccion: {
          ciudad: 'Santa Cruz',
          zona: 'Equipetrol Norte',
          calle: 'Calle Los Cusis esq. Av. San Martín',
          referencia: 'Edificio Sky Tower, Piso 18',
          latitud: -17.7689,
          longitud: -63.195,
        },
        publicacion: {
          tipoOferta: TipoOferta.ALQUILER,
          precio: 1250,
          moneda: 'USD',
        },
        multimedia: [
          {
            tipo: TipoMultimedia.IMAGEN,
            archivoUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
            descripcion: 'Fachada y Vista Panorámica',
            principal: true,
            orden: 0,
          },
          {
            tipo: TipoMultimedia.IMAGEN,
            archivoUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
            descripcion: 'Living Comedor Principal',
            principal: false,
            orden: 1,
          },
          {
            tipo: TipoMultimedia.PANORAMA360,
            archivoUrl: 'https://pannellum.org/images/alma.jpg',
            descripcion: 'Sala de Estar Principal (Visor 360°)',
            principal: false,
            orden: 2,
          },
          {
            tipo: TipoMultimedia.PANORAMA360,
            archivoUrl: 'https://pannellum.org/images/bma-0.jpg',
            descripcion: 'Terraza y Balcón Mirador (Visor 360°)',
            principal: false,
            orden: 3,
          },
        ],
      });

      // Configurar Hotspot 360 interactivo entre escenas
      const media360 = prop1.multimedia.filter(
        (m) => m.tipo === TipoMultimedia.PANORAMA360,
      );
      if (media360.length >= 2) {
        await this.propertiesService.addHotspot({
          inmuebleId: prop1.id,
          escenaOrigenId: media360[0].id,
          escenaDestinoId: media360[1].id,
          pitch: -5.0,
          yaw: 110.0,
          textoAyuda: 'Salir a la Terraza y Mirador 360°',
        });
        await this.propertiesService.addHotspot({
          inmuebleId: prop1.id,
          escenaOrigenId: media360[1].id,
          escenaDestinoId: media360[0].id,
          pitch: 2.0,
          yaw: -80.0,
          textoAyuda: 'Volver a la Sala de Estar',
        });
      }

      // Verificación Legal Automatizada
      await this.propertiesService.requestTitleVerification(
        prop1.id,
        propietario.id,
        'https://example.com/folio-real-prop1.pdf',
        'FOLIO REAL MATRICULA 7.01.1.99.0012345. TITULAR: CARLOS MENDEZ SUAREZ. ESTADO: CANCELACION TOTAL DE HIPOTECA. LIBRE DE GRAVAMENES, LITIGIOS O EMBARGOS.',
      );

      // Inmueble 2: Residencia de Lujo con Jardín - Calacoto La Paz
      await this.propertiesService.createProperty(propietario.id, {
        tipoId: tipoCasa.id,
        titulo: 'Residencia Minimalista con Jardín y Parrillero - Calacoto',
        descripcion:
          'Elegante casa de diseño contemporáneo ubicada en el corazón de Calacoto. Cuenta con 4 suites, cocina gourmet con isla de granito, amplio jardín privado, chimenea a gas y garaje para 3 vehículos.',
        superficie: 380,
        habitaciones: 4,
        banos: 5,
        garaje: true,
        gps: '-16.5398, -68.0844',
        modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
        valorActivo: 320000,
        direccion: {
          ciudad: 'La Paz',
          zona: 'Calacoto',
          calle: 'Calle 18 esquina Julio Patiño',
          referencia: 'A dos cuadras del Club Alemán',
          latitud: -16.5398,
          longitud: -68.0844,
        },
        publicacion: {
          tipoOferta: TipoOferta.VENTA,
          precio: 295000,
          moneda: 'USD',
        },
        multimedia: [
          {
            tipo: TipoMultimedia.IMAGEN,
            archivoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
            descripcion: 'Fachada Principal y Jardín',
            principal: true,
            orden: 0,
          },
          {
            tipo: TipoMultimedia.PANORAMA360,
            archivoUrl: 'https://pannellum.org/images/cerro-toco-0.jpg',
            descripcion: 'Jardín y Área Social 360°',
            principal: false,
            orden: 1,
          },
        ],
      });

      // Crear Contrato Demo activo con firmas y auditoría Blockchain
      const tipoContratoAlquiler = await this.tipoContratoRepo.findOne({
        where: { nombre: 'Alquiler' },
      });

      const demoContract = await this.contractsService.createContract({
        inmuebleId: prop1.id,
        tipoContratoId: tipoContratoAlquiler.id,
        inquilinoId: inquilino.id,
        inicio: new Date('2026-03-01'),
        fin: new Date('2027-02-28'),
        monto: 1250,
        moneda: 'USD',
        deposito: 1250,
        diaPago: 5,
        formaPago: 'Stripe',
        clausulas: 'CONTRATO DE ARRENDAMIENTO RESIDENCIAL CERTIFICADO DIGITALMENTE...',
        condicionesUso: 'Uso exclusivamente habitacional sin subarriendo.',
        penalidades: '1% diario por mora tras el día 5.',
        politicaCancelacion: 'Preaviso de 60 días.',
      });

      // Firmar por ambas partes (Dispara evento Blockchain y activa contrato)
      await this.contractsService.signContract(
        demoContract.id,
        propietario.id,
        'DATA_SIGNATURE_BASE64_PROPIETARIO_CARLOS_MENDEZ_HASH_SECURE',
      );
      await this.contractsService.signContract(
        demoContract.id,
        inquilino.id,
        'DATA_SIGNATURE_BASE64_INQUILINO_LUCIA_FLORES_HASH_SECURE',
      );

      // Crear primer pago y confirmarlo en Blockchain
      const checkout = await this.paymentsService.createStripeCheckoutSession({
        contratoId: demoContract.id,
        pagadorId: inquilino.id,
        tipoOperacion: TipoOperacionStripe.ALQUILER,
        monto: 1250,
        moneda: 'USD',
        concepto: 'Primer mes de alquiler anticipado + Certificación Blockchain',
      });

      await this.paymentsService.confirmPayment(checkout.sessionId);
      this.logger.log('Contrato y pago demo creados y auditados en el Blockchain Ledger!');
    }
  }
}
