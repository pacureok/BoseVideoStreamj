// src/app/creator/publications/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route"; // Ruta relativa corregida
import { query } from '@/src/utils/dbService'; // Mantiene alias, ya que está funcionando

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.isCreator) {
    return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  }

  try {
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ message: 'ID de usuario no encontrado en la sesión.' }, { status: 400 });
    }

    const publications = await query("SELECT * FROM creator_posts WHERE creator_id = $1 ORDER BY created_at DESC", [userId]);
    return NextResponse.json(publications.rows);
  } catch (error) {
    console.error('Error al obtener publicaciones del creador:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.isCreator) {
    return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  }

  try {
    const { title, description, videoUrl } = await req.json();
    const userId = session.user?.id;

    if (!title || !videoUrl || !userId) {
      return NextResponse.json({ message: 'Título, URL de video y ID de creador son requeridos.' }, { status: 400 });
    }

    await query(
      "INSERT INTO creator_posts (creator_id, title, description, video_url) VALUES ($1, $2, $3, $4)",
      [userId, title, description, videoUrl]
    );

    return NextResponse.json({ message: 'Publicación creada exitosamente.' }, { status: 201 });
  } catch (error) {
    console.error('Error al crear publicación:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.isCreator) {
    return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    const userId = session.user?.id;

    if (!id || !userId) {
      return NextResponse.json({ message: 'ID de publicación y ID de creador son requeridos.' }, { status: 400 });
    }

    const res = await query("DELETE FROM creator_posts WHERE id = $1 AND creator_id = $2", [id, userId]);

    if (res.rowCount === 0) {
      return NextResponse.json({ message: 'Publicación no encontrada o no tienes permiso para eliminarla.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Publicación eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
