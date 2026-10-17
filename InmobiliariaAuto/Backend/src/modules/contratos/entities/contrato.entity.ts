import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Inmueble } from '../../inmuebles/entities/inmueble.entity';
import { TipoContrato } from './tipo-contrato.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Comision } from './comision.entity';

export enum EstadoContrato {
  BORRADOR = 'borrador',
  ENVIADO = 'enviado',
  ACEPTADO = 'aceptado',
  RECHAZADO = 'rechazado',
  ACTIVO = 'activo',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

@Entity('contratos')
export class Contrato {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inmuebleId: string;

  @ManyToOne(() => Inmueble, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inmuebleId' })
  inmueble: Inmueble;

  @Column()
  tipoContratoId: string;

  @ManyToOne(() => TipoContrato)
  @JoinColumn({ name: 'tipoContratoId' })
  tipoContrato: TipoContrato;

  @Column()
  inquilinoId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inquilinoId' })
  inquilino: Usuario;

  @Column({ nullable: true })
  chatId: string;

  @Column({ type: 'date' })
  inicio: Date;

  @Column({ type: 'date' })
  fin: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto: number;

  @Column({ default: 'USD' })
  moneda: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deposito: number; // Garantía

  @Column({ type: 'int', default: 5 })
  diaPago: number; // 1 - 28

  @Column({ default: 'Stripe' })
  formaPago: string;

  // Cláusulas legales
  @Column({ type: 'text', nullable: true })
  clausulas: string;

  @Column({ type: 'text', nullable: true })
  condicionesUso: string;

  @Column({ type: 'text', nullable: true })
  penalidades: string;

  @Column({ type: 'text', nullable: true })
  politicaCancelacion: string;

  @Column({ type: 'text', nullable: true })
  incluyeServicios: string;

  @Column({ type: 'text', nullable: true })
  restricciones: string;

  @Column({ type: 'text', nullable: true })
  antecedentes: string;

  @Column({ type: 'text', nullable: true })
  usoExclusivo: string;

  @Column({ type: 'text', nullable: true })
  clausulasEspeciales: string;

  @Column({
    type: 'enum',
    enum: EstadoContrato,
    default: EstadoContrato.BORRADOR,
  })
  estado: EstadoContrato;

  @Column({ nullable: true })
  motivoRechazo: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // Firmas electrónicas
  @Column({ type: 'text', nullable: true })
  firmaPropietario: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaFirmaPropietario: Date;

  @Column({ type: 'text', nullable: true })
  firmaInquilino: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaFirmaInquilino: Date;

  // Blockchain Ledger Sync
  @Column({ nullable: true })
  blockchainTxId: string;

  @Column({ nullable: true })
  blockchainHash: string;

  @Column({ type: 'int', nullable: true })
  blockchainBlockNumber: number;

  @OneToMany(() => Comision, (c) => c.contrato)
  comisiones: Comision[];

  @CreateDateColumn()
  creado: Date;

  @UpdateDateColumn()
  actualizado: Date;
}
