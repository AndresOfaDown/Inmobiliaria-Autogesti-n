import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inmueble } from './inmueble.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('accesos_recorrido_360')
export class AccesoRecorrido360 {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inmuebleId: string;

  @ManyToOne(() => Inmueble, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inmuebleId' })
  inmueble: Inmueble;

  @Column()
  clienteId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clienteId' })
  cliente: Usuario;

  @Column()
  propietarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propietarioId' })
  propietario: Usuario;

  @Column({ type: 'timestamp', nullable: true })
  fechaExpiracion: Date;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'int', default: 0 })
  visitas: number;

  @CreateDateColumn()
  creado: Date;
}
