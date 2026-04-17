import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { AuthScreen } from './components/auth/AuthScreen';
import { Dashboard } from './components/dashboard/Dashboard';
import { Toaster } from 'sonner';

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {!session ? (
        <AuthScreen />
      ) : (
        // ログイン情報をDashboardに渡す！
        <Dashboard session={session} />
      )}
      <Toaster position="top-right" />
    </>
  );
}

export default App;