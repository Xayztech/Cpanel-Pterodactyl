import { sql } from '@vercel/postgres';
import { hashPassword } from '../../lib/passwordUtils';

export default async function handler(req, res) {
  try {
    const createTableResult = await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const ownerUsername = 'XYCoolcraft';
    const ownerPassword = 'XYZAGEN123';
    const hashedPassword = await hashPassword(ownerPassword);
    const ownerRole = 'Owner';

    const insertUserResult = await sql`
      INSERT INTO users (username, password, role)
      VALUES (${ownerUsername}, ${hashedPassword}, ${ownerRole})
      ON CONFLICT (username) DO NOTHING;
    `;

    res.status(200).json({ createTableResult, insertUserResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}