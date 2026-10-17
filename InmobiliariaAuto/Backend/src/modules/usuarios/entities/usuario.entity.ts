import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum RolUsuario {
  ADMIN = 'admin',
  USUARIO = 'usuario',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.USUARIO,
  })
  rol: RolUsuario;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  apellido: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ nullable: true })
  ci: string;

  @Column({ nullable: true })
  fotoUrl: string;

  @Column({ type: 'date', nullable: true })
  nacimiento: Date;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creado: Date;

  @UpdateDateColumn()
  actualizado: Date;
}
