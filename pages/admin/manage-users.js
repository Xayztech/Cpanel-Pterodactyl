import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ManageUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    } else {
      setError('Gagal mengambil data pengguna');
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user.role !== 'Owner') {
        router.push('/');
      } else {
        fetchUsers();
      }
    }
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(data.message);
      setUsername('');
      setPassword('');
      setRole('User');
      fetchUsers();
    } else {
      setError(data.error || 'Gagal membuat user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      setError('');
      setMessage('');
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchUsers();
      } else {
        setError(data.error || 'Gagal menghapus user');
      }
    }
  };

  if (status === 'loading' || !session || session.user.role !== 'Owner') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading atau mengalihkan...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Pengguna</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Login sebagai: {session.user.name} (Owner)
          </p>
        </div>
        <div>
          <Link href="/" className="text-blue-500 hover:underline mr-4">
            Kembali ke Home
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-500 text-white p-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Buat User Baru</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Buat User
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Daftar Pengguna</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
              <thead>
                <tr>
                  <th className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-white">Username</th>
                  <th className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-white">Role</th>
                  <th className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-white">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-2 px-4 border dark:border-gray-700">{user.username}</td>
                    <td className="py-2 px-4 border dark:border-gray-700">{user.role}</td>
                    <td className="py-2 px-4 border dark:border-gray-700 text-center">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                        disabled={user.id === session.user.id}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}