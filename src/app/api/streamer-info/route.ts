import { query } from '../../src/utils/dbService';

// Debes implementar esto según tu autenticación real (JWT, cookies, etc)
async function getSessionFromRequest(event: any) {
  // Ejemplo: suponiendo JWT en las cookies
  // const token = event.headers.cookie?.match(/token=([^;]+)/)?.[1];
  // if (!token) return null;
  // ... validar token y extraer datos de sesión ...
  // return { user: { id: '...', isCreator: true/false } };
  return null; // IMPLEMENTA ESTO
}

export async function handler(event: any, context: any) {
  if (event.httpMethod === "GET") {
    const session = await getSessionFromRequest(event);
    if (!session) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'No autenticado.' })
      };
    }

    try {
      const userId = session.user?.id;
      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'ID de usuario no encontrado en la sesión.' })
        };
      }

      const userRes = await query("SELECT username, email, is_creator, youtube_url, is_live FROM users WHERE id = $1", [userId]);
      const user = userRes.rows[0];

      if (!user) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Usuario no encontrado.' })
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(user)
      };
    } catch (error) {
      console.error('Error al obtener información del streamer:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error interno del servidor.' })
      };
    }
  }

  if (event.httpMethod === "PUT") {
    const session = await getSessionFromRequest(event);
    if (!session || !session.user?.isCreator) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'No autorizado.' })
      };
    }

    try {
      const { youtubeUrl, isLive } = JSON.parse(event.body || '{}');
      const userId = session.user?.id;

      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'ID de usuario no encontrado en la sesión.' })
        };
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
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'No hay campos para actualizar.' })
        };
      }

      params.push(userId);

      const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
      await query(updateQuery, params);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Información del streamer actualizada.' })
      };
    } catch (error) {
      console.error('Error al actualizar información del streamer:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error interno del servidor.' })
      };
    }
  }

  // Método no soportado
  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Método no soportado.' })
  };
}
