import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDegreeById, updateDegree } from './degrees.api';
import book_styles from '../css/books.module.css';

export function EditDegreePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [durationYears, setDurationYears] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchDegreeById(Number(id))
      .then((degree) => {
        setName(degree.name);
        setDurationYears(String(degree.duration));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!id) return;

    setError(null);
    setSaving(true);

    try {
      await updateDegree(Number(id), {
        name,
        durationYears: Number(durationYears),
      });

      navigate('/degrees');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className={book_styles.page}>
        <section className={book_styles.card}>
          <p className={book_styles.message}>Caricamento corso di laurea...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={`${book_styles.card}, ${book_styles.cardSmall}`}>
        <h1 className={book_styles.title}>Modifica corso di laurea</h1>

        <form className={book_styles.form} onSubmit={handleSubmit}>
          <div className={book_styles.field}>
            <label>Nome</label>
            <input
              className={book_styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={4}
              required
            />
          </div>

          <div className={book_styles.field}>
            <label>Durata (anni)</label>
            <input
              className={book_styles.input}
              type="number"
              min={1}
              max={5}
              step={1}
              value={durationYears}
              onChange={(e) => setDurationYears(e.target.value)}
              required
            />
          </div>

          <button className={book_styles.button} disabled={saving}>
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
        </form>

        {error && <p className={book_styles.error}>{error}</p>}
      </section>
    </main>
  );
}