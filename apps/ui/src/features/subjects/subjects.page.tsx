import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubjectItem } from '@server/courses'; 

export function SubjectsPage() {

    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    if (loading) {
        return <div>Caricamento...</div>;
    }

    if (error) {
        return <div>Errore: {error}</div>;
    }

    return (<main> Subjects Page </main>)
}