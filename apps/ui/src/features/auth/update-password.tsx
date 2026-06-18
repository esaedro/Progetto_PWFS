import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePasswordFetch } from './auth.api';
import book_styles from '../css/books.module.css';

export function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Check if passwords match before hitting the API
    if (password !== confirmPassword) {
      setError('Le password non coincidono.');
      return;
    }

    setLoading(true);

    try {
      await updatePasswordFetch(password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={book_styles.page}>
      <div className={book_styles.card}>
        <h1 className={book_styles.title}>Cambia password</h1>

        <form onSubmit={handleSubmit} className={book_styles.form}>
          <div className={book_styles.field}>
            <label>Nuova password</label>
            <input
              type="password"
              className={book_styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci password"
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Conferma password</label>
            <input
              type="password"
              className={book_styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Conferma la tua password"
              required
            />
          </div>

          {/* Fixed the button label to match a password update action */}
          <button className={book_styles.button} type="submit" disabled={loading}>
            {loading ? 'Aggiornamento...' : 'Aggiorna password'}
          </button>
        </form>

        {error && <p className={book_styles.error}>{error}</p>}
      </div>
    </main>
  );
}