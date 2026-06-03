import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import book_styles from '../css/books.module.css';
import { createDegree } from './degrees.api';

export function CreateDegreePage() {
    const [name, setName] = useState('');
    const [durationYears, setDurationYears] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            await createDegree({
                name,
                durationYears: Number(durationYears),
            });

            navigate('/degrees');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={book_styles.page}>
            <section className={`${book_styles.card} ${book_styles.cardSmall}`}>
                <h1 className={book_styles.title}>Nuovo corso di laurea</h1>

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

                    <button className={book_styles.button} disabled={loading}>
                        {loading ? 'Salvataggio...' : 'Crea corso di laurea'}
                    </button>
                </form>

                {error && <p className={book_styles.error}>{error}</p>}
            </section>
        </main>
    );
}
