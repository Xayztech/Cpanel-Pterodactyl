import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [message, setMessage] = useState('');
  const [downloadContent, setDownloadContent] = useState(null);
  const [username, setUsername] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('Membuat server... mohon tunggu...');
    setDownloadContent(null);

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    data.userRole = session.user.role;

    setUsername(data.userName);

    try {
      const response = await fetch('/api/createServer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat server');
      }

      setMessage(`Sukses! ${result.message}`);

      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `${data.userName}_${timestamp}_saveaccount.txt`;
      const content = `
Data Akun Pterodactyl:
Email: ${result.userData.email}
Username: ${result.userData.username}
Password: ${data.userPassword}
Panel URL: https://www.xycoolcraft.my.id

Data Server:
Nama Server: ${result.serverData.name}
RAM: ${result.serverData.limits.memory} MB
Disk: ${result.serverData.limits.disk} MB
CPU: ${result.serverData.limits.cpu} %
      `;

      setDownloadContent({ filename, content });
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDownload = () => {
    if (!downloadContent) return;

    const element = document.createElement('a');
    const file = new Blob([downloadContent.content], {
      type: 'text/plain;charset=utf-8',
    });
    element.href = URL.createObjectURL(file);
    element.download = downloadContent.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Server Bot WhatsApp</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Selamat datang, {session.user.name} (Role: {session.user.role})
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/settings"
            className="text-blue-500 hover:underline"
          >
            Settings
          </Link>
          <Link
            href="/profile"
            className="text-blue-500 hover:underline"
          >
            Profil Saya
          </Link>
          {session.user.role === 'Owner' && (
            <Link
              href="/admin/manage-users"
              className="bg-green-500 text-white p-2 rounded"
            >
              Manajemen Pengguna
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-500 text-white p-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Info Akun Pterodactyl</h2>
          <input
            name="userName"
            placeholder="Username Pterodactyl"
            required
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white"
          />
          <input
            name="userEmail"
            type="email"
            placeholder="Email"
            required
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white"
          />
          <input
            name="userPassword"
            type="password"
            placeholder="Password"
            required
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white"
          />

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Info Server</h2>
          <input
            name="serverName"
            placeholder="Nama Server"
            required
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white"
          />
          <label htmlFor="ram" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            RAM
          </label>
          <select
            id="ram"
            name="ram"
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white"
            defaultValue="1024"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((gb) => (
              <option key={gb} value={gb * 1024}>
                {gb}GB RAM
              </option>
            ))}
            <option value="0">Unlimited RAM</option>
          </select>

          <label
            htmlFor="disk"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Disk
          </label>
          <select
            id="disk"
            name="disk"
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white"
            defaultValue="1024"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((gb) => (
              <option key={gb} value={gb * 1024}>
                {gb}GB Disk
              </option>
            ))}
            <option value="0">Unlimited Disk</option>
          </select>

          <label
            htmlFor="cpu"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            CPU Limit (%)
          </label>
          <select
            id="cpu"
            name="cpu"
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white"
            defaultValue="100"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((core) => (
              <option key={core} value={core * 100}>
                {core * 100}% CPU ({core} Core)
              </option>
            ))}
            <option value="0">Unlimited CPU</option>
          </select>

          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Buat Akun & Server Bot
          </button>
        </form>

        {message && <p className="mt-4 text-green-600 dark:text-green-400">{message}</p>}

        {downloadContent && (
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white p-2 rounded mt-2"
          >
            Save (Download) Akun
          </button>
        )}
      </div>
    </div>
  );
}