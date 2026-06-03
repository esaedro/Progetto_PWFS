import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeachingItem } from '@server/courses'; 
import { fetchTeachings, deleteTeaching } from './teachings.api';
import { fetchCurrentUser } from '../auth/auth.api';
import book_styles from '../css/books.module.css';
import { UserListItem } from '@server/users';

export function TeachingsPage() {

    const [teachings, setTeachings] = useState<TeachingItem[]>([]);
    const [user, setUser] = useState<UserListItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    async function handleDelete(id: number) {
        const confirmed = window.confirm('Vuoi davvero cancellare questo insegnamento?');

        if(!confirmed) return;

        try {
            await deleteTeaching(id);
            setTeachings((t) => t.filter((te) => te.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    }

    useEffect(() => {
    Promise.all([fetchTeachings(), fetchCurrentUser()])
      .then(([teachingData, userData]) => {
        setTeachings(teachingData);
        setUser(userData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

    if (loading) {
        return (
            <main className={book_styles.page}>
                <div className={book_styles.card}>
                    <p className={book_styles.message}>Caricamento insegnamenti...</p>
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

    const canManageTeachings = user?.role === 'SECRETARY';

    return (
        <main className={book_styles.page}>
            <section className={`${book_styles.card} ${book_styles.cardLarge}`}>
                <header className={book_styles.headerRow}>
                    <div>
                        <h1 className={book_styles.title}>Elenco insegnamenti</h1>
                        <p className={book_styles.subtitle}>Elenco degli insegnamenti tenuti dall'Università.</p>
                    </div>

                    {canManageTeachings && (    
                        <div>
                            <button className={book_styles.secondaryButton} onClick={() => navigate('/teachings/new')}>
                                Nuovo insegnamento
                            </button>
                        </div>
                    )}
                </header>

                {teachings.length === 0 ? (
                    <p className={book_styles.message}>Nessun insegnamento disponibile.</p>
                ) : (
                    <div className={book_styles.tableWrapper}>
                        <table className={book_styles.table}>
                            <thead>
                                <tr>
                                    <th className={book_styles.th}>Materia</th>
                                    <th className={book_styles.th}>Corso di laurea</th>
                                    <th className={book_styles.th}>Anno</th>
                                    {canManageTeachings && <th className={book_styles.th}>Azioni</th>}
                                </tr>
                            </thead>

                            <tbody>
                                {teachings.map((t) => (
                                    <tr key={t.id} className={book_styles.row}>
                                        <td className={book_styles.titleCell}>{t.subject.name}</td>
                                        <td className={book_styles.td}>{t.degree.name}</td>
                                        <td className={book_styles.td}>{t.year}</td>

                                        {canManageTeachings && (
                                        <td className={book_styles.td}>
                                            <button className={book_styles.secondaryButton} onClick={() => navigate(`/teachings/${t.id}/edit`)}>
                                                Modifica
                                            </button>
                                            <button className={book_styles.dangerButton} onClick={() => handleDelete(t.id)}>
                                                Elimina
                                            </button>
                                        </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    )
}