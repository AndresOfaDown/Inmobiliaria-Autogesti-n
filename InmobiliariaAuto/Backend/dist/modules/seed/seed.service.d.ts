import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { TipoInmueble } from '../inmuebles/entities/tipo-inmueble.entity';
import { TipoContrato } from '../contratos/entities/tipo-contrato.entity';
import { TipoPago } from '../pagos/entities/tipo-pago.entity';
import { ConfiguracionSistema } from '../pagos/entities/configuracion-sistema.entity';
import { PropertiesService } from '../inmuebles/properties.service';
import { ContractsService } from '../contratos/contracts.service';
import { PaymentsService } from '../pagos/payments.service';
export declare class SeedService implements OnApplicationBootstrap {
    private usersRepo;
    private tipoInmuebleRepo;
    private tipoContratoRepo;
    private tipoPagoRepo;
    private configRepo;
    private propertiesService;
    private contractsService;
    private paymentsService;
    private readonly logger;
    constructor(usersRepo: Repository<Usuario>, tipoInmuebleRepo: Repository<TipoInmueble>, tipoContratoRepo: Repository<TipoContrato>, tipoPagoRepo: Repository<TipoPago>, configRepo: Repository<ConfiguracionSistema>, propertiesService: PropertiesService, contractsService: ContractsService, paymentsService: PaymentsService);
    onApplicationBootstrap(): Promise<void>;
    private seedBaseCatalogs;
    private seedUsersAndProperties;
}
