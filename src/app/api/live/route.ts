// src/app/api/live/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // Ruta relativa corregida
import { query } from '@/src/utils/dbService'; // Mantiene alias, ya que está funcionando

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.isCreator) {
    return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  }

  try {
    const { status, youtubeUrl } = await req.json();

    await query(
      "UPDATE users SET is_live = $1, youtube_url = COALESCE($2, youtube_url) WHERE id = $3",
      [status, youtubeUrl, session.user.id]
    );

    return NextResponse.json({ message: `Estado de transmisión actualizado a ${status ? 'EN VIVO' : 'FUERA DE LÍNEA'}.` });
  } catch (error) {
    console.error('Error al actualizar estado de live:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const liveCreators = await query("SELECT id, username, youtube_url FROM users WHERE is_live = TRUE");
    return NextResponse.json(liveCreators.rows);
  } catch (error) {
    console.error('Error al obtener creadores en vivo:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
