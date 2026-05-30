import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DegreeItem } from '@server/courses'; 

export function DegreesPage() {

    const [degrees, setDegrees] = useState<DegreeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    if (loading) {
        return <div>Caricamento...</div>;
    }

    if (error) {
        return <div>Errore: {error}</div>;
    }

    return (<main> Degree Page </main>)
}