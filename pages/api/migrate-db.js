import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const result = await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS background_setting TEXT
      DEFAULT '{"type": "system"}';
    `;
    res
      .status(200)
      .json({ message: 'Migrasi berhasil, kolom ditambahkan', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}