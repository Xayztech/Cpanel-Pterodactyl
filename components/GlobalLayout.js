import { useSettings } from '../context/SettingsContext';
import { useEffect, useState } from 'react';

export default function GlobalLayout({ children }) {
  const { setting, isLoading } = useSettings();
  const [style, setStyle] = useState({});
  const [themeClass, setThemeClass] = useState('');

  useEffect(() => {
    if (isLoading) return;

    let newStyle = {};
    let newClass = '';

    switch (setting.type) {
      case 'dark':
        newClass = 'dark';
        newStyle = { backgroundColor: '#111827', color: '#f9fafb' };
        break;
      case 'light':
        newClass = 'light';
        newStyle = { backgroundColor: '#f9fafb', color: '#111827' };
        break;
      case 'url':
        newStyle = {
          backgroundImage: `url(${setting.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        };
        break;
      case 'system':
      default:
        newClass = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        break;
    }

    setStyle(newStyle);
    setThemeClass(newClass);
  }, [setting, isLoading]);

  useEffect(() => {
    document.documentElement.className = themeClass;
  }, [themeClass]);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={style}
    >
      {children}
    </div>
  );
}