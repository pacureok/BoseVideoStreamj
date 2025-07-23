// src/app/api/chat/send/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // Ruta relativa corregida (SIN ESPACIOS)
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'No autenticado.' }, { status: 401 });
  }

  try {
    const { message, creatorId } = await req.json();

    if (!message || !creatorId) {
      return NextResponse.json({ message: 'Mensaje y ID de creador son requeridos.' }, { status: 400 });
    }

    await pusher.trigger(`chat-${creatorId}`, 'new-message', {
      message: `${session.user?.name}: ${message}`,
    });

    return NextResponse.json({ message: 'Mensaje enviado.' });
  } catch (error) {
    console.error('Error al enviar mensaje de chat:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
