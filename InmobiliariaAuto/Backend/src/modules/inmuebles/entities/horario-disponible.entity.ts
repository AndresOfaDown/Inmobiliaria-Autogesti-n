import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Inmueble } from './inmueble.entity';

@Entity('horarios_disponibles')
export class HorarioDisponible {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propietarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propietarioId' })
  propietario: Usuario;

  @Column({ nullable: true })
  inmuebleId: string;

  @ManyToOne(() => Inmueble, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'inmuebleId' })
  inmueble: Inmueble;

  @Column({ type: 'int' })
  diaSemana: number; // 0: Lunes - 6: Domingo

  @Column()
  horaInicio: string; // "09:00"

  @Column()
  horaFin: string; // "18:00"

  @Column({ default: true })
  activo: boolean;
}
