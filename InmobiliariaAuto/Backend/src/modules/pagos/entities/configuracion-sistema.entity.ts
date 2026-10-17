import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('configuracion_sistema')
export class ConfiguracionSistema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.00 })
  porcentajeComisionPlataforma: number; // e.g. 5.00%

  @UpdateDateColumn()
  actualizado: Date;
}
