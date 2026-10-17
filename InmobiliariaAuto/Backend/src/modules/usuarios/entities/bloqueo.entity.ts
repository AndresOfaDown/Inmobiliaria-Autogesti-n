import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('bloqueos')
@Unique(['bloqueadorId', 'bloqueadoId'])
export class Bloqueo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bloqueadorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bloqueadorId' })
  bloqueador: Usuario;

  @Column()
  bloqueadoId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bloqueadoId' })
  bloqueado: Usuario;

  @CreateDateColumn()
  creado: Date;
}
