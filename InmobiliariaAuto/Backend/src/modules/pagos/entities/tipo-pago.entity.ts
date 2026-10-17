import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipos_pago')
export class TipoPago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string; // Stripe, Tarjeta, Efectivo, QR, Transferencia

  @Column({ default: true })
  activo: boolean;
}
