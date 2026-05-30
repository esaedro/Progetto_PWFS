import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import book_styles from '../css/books.module.css';

export function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
  }

  return (
    <main className={book_styles.page}>
        PAGINA HOME
    </main>
  );
}