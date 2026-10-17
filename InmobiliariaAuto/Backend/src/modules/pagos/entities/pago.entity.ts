import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Contrato } from '../../contratos/entities/contrato.entity';
import { TipoPago } from './tipo-pago.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetallePago } from './detalle-pago.entity';
import { HistorialPago } from './historial-pago.entity';
import { EstadoPago } from './pago.enum';

export { EstadoPago };

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contratoId: string;

  @ManyToOne(() => Contrato, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contratoId' })
  contrato: Contrato;

  @Column({ nullable: true })
  tipoPagoId: string;

  @ManyToOne(() => TipoPago, { nullable: true })
  @JoinColumn({ name: 'tipoPagoId' })
  tipoPago: TipoPago;

  @Column()
  usuarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ nullable: true })
  referencia: string;

  @Column({ nullable: true })
  comprobanteUrl: string;

  @Column({
    type: 'enum',
    enum: EstadoPago,
    default: EstadoPago.PENDIENTE,
  })
  estado: EstadoPago;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ nullable: true })
  blockchainTxId: string;

  @OneToMany(() => DetallePago, (d) => d.pago, { cascade: true })
  detalles: DetallePago[];

  @OneToMany(() => HistorialPago, (h) => h.pago, { cascade: true })
  historial: HistorialPago[];

  @CreateDateColumn()
  creado: Date;

  @UpdateDateColumn()
  actualizado: Date;
}
