import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import book_styles from '../css/books.module.css';
import { fetchTeachingById, updateTeaching, fetchSubjects, fetchDegrees } from './teachings.api';
import { SubjectItem, DegreeItem } from '@server/courses';

export function EditTeachingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [year, setYear] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [degreeId, setDegreeId] = useState('');

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [degrees, setDegrees] = useState<DegreeItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([fetchTeachingById(Number(id)), fetchSubjects(), fetchDegrees()])
      .then(([teaching, allSubjects, allDegrees]) => {
        setYear(String(teaching.year));
        setSubjectId(String((teaching.subject as any)?.id ?? ''));
        setDegreeId(String((teaching.degree as any)?.id ?? ''));
        setSubjects(allSubjects);
        setDegrees(allDegrees);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!id) return;

    setError(null);
    setSaving(true);

    if (!subjectId || !degreeId) {
      setError('Seleziona materia e corso di laurea');
      setSaving(false);
      return;
    }

    try {
      await updateTeaching(Number(id), {
        year: Number(year),
        subjectId: Number(subjectId),
        degreeId: Number(degreeId),
      });

      navigate('/teachings');
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
          <p className={book_styles.message}>Caricamento insegnamento...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={`${book_styles.card}, ${book_styles.cardSmall}`}>
        <h1 className={book_styles.title}>Modifica insegnamento</h1>

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

          <button className={book_styles.button} disabled={saving}>
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
        </form>

        {error && <p className={book_styles.error}>{error}</p>}
      </section>
    </main>
  );
}