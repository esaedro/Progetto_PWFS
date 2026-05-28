// features/auth/logout.page.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. rimuovi token
    localStorage.removeItem('access_token');

    // 2. redirect
    navigate('/login', { replace: true });
  }, [navigate]);

  return <p>Logout in corso...</p>;
}

