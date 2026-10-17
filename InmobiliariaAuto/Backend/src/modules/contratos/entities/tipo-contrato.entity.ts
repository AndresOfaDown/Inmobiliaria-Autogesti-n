import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipos_contrato')
export class TipoContrato {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string; // Alquiler, Venta, Anticrético, Mixto

  @Column({ type: 'text', nullable: true })
  descripcion: string;
}
