import { SessionProvider } from 'next-auth/react';
import { SettingsProvider } from '../context/SettingsContext';
import GlobalLayout from '../components/GlobalLayout';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <SettingsProvider>
        <GlobalLayout>
          <Component {...pageProps} />
        </GlobalLayout>
      </SettingsProvider>
    </SessionProvider>
  );
}

export default MyApp;