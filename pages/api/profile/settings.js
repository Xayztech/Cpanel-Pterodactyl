import { getToken } from 'next-auth/jwt';
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return res.status(401).json({ error: 'Anda harus login' });
  }

  const userId = token.id;

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT background_setting FROM users WHERE id = ${userId};
      `;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User tidak ditemukan' });
      }
      return res.status(200).json(JSON.parse(rows[0].background_setting));
    } else if (req.method === 'POST') {
      const { setting } = req.body;
      if (!setting) {
        return res.status(400).json({ error: 'Setting dibutuhkan' });
      }

      const settingString = JSON.stringify(setting);

      await sql`
        UPDATE users SET background_setting = ${settingString} WHERE id = ${userId};
      `;

      return res
        .status(200)
        .json({ message: 'Setting berhasil disimpan', setting });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Settings API Error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}