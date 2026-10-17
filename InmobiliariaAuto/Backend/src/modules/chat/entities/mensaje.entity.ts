import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoMensaje {
  TEXTO = 'texto',
  IMAGEN = 'imagen',
  VIDEO = 'video',
  UBICACION = 'ubicacion',
  RECORRIDO360 = 'recorrido360',
  WHATSAPP = 'whatsapp',
}

@Entity('mensajes')
export class Mensaje {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chatId: string;

  @ManyToOne(() => Chat, (c) => c.mensajes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column()
  remitenteId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'remitenteId' })
  remitente: Usuario;

  @Column({
    type: 'enum',
    enum: TipoMensaje,
    default: TipoMensaje.TEXTO,
  })
  tipo: TipoMensaje;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ nullable: true })
  archivoUrl: string;

  @Column({ nullable: true })
  ubicacion: string; // "lat, lng"

  @Column({ default: false })
  leido: boolean;

  @CreateDateColumn()
  creado: Date;
}
