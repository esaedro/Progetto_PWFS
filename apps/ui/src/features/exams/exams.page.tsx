import { useEffect, useState } from 'react';
import { fetchExams } from './exams.api';

export function ExamsPage() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadExams() {
            try {
                const data = await fetchExams();
                setExams(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadExams();
    }, []);

    if (loading) {
        return <div>Loading exams...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Exams</h1>
            <ul>
                {exams.map(exam => (
                    <li key={exam.id}>{exam.name} - {new Date(exam.date).toLocaleDateString()}</li>
                ))}
            </ul>
        </div>
    );
}
