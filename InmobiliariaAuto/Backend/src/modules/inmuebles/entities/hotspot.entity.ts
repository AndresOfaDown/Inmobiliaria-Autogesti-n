import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inmueble } from './inmueble.entity';
import { Multimedia } from './multimedia.entity';

@Entity('hotspots')
export class Hotspot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inmuebleId: string;

  @ManyToOne(() => Inmueble, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inmuebleId' })
  inmueble: Inmueble;

  @Column()
  escenaOrigenId: string;

  @ManyToOne(() => Multimedia, (m) => m.hotspotsSalientes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'escenaOrigenId' })
  escenaOrigen: Multimedia;

  @Column()
  escenaDestinoId: string;

  @ManyToOne(() => Multimedia, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'escenaDestinoId' })
  escenaDestino: Multimedia;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  pitch: number; // -90 a 90

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  yaw: number; // -180 a 180

  @Column({ nullable: true })
  textoAyuda: string; // "Ir a Cocina", "Subir a Planta Alta"
}
