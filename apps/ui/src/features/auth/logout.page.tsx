// features/auth/logout.page.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('access_token');

    navigate('/login', { replace: true });
  }, [navigate]);

  return <p>Logout in corso...</p>;
}

