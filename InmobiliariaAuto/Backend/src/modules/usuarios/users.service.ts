import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Agenda } from './entities/agenda.entity';
import { Notificacion, TipoNotificacion, OrigenNotificacion } from './entities/notificacion.entity';
import { Resena } from './entities/resena.entity';
import { Bloqueo } from './entities/bloqueo.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private usersRepo: Repository<Usuario>,
    @InjectRepository(Agenda)
    private agendaRepo: Repository<Agenda>,
    @InjectRepository(Notificacion)
    private notifRepo: Repository<Notificacion>,
    @InjectRepository(Resena)
    private resenaRepo: Repository<Resena>,
    @InjectRepository(Bloqueo)
    private bloqueoRepo: Repository<Bloqueo>,
  ) {}

  async findAll() {
    const users = await this.usersRepo.find({
      select: ['id', 'email', 'rol', 'nombre', 'apellido', 'telefono', 'ci', 'direccion', 'activo', 'creado'],
      order: { creado: 'DESC' },
    });
    return users;
  }

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(id: string, data: Partial<Usuario>) {
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }

  async toggleActive(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.activo = !user.activo;
    await this.usersRepo.save(user);
    return { id: user.id, activo: user.activo };
  }

  // Notificaciones
  async getNotifications(usuarioId: string) {
    return this.notifRepo.find({
      where: { usuarioId },
      order: { creado: 'DESC' },
      take: 50,
    });
  }

  async createNotification(
    usuarioId: string,
    titulo: string,
    mensaje: string,
    tipo = TipoNotificacion.INFO,
    origen = OrigenNotificacion.SISTEMA,
  ) {
    const notif = this.notifRepo.create({
      usuarioId,
      titulo,
      mensaje,
      tipo,
      origen,
      leida: false,
    });
    return this.notifRepo.save(notif);
  }

  async markNotificationAsRead(id: string) {
    await this.notifRepo.update(id, { leida: true });
    return { success: true };
  }

  // Agenda
  async getAgenda(usuarioId: string) {
    return this.agendaRepo.find({
      where: { usuarioId },
      order: { inicio: 'ASC' },
    });
  }

  async createAgendaItem(usuarioId: string, data: Partial<Agenda>) {
    const item = this.agendaRepo.create({ ...data, usuarioId });
    return this.agendaRepo.save(item);
  }

  // Reseñas
  async getReviewsForInmueble(inmuebleId: string) {
    return this.resenaRepo.find({
      where: { inmuebleId },
      relations: ['usuario'],
      order: { creado: 'DESC' },
    });
  }

  async addReview(usuarioId: string, inmuebleId: string, calificacion: number, comentario: string) {
    const resena = this.resenaRepo.create({
      usuarioId,
      inmuebleId,
      calificacion,
      comentario,
    });
    return this.resenaRepo.save(resena);
  }

  // Bloqueos
  async blockUser(bloqueadorId: string, bloqueadoId: string) {
    const bloqueo = this.bloqueoRepo.create({ bloqueadorId, bloqueadoId });
    return this.bloqueoRepo.save(bloqueo);
  }

  async unblockUser(bloqueadorId: string, bloqueadoId: string) {
    await this.bloqueoRepo.delete({ bloqueadorId, bloqueadoId });
    return { success: true };
  }

  async isBlocked(userA: string, userB: string): Promise<boolean> {
    const found = await this.bloqueoRepo.findOne({
      where: [
        { bloqueadorId: userA, bloqueadoId: userB },
        { bloqueadorId: userB, bloqueadoId: userA },
      ],
    });
    return !!found;
  }
}
