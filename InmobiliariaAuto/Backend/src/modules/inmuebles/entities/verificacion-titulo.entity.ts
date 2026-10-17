import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inmueble } from './inmueble.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum EstadoVerificacion {
  PENDIENTE = 'pendiente',
  PROCESANDO = 'procesando',
  VERIFICADO = 'verificado',
  OBSERVADO = 'observado',
  RECHAZADO = 'rechazado',
}

@Entity('verificaciones_titulo')
export class VerificacionTitulo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inmuebleId: string;

  @ManyToOne(() => Inmueble, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inmuebleId' })
  inmueble: Inmueble;

  @Column()
  solicitadoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'solicitadoPorId' })
  solicitadoPor: Usuario;

  @Column()
  archivoTituloUrl: string;

  @Column({ type: 'text', nullable: true })
  textoOcr: string;

  @Column({ type: 'jsonb', nullable: true })
  resultadoIa: any;

  @Column({
    type: 'enum',
    enum: EstadoVerificacion,
    default: EstadoVerificacion.PENDIENTE,
  })
  estado: EstadoVerificacion;

  @Column({ type: 'int', default: 0 })
  scoreConfianza: number; // 0 a 100

  @Column({ type: 'text', nullable: true })
  resumenPublico: string;

  @Column({ nullable: true })
  hashCertificado: string; // Hash SHA-256

  @CreateDateColumn()
  creado: Date;

  @UpdateDateColumn()
  actualizado: Date;
}
