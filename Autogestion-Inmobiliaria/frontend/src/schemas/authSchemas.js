import { z } from 'zod';

export const passwordValidation = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

export const registerSchema = z
  .object({
    first_name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(150, 'El nombre no puede exceder 150 caracteres'),
    last_name: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(150, 'El apellido no puede exceder 150 caracteres'),
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Ingresa un correo electrónico válido'),
    fecha_nacimiento: z
      .string()
      .min(1, 'La fecha de nacimiento es obligatoria')
      .refine((val) => {
        const birthDate = new Date(val);
        if (isNaN(birthDate.getTime())) return false;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 18;
      }, 'Debes ser mayor de edad (al menos 18 años cumplidos) para registrarte'),
    telefono: z
      .string()
      .regex(/^[+]?[0-9\s\-()]{7,20}$/, 'Formato de teléfono inválido (ej: +591 77084747 o 77084747)')
      .optional()
      .or(z.literal('')),
    documento_identidad: z
      .string()
      .min(4, 'El documento de identidad debe tener al menos 4 caracteres')
      .max(30, 'El documento de identidad no puede exceder 30 caracteres')
      .optional()
      .or(z.literal('')),
    password: passwordValidation,
    password_confirm: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});
