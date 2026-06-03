import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import book_styles from '../css/books.module.css';
import { fetchSubjectById, updateSubject, fetchProfessors } from './subjects.api';
import { ProfessorListItem } from '@server/people';

export function EditSubjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [professors, setProfessors] = useState<ProfessorListItem[]>([]);
  const [professorSearch, setProfessorSearch] = useState('');
  const [selectedProfessors, setSelectedProfessors] = useState<ProfessorListItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([fetchSubjectById(Number(id)), fetchProfessors()])
      .then(([subject, allProfessors]) => {
        setName(subject.name);
        setSelectedProfessors(subject.professors);
        setProfessors(allProfessors);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const filteredProfessors = professors.filter((prof) => {
    const search = professorSearch.toLowerCase();
    const already = selectedProfessors.some((s) => s.professor_id === prof.professor_id);
    return (
      !already &&
      (prof.name.toLowerCase().includes(search) ||
        (prof.email || '').toLowerCase().includes(search))
    );
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!id) return;

    setError(null);
    setSaving(true);

    if (selectedProfessors.length === 0) {
      setError('Seleziona almeno un professore');
      setSaving(false);
      return;
    }

    try {
      await updateSubject(Number(id), {
        name,
        professorIds: selectedProfessors.map((p) => p.professor_id),
      });

      navigate('/subjects');
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
          <p className={book_styles.message}>Caricamento materia...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={`${book_styles.card}, ${book_styles.cardSmall}`}>
        <h1 className={book_styles.title}>Modifica materia</h1>

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
            <label>Professori (cerca e seleziona)</label>
            <input
              className={book_styles.input}
              placeholder="Cerca professore per nome o email"
              value={professorSearch}
              onChange={(e) => setProfessorSearch(e.target.value)}
            />

            <div className={book_styles.autocompleteList}>
              {filteredProfessors.slice(0, 8).map((prof) => (
                <button
                  key={prof.professor_id}
                  type="button"
                  className={book_styles.secondaryButton}
                  onClick={() => {
                    setSelectedProfessors((current) => [...current, prof]);
                    setProfessorSearch('');
                  }}
                >
                  {prof.name} {prof.email ? `(${prof.email})` : ''}
                </button>
              ))}
            </div>
          </div>

          {selectedProfessors.length > 0 && (
            <div className={book_styles.field}>
              <label>Professori selezionati</label>
              <div>
                {selectedProfessors.map((p) => (
                  <div key={p.professor_id} className={book_styles.row}>
                    <span className={book_styles.titleCell}>{p.name}</span>
                    <button
                      type="button"
                      className={book_styles.dangerButton}
                      onClick={() =>
                        setSelectedProfessors((current) =>
                          current.filter((item) => item.professor_id !== p.professor_id)
                        )
                      }
                    >
                      Rimuovi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className={book_styles.button} disabled={saving}>
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
        </form>

        {error && <p className={book_styles.error}>{error}</p>}
      </section>
    </main>
  );
}