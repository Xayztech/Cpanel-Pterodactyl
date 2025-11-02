import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const { data: session, status } = useSession();
  const [setting, setSetting] = useState({ type: 'system' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (status === 'authenticated') {
        setIsLoading(true);
        try {
          const res = await fetch('/api/profile/settings');
          if (res.ok) {
            const data = await res.json();
            setSetting(data);
          }
        } catch (error) {
          console.error('Gagal fetch settings', error);
        }
        setIsLoading(false);
      } else if (status === 'unauthenticated') {
        setSetting({ type: 'system' });
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [status]);

  const saveSetting = async (newSetting) => {
    setSetting(newSetting);
    try {
      await fetch('/api/profile/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setting: newSetting }),
      });
    } catch (error) {
      console.error('Gagal simpan setting', error);
    }
  };

  const value = {
    setting,
    saveSetting,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}