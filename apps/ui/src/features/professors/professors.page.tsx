import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import book_styles from '../css/books.module.css';
import { ProfessorListItem } from '@server/people';
import { fetchProfessors } from './professors.api';

export function ProfessorsPage() {
  const [professors, setProfessors] = useState<ProfessorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleDelete(id: number) {
//     const confirmed = window.confirm('Vuoi davvero cancellare questo libro?');

//     if(!confirmed)
//       return;

//     try {
//       await deleteBook(id);
//       setBooks((books) => books.filter((book) => book.id != id));
//     } catch(err: any) {
//       setError(err.message);
//     }
  }

  useEffect(() => {
    fetchProfessors()
      .then(setProfessors)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className={book_styles.page}>
        <div className={book_styles.card}>
          <p className={book_styles.message}>Caricamento libri...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={book_styles.page}>
        <div className={book_styles.card}>
          <p className={book_styles.error}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={book_styles.page}>
      <section className={`${book_styles.card}, ${book_styles.cardLarge}`}>
        <header className={book_styles.headerRow}>
          <div>
            <h1> Catalogo libri</h1>
            <p className={book_styles.subtitle}>
              Lista dei professori.
            </p>
          </div>
        </header>

        {professors.length === 0 ? (
          <p className={book_styles.message}>Nessun professore registato.</p>
        ) : (
          <div className={book_styles.tableWrapper}>
            <table className={book_styles.table}>
              <thead>
                <tr>
                  <th className={book_styles.th}>Titolo</th>
                  <th className={book_styles.th}>Anno</th>
                  <th className={book_styles.th}>Categoria</th>
                  <th className={book_styles.th}>Autori</th>
                  <th className={book_styles.th}>Azioni</th>
                </tr>
              </thead>

              <tbody>
                {professors.map((professor) => (
                  <tr key={professor.professor_id} className={book_styles.row}>
                    <td className={book_styles.titleCell}>{professor.user.name}</td>
                    <td className={book_styles.td}>{professor.user.email}</td>
                    <td className={book_styles.td}>
                      <button 
                        className={book_styles.secondaryButton}
                        onClick={() => navigate(`/books/${professor.professor_id}/edit`)}>

                        Modifica
                      </button>

                      <button 
                        className={book_styles.dangerButton}
                        onClick={() => handleDelete(professor.professor_id)}>

                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}