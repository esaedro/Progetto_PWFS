import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDegreeById } from './degrees.api';
import { fetchTeachingsByDegreeAndYear } from '../teachings/teachings.api';
import { DegreeItem } from '@server/courses';
import { TeachingItem } from '@server/courses';

type YearPlan = {
    year: number;
    teachings: TeachingItem[];
};

export function DegreeDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [degree, setDegree] = useState<DegreeItem | null>(null);
    const [yearPlans, setYearPlans] = useState<YearPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        fetchDegreeById(Number(id))
            .then(async (degreeData) => {
                setDegree(degreeData);

                const years = Array.from({ length: degreeData.duration }, (_, i) => i + 1);

                const results = await Promise.all(
                    years.map(async (year) => {
                        try {
                            const teachings = await fetchTeachingsByDegreeAndYear(Number(id), year);
                            return { year, teachings };
                        } catch {
                            // Nessun insegnamento per questo anno: restituiamo lista vuota
                            return { year, teachings: [] };
                        }
                    })
                );

                setYearPlans(results);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-500">Caricamento piano di studi...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-2xl">

                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{degree?.name}</h1>
                        <p className="text-sm text-slate-500">
                            Piano di studi · {degree?.duration} {degree?.duration === 1 ? 'anno' : 'anni'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/degrees')}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                    >
                        Indietro
                    </button>
                </div>

                {/* Piano di studi per anno */}
                <div className="space-y-6">
                    {yearPlans.map(({ year, teachings }) => (
                        <section
                            key={year}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Anno {year}
                                    </h2>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                    {teachings.length}
                                </span>
                            </div>

                            {teachings.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    Nessuna materia per questo anno.
                                </p>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {teachings.map((teaching) => (
                                        <div
                                            key={teaching.id}
                                            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                                        >
                                            <span className="text-sm font-medium text-slate-900">
                                                {teaching.subject.name}
                                            </span>
{/*                                             {teaching.professors?.length > 0 && (
                                                <span className="text-xs text-slate-500">
                                                    {teaching.professors.map((p) => p.name).join(', ')}
                                                </span>
                                            )} */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}