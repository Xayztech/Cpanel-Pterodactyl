import { getToken } from 'next-auth/jwt';
import { sql } from '@vercel/postgres';
import { hashPassword } from '../../../lib/passwordUtils';

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'Owner') {
    return res.status(403).json({ error: 'Akses ditolak' });
  }

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT id, username, role, "createdAt" FROM users ORDER BY "createdAt" DESC;
      `;
      return res.status(200).json(rows);
    } else if (req.method === 'POST') {
      const { username, password, role } = req.body;

      if (!username || !password || !role) {
        return res
          .status(400)
          .json({ error: 'Username, password, dan role dibutuhkan' });
      }

      if (role !== 'Admin' && role !== 'User') {
        return res.status(400).json({ error: 'Role harus Admin atau User' });
      }

      const hashedPassword = await hashPassword(password);

      await sql`
        INSERT INTO users (username, password, role)
        VALUES (${username}, ${hashedPassword}, ${role});
      `;

      return res.status(201).json({ message: 'User berhasil dibuat' });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID User dibutuhkan' });
      }

      if (Number(id) === Number(token.id)) {
        return res
          .status(400)
          .json({ error: 'Anda tidak bisa menghapus akun Anda sendiri' });
      }

      await sql`
        DELETE FROM users WHERE id = ${id};
      `;

      return res.status(200).json({ message: 'User berhasil dihapus' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Username sudah digunakan' });
    }
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}