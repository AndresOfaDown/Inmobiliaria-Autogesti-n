import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('direcciones')
export class Direccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ciudad: string;

  @Column()
  zona: string;

  @Column()
  calle: string;

  @Column({ nullable: true })
  referencia: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud: number;
}
