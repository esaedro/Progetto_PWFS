import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDegreeById } from './degrees.api';
import { fetchSubjects } from '../subjects/subjects.api';
import { fetchTeachingsByDegreeAndYear, createTeaching, updateTeaching, deleteTeaching } from '../teachings/teachings.api';
import { DegreeItem, SubjectItem, TeachingItem } from '@server/courses';

// Una riga del piano: può essere già salvata (ha teachingId) o nuova
type PlanRow = {
    subjectId: number;
    subjectName: string;
    teachingId: number | null; // null = non ancora salvata
    originalYear: number | null; // anno al momento del caricamento
};

type YearDraft = {
    year: number;
    rows: PlanRow[];
};

export function EditStudyPlanPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [degree, setDegree] = useState<DegreeItem | null>(null);
    const [allSubjects, setAllSubjects] = useState<SubjectItem[]>([]);
    const [yearDrafts, setYearDrafts] = useState<YearDraft[]>([]);
    const [removedRows, setRemovedRows] = useState<PlanRow[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stato per la tendina di ricerca aperta per ciascun anno
    const [searchText, setSearchText] = useState<Record<number, string>>({});
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});

    useEffect(() => {
        if (!id) return;

        Promise.all([fetchDegreeById(Number(id)), fetchSubjects()])
            .then(async ([degreeData, subjectsData]) => {
                setDegree(degreeData);
                setAllSubjects(subjectsData);

                const years = Array.from({ length: degreeData.duration }, (_, i) => i + 1);

                const drafts: YearDraft[] = await Promise.all(
                    years.map(async (year) => {
                        let teachings: TeachingItem[] = [];
                        try {
                            teachings = await fetchTeachingsByDegreeAndYear(Number(id), year);
                        } catch {
                            teachings = [];
                        }
                        return {
                            year,
                            rows: teachings.map((t) => ({
                                subjectId: t.subject.id,
                                subjectName: t.subject.name,
                                teachingId: t.id,
                                originalYear: year,
                            })),
                        };
                    })
                );

                setYearDrafts(drafts);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    // Chiude il dropdown se si clicca fuori
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (openDropdown === null) return;
            const ref = dropdownRefs.current[openDropdown];
            if (ref && !ref.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    // Materie già usate in qualsiasi anno (per escluderle dalla tendina)
    const usedSubjectIds = new Set(yearDrafts.flatMap((yd) => yd.rows.map((r) => r.subjectId)));

    function getFilteredSubjects(year: number): SubjectItem[] {
        const text = (searchText[year] ?? '').toLowerCase();
        return allSubjects.filter(
            (s) =>
                !usedSubjectIds.has(s.id) &&
                s.name.toLowerCase().includes(text)
        );
    }

    function addSubjectToYear(year: number, subject: SubjectItem) {
        // Cerca se questa materia era stata appena rimossa (ha già un teachingId)
        const previousRow = removedRows.find((r) => r.subjectId === subject.id);

        const newRow: PlanRow = previousRow
            ? { ...previousRow, originalYear: previousRow.originalYear } // riusa teachingId e originalYear
            : { subjectId: subject.id, subjectName: subject.name, teachingId: null, originalYear: null };

        // Se viene reinserita, non va più eliminata
        if (previousRow) {
            setRemovedRows((rows) => rows.filter((r) => r.subjectId !== subject.id));
        }

        setYearDrafts((prev) =>
            prev.map((yd) =>
                yd.year === year ? { ...yd, rows: [...yd.rows, newRow] } : yd
            )
        );
        setSearchText((prev) => ({ ...prev, [year]: '' }));
        setOpenDropdown(null);
    }


    function removeRow(year: number, subjectId: number) {
        setYearDrafts((prev) =>
            prev.map((yd) => {
                if (yd.year !== year) return yd;
                const removedRow = yd.rows.find((r) => r.subjectId === subjectId);
                if (removedRow) {
                    setRemovedRows((rows) => [...rows, removedRow]);
                }
                return { ...yd, rows: yd.rows.filter((r) => r.subjectId !== subjectId) };
            })
        );
    }
    
    async function handleSave() {
        if (!id) return;

        setError(null);
        setSaving(true);

        try {
           // Step 1: deduplica prima di eliminare (React duplica gli id)
            // Step 1: elimina solo le righe rimosse che NON sono state reinserite altrove
            const uniqueRemovedIds = [...new Set(
                removedRows
                    .filter((r) => r.teachingId !== null)
                    .map((r) => r.teachingId as number)
            )];

            await Promise.all(uniqueRemovedIds.map((teachingId) => deleteTeaching(teachingId)));

            const ops: Promise<unknown>[] = [];

            yearDrafts.forEach((yd) =>
                yd.rows.forEach((r) => {
                    if (r.teachingId !== null && r.originalYear !== null && r.originalYear !== yd.year) {
                        ops.push(updateTeaching(r.teachingId, { year: yd.year }));
                    }
                })
            );

            yearDrafts.forEach((yd) =>
                yd.rows.forEach((r) => {
                    if (r.teachingId === null) {
                        ops.push(createTeaching({ degreeId: Number(id), subjectId: r.subjectId, year: yd.year }));
                    }
                })
            );

            await Promise.all(ops);

            navigate(`/degrees/${id}`);
        } catch (err: any) {
            console.error('handleSave error:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-500">Caricamento piano di studi...</p>
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
                            Modifica piano di studi · {degree?.duration}{' '}
                            {degree?.duration === 1 ? 'anno' : 'anni'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(`/degrees/${id}`)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                    >
                        Annulla
                    </button>
                </div>

                {/* Sezioni per anno */}
                <div className="space-y-6">
                    {yearDrafts.map(({ year, rows }) => {
                        const filtered = getFilteredSubjects(year);
                        const isOpen = openDropdown === year;

                        return (
                            <section
                                key={year}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Anno {year}
                                        </h2>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            {rows.length === 0
                                                ? 'Nessuna materia'
                                                : `${rows.length} ${rows.length === 1 ? 'materia' : 'materie'}`}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-sm text-slate-600">
                                        {rows.length}
                                    </span>
                                </div>

                                {/* Materie già aggiunte */}
                                {rows.length > 0 && (
                                    <div className="mb-4 divide-y divide-slate-100">
                                        {rows.map((row) => (
                                            <div
                                                key={row.subjectId}
                                                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {row.subjectName}
                                                    </span>
                                                    {row.teachingId === null && (
                                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                            Nuova
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="rounded-lg border border-red-200 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                                                    onClick={() => removeRow(year, row.subjectId)}
                                                >
                                                    Rimuovi
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Tendina di ricerca */}
                                <div
                                    className="relative"
                                    ref={(el) => { dropdownRefs.current[year] = el; }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Cerca e aggiungi una materia..."
                                        value={searchText[year] ?? ''}
                                        onFocus={() => setOpenDropdown(year)}
                                        onChange={(e) => {
                                            setSearchText((prev) => ({ ...prev, [year]: e.target.value }));
                                            setOpenDropdown(year);
                                        }}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                                    />

                                    {isOpen && (
                                        <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-md">
                                            {filtered.length === 0 ? (
                                                <p className="px-3 py-2 text-sm text-slate-500">
                                                    Nessuna materia disponibile
                                                </p>
                                            ) : (
                                                <ul className="max-h-48 overflow-y-auto py-1">
                                                    {filtered.map((s) => (
                                                        <li key={s.id}>
                                                            <button
                                                                type="button"
                                                                className="w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onClick={() => addSubjectToYear(year, s)}
                                                            >
                                                                <span className="font-medium">{s.name}</span>
                                                                {s.professors?.length > 0 && (
                                                                    <span className="ml-2 text-xs text-slate-400">
                                                                        {s.professors.map((p) => p.name).join(', ')}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* Errore globale */}
                {error && (
                    <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {/* Footer azioni */}
                <div className="mt-6 flex items-center justify-end gap-3">
                    {/* <button
                        type="button"
                        onClick={() => navigate(`/degrees/${id}`)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                        Annulla
                    </button> */}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {saving ? 'Salvataggio...' : 'Salva piano di studi'}
                    </button>
                </div>
            </div>
        </main>
    );
}