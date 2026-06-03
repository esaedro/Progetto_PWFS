import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubjectItem } from '@server/courses'; 
import { fetchSubjects, deleteSubject } from './subjects.api';
import { fetchCurrentUser } from '../auth/auth.api';
import book_styles from '../css/books.module.css';
import { UserListItem } from '@server/users';

export function SubjectsPage() {

    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [user, setUser] = useState<UserListItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    async function handleDelete(id: number) {
        const confirmed = window.confirm('Vuoi davvero cancellare questa materia?');

        if(!confirmed) return;

        try {
            await deleteSubject(id);
            setSubjects((s) => s.filter((sub) => sub.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    }

    useEffect(() => {
        Promise.all([fetchSubjects(), fetchCurrentUser()])
          .then(([subjectsData, userData]) => {
            setSubjects(subjectsData);
            setUser(userData);
          })
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false));
      }, []);

    if (loading) {
        return (
            <main className={book_styles.page}>
                <div className={book_styles.card}>
                    <p className={book_styles.message}>Caricamento materie...</p>
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

    const canManageSubjects = user?.role === 'SECRETARY';

    return (
        <main className={book_styles.page}>
            <section className={`${book_styles.card} ${book_styles.cardLarge}`}>
                <header className={book_styles.headerRow}>
                    <div>
                        <h1 className={book_styles.title}>Elenco materie</h1>
                        <p className={book_styles.subtitle}>Elenco delle materie e dei relativi professori.</p>
                    </div>
                    
                    {canManageSubjects && (
                        <div>
                            <button className={book_styles.secondaryButton} onClick={() => navigate('/subjects/new')}>
                                Nuova materia
                            </button>
                        </div>
                    )}
                </header>

                {subjects.length === 0 ? (
                    <p className={book_styles.message}>Nessuna materia disponibile.</p>
                ) : (
                    <div className={book_styles.tableWrapper}>
                        <table className={book_styles.table}>
                            <thead>
                                <tr>
                                    <th className={book_styles.th}>Nome</th>
                                    <th className={book_styles.th}>Professori</th>
                                    {canManageSubjects && <th className={book_styles.th}>Azioni</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((sub) => (
                                    <tr key={sub.id} className={book_styles.row}>
                                        <td className={book_styles.titleCell}>{sub.name}</td>
                                        <td className={book_styles.td}>
                                            {sub.professors?.length ? (
                                                sub.professors.map((p) => p.name).join(', ')
                                            ) : (
                                                'N/D'
                                            )}
                                        </td>
                                        {canManageSubjects && (
                                        <td className={book_styles.td}>
                                            <button className={book_styles.secondaryButton} onClick={() => navigate(`/subjects/${sub.id}/edit`)}>
                                                Modifica
                                            </button>
                                            <button className={book_styles.dangerButton} onClick={() => handleDelete(sub.id)}>
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