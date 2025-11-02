import { getToken } from 'next-auth/jwt';
import { sql } from '@vercel/postgres';
import { hashPassword, comparePassword } from '../../../lib/passwordUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return res.status(401).json({ error: 'Anda harus login' });
  }

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: 'Password lama dan baru dibutuhkan' });
  }

  try {
    const userId = token.id;

    const result = await sql`
      SELECT password FROM users WHERE id = ${userId};
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const user = result.rows[0];
    const isPasswordMatch = await comparePassword(oldPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ error: 'Password lama salah' });
    }

    const newHashedPassword = await hashPassword(newPassword);

    await sql`
      UPDATE users SET password = ${newHashedPassword} WHERE id = ${userId};
    `;

    return res.status(200).json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}