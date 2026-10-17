import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipos_inmueble')
export class TipoInmueble {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string; // Casa, Departamento, Terreno, Oficina, Local Comercial

  @Column({ type: 'text', nullable: true })
  descripcion: string;
}
