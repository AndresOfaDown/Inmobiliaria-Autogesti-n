import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Inmueble } from './inmueble.entity';
import { Hotspot } from './hotspot.entity';

export enum TipoMultimedia {
  IMAGEN = 'imagen',
  VIDEO = 'video',
  PANORAMA360 = 'panorama360',
  MUSICA = 'musica',
}

@Entity('multimedia')
export class Multimedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inmuebleId: string;

  @ManyToOne(() => Inmueble, (i) => i.multimedia, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inmuebleId' })
  inmueble: Inmueble;

  @Column({
    type: 'enum',
    enum: TipoMultimedia,
    default: TipoMultimedia.IMAGEN,
  })
  tipo: TipoMultimedia;

  @Column()
  archivoUrl: string;

  @Column({ nullable: true })
  descripcion: string; // ej: "Sala Principal", "Cocina Integral"

  @Column({ default: false })
  principal: boolean;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @OneToMany(() => Hotspot, (h) => h.escenaOrigen)
  hotspotsSalientes: Hotspot[];
}
