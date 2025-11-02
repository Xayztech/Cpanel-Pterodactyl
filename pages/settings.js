import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSettings } from '../context/SettingsContext';

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setting, saveSetting, isLoading } = useSettings();

  const [currentSetting, setCurrentSetting] = useState({ type: 'system' });
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (!isLoading && setting) {
      setCurrentSetting(setting);
      if (setting.type === 'url') {
        setCustomUrl(setting.value);
      }
    }
  }, [setting, isLoading]);

  const handleSave = () => {
    if (currentSetting.type === 'url') {
      saveSetting({ type: 'url', value: customUrl });
    } else {
      saveSetting(currentSetting);
    }
  };

  if (status === 'loading' || isLoading) {
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
    <div className="container mx-auto p-8 max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Login sebagai: {session.user.name} ({session.user.role})
          </p>
        </div>
        <div>
          <Link href="/" className="text-blue-500 hover:underline mr-4">
            Home
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-500 text-white p-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Pengaturan Background
        </h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="system"
              name="theme"
              value="system"
              checked={currentSetting.type === 'system'}
              onChange={() => setCurrentSetting({ type: 'system' })}
              className="mr-2"
            />
            <label htmlFor="system" className="text-gray-700 dark:text-gray-300">
              Sesuai Sistem (Default)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="light"
              name="theme"
              value="light"
              checked={currentSetting.type === 'light'}
              onChange={() => setCurrentSetting({ type: 'light' })}
              className="mr-2"
            />
            <label htmlFor="light" className="text-gray-700 dark:text-gray-300">
              Terang (Light)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="dark"
              name="theme"
              value="dark"
              checked={currentSetting.type === 'dark'}
              onChange={() => setCurrentSetting({ type: 'dark' })}
              className="mr-2"
            />
            <label htmlFor="dark" className="text-gray-700 dark:text-gray-300">
              Gelap (Dark)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="url"
              name="theme"
              value="url"
              checked={currentSetting.type === 'url'}
              onChange={() => setCurrentSetting({ type: 'url' })}
              className="mr-2"
            />
            <label htmlFor="url" className="text-gray-700 dark:text-gray-300">
              Custom URL
            </label>
          </div>
          {currentSetting.type === 'url' && (
            <input
              type="text"
              placeholder="https://example.com/image.png"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="border p-2 w-full mt-2"
            />
          )}
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white p-2 rounded mt-6"
        >
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}