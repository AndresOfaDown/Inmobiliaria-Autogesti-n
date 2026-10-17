import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contrato } from './contrato.entity';

@Entity('comisiones')
export class Comision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contratoId: string;

  @ManyToOne(() => Contrato, (c) => c.comisiones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contratoId' })
  contrato: Contrato;

  @Column({ nullable: true })
  pagoId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  porcentaje: number; // e.g. 5.00 %

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ default: false })
  pagada: boolean;

  @Column({ nullable: true })
  descripcion: string;

  @CreateDateColumn()
  creado: Date;
}
