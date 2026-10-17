import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

export enum TipoNotificacion {
  INFO = 'info',
  ALERTA = 'alerta',
  RECORDATORIO = 'recordatorio',
  PAGO = 'pago',
  CONFIRMACION = 'confirmacion',
}

export enum OrigenNotificacion {
  SISTEMA = 'sistema',
  USUARIO = 'usuario',
}

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column({
    type: 'enum',
    enum: TipoNotificacion,
    default: TipoNotificacion.INFO,
  })
  tipo: TipoNotificacion;

  @Column({
    type: 'enum',
    enum: OrigenNotificacion,
    default: OrigenNotificacion.SISTEMA,
  })
  origen: OrigenNotificacion;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ default: false })
  leida: boolean;

  @CreateDateColumn()
  creado: Date;
}
