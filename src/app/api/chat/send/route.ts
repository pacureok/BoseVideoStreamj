import Pusher from 'pusher';
import { config } from 'dotenv';
config(); // Si usas dotenv-local para variables en desarrollo

// Helper: debes implementarlo según tu autenticación (cookies/JWT)
async function getSessionFromRequest(event: any) {
  // Ejemplo: token JWT en cookies
  // const token = event.headers.cookie?.match(/token=([^;]+)/)?.[1];
  // if (!token) return null;
  // ... valida el token y extrae los datos de sesión ...
  // return { user: { name: '...', id: '...' } };
  return null; // IMPLEMENTA ESTO
}

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no soportado.' })
    };
  }

  const session = await getSessionFromRequest(event);
  if (!session) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'No autenticado.' })
    };
  }

  try {
    const { message, creatorId } = JSON.parse(event.body || '{}');

    if (!message || !creatorId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Mensaje y ID de creador son requeridos.' })
      };
    }

    await pusher.trigger(`chat-${creatorId}`, 'new-message', {
      message: `${session.user?.name}: ${message}`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Mensaje enviado.' })
    };
  } catch (error) {
    console.error('Error al enviar mensaje de chat:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor.' })
    };
  }
}
