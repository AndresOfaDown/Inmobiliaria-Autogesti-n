import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pago } from './pago.entity';
import { EstadoPago } from './pago.enum';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('historial_pagos')
export class HistorialPago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pagoId: string;

  @ManyToOne(() => Pago, (p) => p.historial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pagoId' })
  pago: Pago;

  @Column({
    type: 'enum',
    enum: EstadoPago,
    nullable: true,
  })
  estadoAnterior: EstadoPago;

  @Column({
    type: 'enum',
    enum: EstadoPago,
  })
  estadoNuevo: EstadoPago;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ nullable: true })
  usuarioId: string;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @CreateDateColumn()
  fecha: Date;
}
