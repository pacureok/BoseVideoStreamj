import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Para Vercel y Neon, SSL es importante.
  // rejectUnauthorized: false puede ser útil en desarrollo local, pero en producción,
  // es mejor asegurarse de que sea true y que el certificado sea válido. 
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
