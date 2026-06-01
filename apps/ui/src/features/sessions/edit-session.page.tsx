import { useEffect, useMemo, useState } from 'react';

export function EditSessionPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchSessions() {
            try {
                const response = await fetch('/api/sessions', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch sessions');
                }

                const data = await response.json();
                setSessions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchSessions();
    }, []);

    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [sessions]);

    if (loading) {
        return <div>Loading sessions...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Sessions</h1>
            <ul>
                {sortedSessions.map(session => (
                    <li key={session.id}>{session.name} - {new Date(session.date).toLocaleDateString()}</li>
                ))}
            </ul>
        </div>
    );
}
