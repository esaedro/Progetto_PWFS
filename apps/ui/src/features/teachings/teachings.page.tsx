import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeachingItem } from '@server/courses'; 

export function TeachingsPage() {

    const [teachings, setTeachings] = useState<TeachingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    if (loading) {
        return <div>Caricamento...</div>;
    }

    if (error) {
        return <div>Errore: {error}</div>;
    }

    return (<main> Teaching Page </main>)
}