// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { hashPassword } from '@/src/utils/authService'; // ¡IMPORTACIÓN ACTUALIZADA!
import { query } from '@/src/utils/dbService';     // ¡IMPORTACIÓN ACTUALIZADA!

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Todos los campos son requeridos.' }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const userExists = await query("SELECT id FROM users WHERE username = $1 OR email = $2", [username, email]);
    if (userExists.rows.length > 0) {
      return NextResponse.json({ message: 'El usuario o email ya está registrado.' }, { status: 409 });
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await hashPassword(password);

    // Insertar el nuevo usuario en la base de datos
    await query(
      "INSERT INTO users (username, email, password, is_creator) VALUES ($1, $2, $3, FALSE)",
      [username, email, hashedPassword]
    );

    return NextResponse.json({ message: 'Registro exitoso.' }, { status: 201 });
  } catch (error) {
    console.error('Error durante el registro:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
