import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DegreeItem } from '@server/courses'; 
import { fetchDegrees, deleteDegree } from './degrees.api';
import book_styles from '../css/books.module.css';

export function DegreesPage() {

    const [degrees, setDegrees] = useState<DegreeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    async function handleDelete(id: number) {
        const confirmed = window.confirm('Vuoi davvero cancellare questo corso di laurea?');

        if(!confirmed) return;

        try {
            await deleteDegree(id);
            setDegrees((d) => d.filter((deg) => deg.id !== id));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        }
    }

    useEffect(() => {
        fetchDegrees()
        .then(setDegrees)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <main className={book_styles.page}>
                <div className={book_styles.card}>
                    <p className={book_styles.message}>Caricamento corsi di laurea...</p>
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
            <section className={`${book_styles.card} ${book_styles.cardLarge}`}>
                <header className={book_styles.headerRow}>
                    <div>
                        <h1>Elenco corsi di laurea</h1>
                        <p className={book_styles.subtitle}>Elenco dei corsi di laurea presenti nel sistema.</p>
                    </div>
                    <div>
                        <button className={book_styles.secondaryButton} onClick={() => navigate('/degrees/new')}>
                            Nuovo corso
                        </button>
                    </div>
                </header>

                {degrees.length === 0 ? (
                    <p className={book_styles.message}>Nessun corso di laurea disponibile.</p>
                ) : (
                    <div className={book_styles.tableWrapper}>
                        <table className={book_styles.table}>
                            <thead>
                                <tr>
                                    <th className={book_styles.th}>Nome</th>
                                    <th className={book_styles.th}>Durata (anni)</th>
                                    <th className={book_styles.th}>Azioni</th>
                                </tr>
                            </thead>

                            <tbody>
                                {degrees.map((deg) => (
                                    <tr key={deg.id} className={book_styles.row}>
                                        <td className={book_styles.titleCell}>{deg.name}</td>
                                        <td className={book_styles.td}>{deg.duration}</td>
                                        <td className={book_styles.td}>
                                            <button
                                                className={book_styles.secondaryButton}
                                                onClick={() => navigate(`/degrees/${deg.id}/edit`)}
                                            >
                                                Modifica
                                            </button>

                                            <button
                                                className={book_styles.dangerButton}
                                                onClick={() => handleDelete(deg.id)}
                                            >
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
    )
}