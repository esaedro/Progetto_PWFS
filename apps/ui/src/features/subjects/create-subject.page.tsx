import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import book_styles from '../css/books.module.css';
import { createSubject, fetchProfessors } from './subjects.api';
import { ProfessorListItem } from '@server/people';

export function CreateSubjectPage() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [professors, setProfessors] = useState<ProfessorListItem[]>([]);
    const [professorSearch, setProfessorSearch] = useState('');
    const [selectedProfessors, setSelectedProfessors] = useState<ProfessorListItem[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfessors()
        .then(setProfessors)
        .catch((err) => setError(err.message));
    }, []);

    const filteredProfessors = professors.filter((prof) => {
        const search = professorSearch.toLowerCase();
        const already = selectedProfessors.some((s) => s.professor_id === prof.professor_id);
        return !already && (prof.name.toLowerCase().includes(search) || (prof.email || '').toLowerCase().includes(search));
    });

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    if (selectedProfessors.length === 0) {
        setError('Seleziona almeno un professore');
        setLoading(false);
        return;
    }

    const payload = {
        name,
        professorIds: selectedProfessors.map((p) => Number(p.professor_id)),
    };

    try {
        await createSubject(payload);
        navigate('/subjects');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}

    return (
        <main className={book_styles.page}>
            <section className={`${book_styles.card} ${book_styles.cardSmall}`}>
                <h1 className={book_styles.title}>Nuova materia</h1>

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
                                            onClick={() => setSelectedProfessors((current) => current.filter((item) => item.professor_id !== p.professor_id))}
                                        >
                                            Rimuovi
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button className={book_styles.button} disabled={loading}>
                        {loading ? 'Salvataggio...' : 'Crea materia'}
                    </button>
                </form>

                {error && <p className={book_styles.error}>{error}</p>}
            </section>
        </main>
    );
}
