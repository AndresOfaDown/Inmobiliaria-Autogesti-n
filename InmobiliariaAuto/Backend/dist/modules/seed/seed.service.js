"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const usuario_entity_1 = require("../usuarios/entities/usuario.entity");
const tipo_inmueble_entity_1 = require("../inmuebles/entities/tipo-inmueble.entity");
const tipo_contrato_entity_1 = require("../contratos/entities/tipo-contrato.entity");
const tipo_pago_entity_1 = require("../pagos/entities/tipo-pago.entity");
const configuracion_sistema_entity_1 = require("../pagos/entities/configuracion-sistema.entity");
const properties_service_1 = require("../inmuebles/properties.service");
const multimedia_entity_1 = require("../inmuebles/entities/multimedia.entity");
const publicacion_entity_1 = require("../inmuebles/entities/publicacion.entity");
const contracts_service_1 = require("../contratos/contracts.service");
const payments_service_1 = require("../pagos/payments.service");
const transaccion_stripe_entity_1 = require("../pagos/entities/transaccion-stripe.entity");
let SeedService = SeedService_1 = class SeedService {
    constructor(usersRepo, tipoInmuebleRepo, tipoContratoRepo, tipoPagoRepo, configRepo, propertiesService, contractsService, paymentsService) {
        this.usersRepo = usersRepo;
        this.tipoInmuebleRepo = tipoInmuebleRepo;
        this.tipoContratoRepo = tipoContratoRepo;
        this.tipoPagoRepo = tipoPagoRepo;
        this.configRepo = configRepo;
        this.propertiesService = propertiesService;
        this.contractsService = contractsService;
        this.paymentsService = paymentsService;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onApplicationBootstrap() {
        this.logger.log('Iniciando verificación y siembra de datos iniciales...');
        await this.seedBaseCatalogs();
        await this.seedUsersAndProperties();
        this.logger.log('Siembra de datos completada exitosamente.');
    }
    async seedBaseCatalogs() {
        const tipos = ['Departamento', 'Casa', 'Oficina', 'Terreno', 'Local Comercial'];
        for (const t of tipos) {
            const exists = await this.tipoInmuebleRepo.findOne({ where: { nombre: t } });
            if (!exists) {
                await this.tipoInmuebleRepo.save(this.tipoInmuebleRepo.create({
                    nombre: t,
                    descripcion: `Inmueble tipo ${t} para uso residencial o comercial`,
                }));
            }
        }
        const contratos = ['Alquiler', 'Venta', 'Anticrético', 'Mixto'];
        for (const c of contratos) {
            const exists = await this.tipoContratoRepo.findOne({ where: { nombre: c } });
            if (!exists) {
                await this.tipoContratoRepo.save(this.tipoContratoRepo.create({
                    nombre: c,
                    descripcion: `Contrato legal de ${c} regulado civilmente`,
                }));
            }
        }
        const pagos = ['Stripe', 'Tarjeta de Débito/Crédito', 'Transferencia Bancaria', 'QR Interbancario', 'Efectivo'];
        for (const p of pagos) {
            const exists = await this.tipoPagoRepo.findOne({ where: { nombre: p } });
            if (!exists) {
                await this.tipoPagoRepo.save(this.tipoPagoRepo.create({ nombre: p, activo: true }));
            }
        }
        const conf = await this.configRepo.findOne({ where: {} });
        if (!conf) {
            await this.configRepo.save(this.configRepo.create({ porcentajeComisionPlataforma: 5.0 }));
        }
    }
    async seedUsersAndProperties() {
        let admin = await this.usersRepo.findOne({
            where: { email: 'admin@inmobiliaria.com' },
        });
        if (!admin) {
            const pass = await bcrypt.hash('admin123', 10);
            admin = await this.usersRepo.save(this.usersRepo.create({
                email: 'admin@inmobiliaria.com',
                password: pass,
                nombre: 'Administrador',
                apellido: 'Principal',
                rol: usuario_entity_1.RolUsuario.ADMIN,
                telefono: '+591 70011223',
                ci: '1029384 SC',
                direccion: 'Av. San Martín #150, Equipetrol',
                activo: true,
            }));
            this.logger.log('Usuario Admin creado: admin@inmobiliaria.com / admin123');
        }
        let propietario = await this.usersRepo.findOne({
            where: { email: 'carlos.propietario@gmail.com' },
        });
        if (!propietario) {
            const pass = await bcrypt.hash('user123', 10);
            propietario = await this.usersRepo.save(this.usersRepo.create({
                email: 'carlos.propietario@gmail.com',
                password: pass,
                nombre: 'Carlos',
                apellido: 'Méndez Suárez',
                rol: usuario_entity_1.RolUsuario.USUARIO,
                telefono: '+591 76543210',
                ci: '5849201 LP',
                direccion: 'Zona Sur, Calacoto Calle 15',
                fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                activo: true,
            }));
            this.logger.log('Usuario Propietario creado: carlos.propietario@gmail.com / user123');
        }
        let inquilino = await this.usersRepo.findOne({
            where: { email: 'lucia.inquilino@gmail.com' },
        });
        if (!inquilino) {
            const pass = await bcrypt.hash('user123', 10);
            inquilino = await this.usersRepo.save(this.usersRepo.create({
                email: 'lucia.inquilino@gmail.com',
                password: pass,
                nombre: 'Lucía',
                apellido: 'Flores Valdivia',
                rol: usuario_entity_1.RolUsuario.USUARIO,
                telefono: '+591 71234567',
                ci: '8392014 CB',
                direccion: 'Sopocachi, Calle Aspiazu #400',
                fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                activo: true,
            }));
            this.logger.log('Usuario Inquilino creado: lucia.inquilino@gmail.com / user123');
        }
        const existingProps = await this.propertiesService.searchProperties({});
        if (existingProps.length === 0) {
            const tipoDepto = await this.tipoInmuebleRepo.findOne({
                where: { nombre: 'Departamento' },
            });
            const tipoCasa = await this.tipoInmuebleRepo.findOne({
                where: { nombre: 'Casa' },
            });
            const prop1 = await this.propertiesService.createProperty(propietario.id, {
                tipoId: tipoDepto.id,
                titulo: 'Penthouse de Lujo Equipetrol con Vista Panorámica',
                descripcion: 'Espectacular penthouse con acabados italianos de primera, ventanales de piso a techo, terraza privada con jacuzzi, domótica inteligente y seguridad 24/7. Incluye recorrido inmersivo 360° y visualización AR 3D.',
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
                    tipoOferta: publicacion_entity_1.TipoOferta.ALQUILER,
                    precio: 1250,
                    moneda: 'USD',
                },
                multimedia: [
                    {
                        tipo: multimedia_entity_1.TipoMultimedia.IMAGEN,
                        archivoUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
                        descripcion: 'Fachada y Vista Panorámica',
                        principal: true,
                        orden: 0,
                    },
                    {
                        tipo: multimedia_entity_1.TipoMultimedia.IMAGEN,
                        archivoUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
                        descripcion: 'Living Comedor Principal',
                        principal: false,
                        orden: 1,
                    },
                    {
                        tipo: multimedia_entity_1.TipoMultimedia.PANORAMA360,
                        archivoUrl: 'https://pannellum.org/images/alma.jpg',
                        descripcion: 'Sala de Estar Principal (Visor 360°)',
                        principal: false,
                        orden: 2,
                    },
                    {
                        tipo: multimedia_entity_1.TipoMultimedia.PANORAMA360,
                        archivoUrl: 'https://pannellum.org/images/bma-0.jpg',
                        descripcion: 'Terraza y Balcón Mirador (Visor 360°)',
                        principal: false,
                        orden: 3,
                    },
                ],
            });
            const media360 = prop1.multimedia.filter((m) => m.tipo === multimedia_entity_1.TipoMultimedia.PANORAMA360);
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
            await this.propertiesService.requestTitleVerification(prop1.id, propietario.id, 'https://example.com/folio-real-prop1.pdf', 'FOLIO REAL MATRICULA 7.01.1.99.0012345. TITULAR: CARLOS MENDEZ SUAREZ. ESTADO: CANCELACION TOTAL DE HIPOTECA. LIBRE DE GRAVAMENES, LITIGIOS O EMBARGOS.');
            await this.propertiesService.createProperty(propietario.id, {
                tipoId: tipoCasa.id,
                titulo: 'Residencia Minimalista con Jardín y Parrillero - Calacoto',
                descripcion: 'Elegante casa de diseño contemporáneo ubicada en el corazón de Calacoto. Cuenta con 4 suites, cocina gourmet con isla de granito, amplio jardín privado, chimenea a gas y garaje para 3 vehículos.',
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
                    tipoOferta: publicacion_entity_1.TipoOferta.VENTA,
                    precio: 295000,
                    moneda: 'USD',
                },
                multimedia: [
                    {
                        tipo: multimedia_entity_1.TipoMultimedia.IMAGEN,
                        archivoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
                        descripcion: 'Fachada Principal y Jardín',
                        principal: true,
                        orden: 0,
                    },
                    {
                        tipo: multimedia_entity_1.TipoMultimedia.PANORAMA360,
                        archivoUrl: 'https://pannellum.org/images/cerro-toco-0.jpg',
                        descripcion: 'Jardín y Área Social 360°',
                        principal: false,
                        orden: 1,
                    },
                ],
            });
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
            await this.contractsService.signContract(demoContract.id, propietario.id, 'DATA_SIGNATURE_BASE64_PROPIETARIO_CARLOS_MENDEZ_HASH_SECURE');
            await this.contractsService.signContract(demoContract.id, inquilino.id, 'DATA_SIGNATURE_BASE64_INQUILINO_LUCIA_FLORES_HASH_SECURE');
            const checkout = await this.paymentsService.createStripeCheckoutSession({
                contratoId: demoContract.id,
                pagadorId: inquilino.id,
                tipoOperacion: transaccion_stripe_entity_1.TipoOperacionStripe.ALQUILER,
                monto: 1250,
                moneda: 'USD',
                concepto: 'Primer mes de alquiler anticipado + Certificación Blockchain',
            });
            await this.paymentsService.confirmPayment(checkout.sessionId);
            this.logger.log('Contrato y pago demo creados y auditados en el Blockchain Ledger!');
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(tipo_inmueble_entity_1.TipoInmueble)),
    __param(2, (0, typeorm_1.InjectRepository)(tipo_contrato_entity_1.TipoContrato)),
    __param(3, (0, typeorm_1.InjectRepository)(tipo_pago_entity_1.TipoPago)),
    __param(4, (0, typeorm_1.InjectRepository)(configuracion_sistema_entity_1.ConfiguracionSistema)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        properties_service_1.PropertiesService,
        contracts_service_1.ContractsService,
        payments_service_1.PaymentsService])
], SeedService);
//# sourceMappingURL=seed.service.js.map