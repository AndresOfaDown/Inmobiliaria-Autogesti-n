import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pago } from './pago.entity';

@Entity('detalles_pago')
export class DetallePago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pagoId: string;

  @ManyToOne(() => Pago, (p) => p.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pagoId' })
  pago: Pago;

  @Column()
  concepto: string; // ej. "Mensualidad Mayo", "Garantía", "Multa"

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto: number;
}
