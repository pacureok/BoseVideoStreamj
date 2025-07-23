pp/creator/streamer-info/route.ts (O stream-info/route.ts - ¡Confirma el nombre!)
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route"; // RUTA RELATIVA: ESCRIBIR MANUALMENTE: "../../../api/auth/[...nextauth]/route"
import { query } from '@/src/utils/dbService'; // Alias: '@/src/utils/dbService'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'No autenticado.' }, { status: 401 });
  }

  try {
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ message: 'ID de usuario no encontrado en la sesión.' }, { status: 400 });
    }

    const userRes = await query("SELECT username, email, is_creator, youtube_url, is_live FROM users WHERE id = $1", [userId]);
    const user = userRes.rows[0];

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error al obtener información del streamer:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.isCreator) {
    return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  }

  try {
    const { youtubeUrl, isLive } = await req.json();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ message: 'ID de usuario no encontrado en la sesión.' }, { status: 400 });
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (youtubeUrl !== undefined) {
      updates.push(`youtube_url = $${paramIndex++}`);
      params.push(youtubeUrl);
    }
    if (isLive !== undefined) {
      updates.push(`is_live = $${paramIndex++}`);
      params.push(isLive);
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No hay campos para actualizar.' }, { status: 400 });
    }

    params.push(userId);

    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
    await query(updateQuery, params);

    return NextResponse.json({ message: 'Información del streamer actualizada.' });
  } catch (error) {
    console.error('Error al actualizar información del streamer:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
