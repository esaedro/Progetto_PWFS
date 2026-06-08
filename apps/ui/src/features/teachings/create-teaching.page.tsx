import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import book_styles from '../css/books.module.css';
import { createTeaching } from './teachings.api';
import { fetchSubjects } from '../subjects/subjects.api';
import { fetchDegrees } from '../degrees/degrees.api';
import { SubjectItem, DegreeItem } from '@server/courses';

export function CreateTeachingPage() {
  const [year, setYear] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [degreeId, setDegreeId] = useState('');

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [degrees, setDegrees] = useState<DegreeItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects()
      .then(setSubjects)
      .catch((err) => setError(err.message));

    fetchDegrees()
      .then(setDegrees)
      .catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    if (!subjectId || !degreeId) {
      setError('Seleziona materia e corso di laurea');
      setLoading(false);
      return;
    }

    try {
      await createTeaching({
        year: Number(year),
        subjectId: Number(subjectId),
        degreeId: Number(degreeId),
      });

      navigate('/teachings');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={book_styles.page}>
      <section className={`${book_styles.card} ${book_styles.cardSmall}`}>
        <h1 className={book_styles.title}>Nuovo insegnamento</h1>

        <form className={book_styles.form} onSubmit={handleSubmit}>
          <div className={book_styles.field}>
            <label>Materia</label>
            <select
              className={book_styles.input}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
            >
              <option value="">Seleziona materia</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className={book_styles.field}>
            <label>Corso di laurea</label>
            <select
              className={book_styles.input}
              value={degreeId}
              onChange={(e) => setDegreeId(e.target.value)}
              required
            >
              <option value="">Seleziona corso di laurea</option>
              {degrees.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className={book_styles.field}>
            <label>Anno</label>
            <input
              className={book_styles.input}
              type="number"
              min={1}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>

          <button className={book_styles.button} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Crea insegnamento'}
          </button>
        </form>

        {error && <p className={book_styles.error}>{error}</p>}
      </section>
    </main>
  );
}
