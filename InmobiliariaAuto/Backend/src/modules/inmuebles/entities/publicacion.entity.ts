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

export enum TipoOferta {
  ALQUILER = 'alquiler',
  VENTA = 'venta',
  ANTICRETICO = 'anticretico',
}

export enum EstadoPublicacion {
  BORRADOR = 'borrador',
  ACTIVA = 'activa',
  PAUSADA = 'pausada',
  FINALIZADA = 'finalizada',
}

@Entity('publicaciones')
export class Publicacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inmuebleId: string;

  @ManyToOne(() => Inmueble, (i) => i.publicaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inmuebleId' })
  inmueble: Inmueble;

  @Column({
    type: 'enum',
    enum: TipoOferta,
    default: TipoOferta.ALQUILER,
  })
  tipoOferta: TipoOferta;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precio: number;

  @Column({ default: 'USD' })
  moneda: string;

  @Column({
    type: 'enum',
    enum: EstadoPublicacion,
    default: EstadoPublicacion.ACTIVA,
  })
  estado: EstadoPublicacion;

  @CreateDateColumn()
  creado: Date;

  @UpdateDateColumn()
  actualizado: Date;
}
