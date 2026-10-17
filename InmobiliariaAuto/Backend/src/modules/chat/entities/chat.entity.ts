import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Inmueble } from '../../inmuebles/entities/inmueble.entity';
import { Publicacion } from '../../inmuebles/entities/publicacion.entity';
import { Mensaje } from './mensaje.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  participante1Id: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participante1Id' })
  participante1: Usuario;

  @Column()
  participante2Id: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participante2Id' })
  participante2: Usuario;

  @Column({ nullable: true })
  inmuebleId: string;

  @ManyToOne(() => Inmueble, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'inmuebleId' })
  inmueble: Inmueble;

  @Column({ nullable: true })
  publicacionId: string;

  @ManyToOne(() => Publicacion, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'publicacionId' })
  publicacion: Publicacion;

  @OneToMany(() => Mensaje, (m) => m.chat, { cascade: true })
  mensajes: Mensaje[];

  @CreateDateColumn()
  creado: Date;

  @UpdateDateColumn()
  actualizado: Date;
}
