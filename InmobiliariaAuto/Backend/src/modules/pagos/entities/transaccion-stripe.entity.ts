import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contrato } from '../../contratos/entities/contrato.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoOperacionStripe {
  ALQUILER = 'alquiler',
  DEPOSITO = 'deposito',
  MENSUALIDAD = 'mensualidad',
}

export enum EstadoStripe {
  PENDIENTE = 'pendiente',
  COMPLETADA = 'completada',
  FALLIDA = 'fallida',
  REEMBOLSADA = 'reembolsada',
}

@Entity('transacciones_stripe')
export class TransaccionStripe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contratoId: string;

  @ManyToOne(() => Contrato, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contratoId' })
  contrato: Contrato;

  @Column()
  pagadorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pagadorId' })
  pagador: Usuario;

  @Column()
  propietarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propietarioId' })
  propietario: Usuario;

  @Column({
    type: 'enum',
    enum: TipoOperacionStripe,
    default: TipoOperacionStripe.MENSUALIDAD,
  })
  tipoOperacion: TipoOperacionStripe;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto: number;

  @Column({ default: 'USD' })
  moneda: string;

  @Column({ nullable: true })
  stripeSessionId: string;

  @Column({ nullable: true })
  stripePaymentIntent: string;

  @Column({
    type: 'enum',
    enum: EstadoStripe,
    default: EstadoStripe.PENDIENTE,
  })
  estado: EstadoStripe;

  @Column({ nullable: true })
  comprobanteUrl: string;

  @Column({ nullable: true })
  blockchainTxId: string;

  @CreateDateColumn()
  creado: Date;

  @UpdateDateColumn()
  actualizado: Date;
}
