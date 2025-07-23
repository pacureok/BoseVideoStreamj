import { query } from '../../src/utils/dbService';

// Implementa esto según tu sistema de autenticación real (JWT, cookies, etc)
async function getSessionFromRequest(event: any) {
  // Ejemplo: token JWT en cookies
  // const token = event.headers.cookie?.match(/token=([^;]+)/)?.[1];
  // if (!token) return null;
  // ... valida el token y extrae los datos de sesión ...
  // return { user: { id: '...', isCreator: true/false } };
  return null; // IMPLEMENTA ESTO
}

export async function handler(event: any) {
  const method = event.httpMethod;

  // GET - obtener publicaciones del creador
  if (method === "GET") {
    const session = await getSessionFromRequest(event);
    if (!session || !session.user?.isCreator) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'No autorizado.' })
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

      const publications = await query("SELECT * FROM creator_posts WHERE creator_id = $1 ORDER BY created_at DESC", [userId]);
      return {
        statusCode: 200,
        body: JSON.stringify(publications.rows)
      };
    } catch (error) {
      console.error('Error al obtener publicaciones del creador:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error interno del servidor.' })
      };
    }
  }

  // POST - crear publicación
  if (method === "POST") {
    const session = await getSessionFromRequest(event);
    if (!session || !session.user?.isCreator) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'No autorizado.' })
      };
    }

    try {
      const { title, description, videoUrl } = JSON.parse(event.body || '{}');
      const userId = session.user?.id;

      if (!title || !videoUrl || !userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Título, URL de video y ID de creador son requeridos.' })
        };
      }

      await query(
        "INSERT INTO creator_posts (creator_id, title, description, video_url) VALUES ($1, $2, $3, $4)",
        [userId, title, description, videoUrl]
      );

      return {
        statusCode: 201,
        body: JSON.stringify({ message: 'Publicación creada exitosamente.' })
      };
    } catch (error) {
      console.error('Error al crear publicación:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error interno del servidor.' })
      };
    }
  }

  // DELETE - eliminar publicación
  if (method === "DELETE") {
    const session = await getSessionFromRequest(event);
    if (!session || !session.user?.isCreator) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'No autorizado.' })
      };
    }

    try {
      const { id } = JSON.parse(event.body || '{}');
      const userId = session.user?.id;

      if (!id || !userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'ID de publicación y ID de creador son requeridos.' })
        };
      }

      const res = await query("DELETE FROM creator_posts WHERE id = $1 AND creator_id = $2", [id, userId]);

      if (res.rowCount === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Publicación no encontrada o no tienes permiso para eliminarla.' })
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Publicación eliminada exitosamente.' })
      };
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
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
