import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
  });

export const loginSchema = z.object({
  email: z
    .email({ message: "Formato de email inválido" })
    .min(1, { message: "El email es obligatorio" }),
  password: z.string().min(1, { message: "La contraseña es obligatoria" }),
});

export const registerSchema = z
  .object({
    dni: z
      .string()
      .min(1, { message: "El DNI es obligatorio" })
      .regex(/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i, {
        message: "Formato de DNI inválido",
      }),
    firstName: z.string().min(1, { message: "El nombre es obligatorio" }),
    lastName: z.string().min(1, { message: "El apellido es obligatorio" }),
    email: z
      .email({ message: "Formato de email inválido" })
      .min(1, { message: "El email es obligatorio" }),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Fecha de nacimiento inválida",
    }),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/[A-Z]/, { message: "Debe contener al menos una mayúscula" })
      .regex(/[0-9]/, { message: "Debe contener al menos un número" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
