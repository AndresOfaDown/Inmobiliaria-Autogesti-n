import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { TipoInmueble } from './tipo-inmueble.entity';
import { Direccion } from './direccion.entity';
import { Multimedia } from './multimedia.entity';
import { Publicacion } from './publicacion.entity';

export enum EstadoInmueble {
  DISPONIBLE = 'disponible',
  OCUPADO = 'ocupado',
  MANTENIMIENTO = 'mantenimiento',
  RESERVADO = 'reservado',
  OCULTO = 'oculto',
}

@Entity('inmuebles')
export class Inmueble {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propietarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propietarioId' })
  propietario: Usuario;

  @Column()
  tipoId: string;

  @ManyToOne(() => TipoInmueble)
  @JoinColumn({ name: 'tipoId' })
  tipo: TipoInmueble;

  @Column({ nullable: true })
  direccionId: string;

  @OneToOne(() => Direccion, { cascade: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'direccionId' })
  direccion: Direccion;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  largo: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  ancho: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  superficie: number; // m2

  @Column({ type: 'int', default: 1 })
  habitaciones: number;

  @Column({ type: 'int', default: 1 })
  banos: number;

  @Column({ default: false })
  garaje: boolean;

  @Column({
    type: 'enum',
    enum: EstadoInmueble,
    default: EstadoInmueble.DISPONIBLE,
  })
  estado: EstadoInmueble;

  @Column({ nullable: true })
  gps: string; // "lat, lng"

  @Column({ nullable: true })
  modelo3dUrl: string; // .glb para AR

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  valorActivo: number; // valor catastral de referencia interno

  @Column({ nullable: true })
  hashBlockchain: string; // Hash SHA-256 de titularidad

  @OneToMany(() => Multimedia, (m) => m.inmueble, { cascade: true })
  multimedia: Multimedia[];

  @OneToMany(() => Publicacion, (p) => p.inmueble)
  publicaciones: Publicacion[];

  @CreateDateColumn()
  creado: Date;

  @UpdateDateColumn()
  actualizado: Date;
}
