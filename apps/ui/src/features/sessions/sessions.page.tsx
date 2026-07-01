import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSessions, deleteSession } from './sessions.api';
import { SessionItem } from "@server/exams";
import { ConfirmModal } from '../shared/confirm-modal';

const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

function toDateOnly(value: string | Date): Date {
    const date = value instanceof Date ? value : new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isWithinRange(day: Date, start: string | Date, end: string | Date): boolean {
    const target = toDateOnly(day).getTime();
    const startTime = toDateOnly(start).getTime();
    const endTime = toDateOnly(end).getTime();
    return target >= startTime && target <= endTime;
}

function formatDate(value: string | Date): string {
    return toDateOnly(value).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function getMonthName(value: string | Date): string {
    const date = toDateOnly(value);
    return date.toLocaleDateString('it-IT', { month: 'long' });
}

function getExaminationPeriodLabel(start: string | Date, end: string | Date): string {
    const startMonth = getMonthName(start);
    const endMonth = getMonthName(end);
    const startYear = toDateOnly(start).getFullYear();
    const endYear = toDateOnly(end).getFullYear();

    if (startMonth === endMonth && startYear === endYear) {
        return startMonth.charAt(0).toUpperCase() + startMonth.slice(1);
    }

    const startLabel = startMonth.charAt(0).toUpperCase() + startMonth.slice(1);
    const endLabel = endMonth.charAt(0).toUpperCase() + endMonth.slice(1);
    return `${startLabel}-${endLabel}`;
}

export function SessionsPage() {
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [allHolidays, setAllHolidays] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const navigate = useNavigate();

    const handleDeleteSession = async () => {
        if (deleteTarget === null) return;
        try {
            await deleteSession(deleteTarget);
            setDeleteTarget(null);
            const data = await fetchSessions();
            setSessions(Array.isArray(data) ? data : []);
        } catch (err) {
            setDeleteTarget(null);
            setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione');
        }
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        fetchSessions()
            .then((data) => {
                if (active) {
                    setSessions(Array.isArray(data) ? data : []);
                    const holidays = new Set<string>();
                    (Array.isArray(data) ? data : []).forEach((s) =>
                        (s.holidays ?? []).forEach((h) => holidays.add(h))
                    );
                    setAllHolidays(holidays);
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err instanceof Error ? err.message : 'Errore nel caricamento delle sessioni');
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstOfMonth = new Date(year, month, 1);
        const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
        const calendarStart = new Date(year, month, 1 - firstWeekday);

        return Array.from({ length: 42 }, (_, index) =>
            new Date(calendarStart.getFullYear(), calendarStart.getMonth(), calendarStart.getDate() + index)
        );
    }, [currentMonth]);

    const sortedSessions = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return [...sessions]
            .filter((s) => {
                if (!query) return true;
                const label = getExaminationPeriodLabel(s.dateStartExamination, s.dateEndExamination);
                return label.toLowerCase().includes(query);
            })
            .sort(
                (a, b) =>
                    toDateOnly(a.dateStartInsertion).getTime() -
                    toDateOnly(b.dateStartInsertion).getTime()
            );
    }, [sessions, searchQuery]);

    const monthLabel = currentMonth.toLocaleDateString('it-IT', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Sessioni</h1>
                    <p className="text-sm text-slate-600">
                        Calendario delle finestre di inserimento e di esaminazione.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/sessions/new')}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700"
                >
                    Nuova sessione
                </button>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:h-[740px]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Calendario sessioni</h2>
                            <p className="text-sm text-slate-500">
                                Le date evidenziate rientrano nei periodi di sessione.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentMonth(
                                        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                                    )
                                }
                                className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
                            >
                                ‹
                            </button>
                            <span className="min-w-[140px] text-center text-sm font-medium capitalize text-slate-900">
                                {monthLabel}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentMonth(
                                        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                                    )
                                }
                                className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
                            >
                                ›
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date())}
                                className="rounded-lg bg-slate-900 px-3 py-1 text-sm text-white hover:bg-slate-700"
                            >
                                Oggi
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-emerald-500" />
                            Inserimento
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-amber-500" />
                            Esaminazione
                        </div>
                        {/*<div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-violet-500" />
                            Periodi sovrapposti
                        </div>*/}
                    </div>

                    <div className="mt-6 grid grid-cols-7 text-xs font-semibold text-slate-500">
                        {weekDays.map((day) => (
                            <div key={day} className="py-2 text-center">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day) => {
                            const inInsertion = sessions.some((session) =>
                                isWithinRange(day, session.dateStartInsertion, session.dateEndInsertion)
                            );
                            const inExamination = sessions.some((session) =>
                                isWithinRange(day, session.dateStartExamination, session.dateEndExamination)
                            );
                            const isCurrent = day.getMonth() === currentMonth.getMonth();
                            const isToday = isSameDay(day, new Date());
                            const dayOfWeek = day.getDay();
                            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                            const year = day.getFullYear();
                            const month = String(day.getMonth() + 1).padStart(2, '0');
                            const dayOfMonth = String(day.getDate()).padStart(2, '0');
                            const dateStr = `${year}-${month}-${dayOfMonth}`;
                            const isHoliday = allHolidays.has(dateStr);
                            const isUnavailable = isWeekend || isHoliday;
                            const isGreyedUnavailable = isUnavailable && !inInsertion;

                            const toneClass = inInsertion && inExamination
                                ? 'bg-violet-100 border-violet-200 text-violet-900'
                                : inInsertion
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-900'
                                    : isGreyedUnavailable
                                        ? 'bg-slate-100 border-slate-300 text-slate-500'
                                        : inExamination
                                            ? 'bg-amber-100 border-amber-200 text-amber-900'
                                            : isCurrent
                                                ? 'bg-white border-slate-200 text-slate-900'
                                                : 'bg-slate-50 border-slate-200 text-slate-400';

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`flex flex-col justify-between rounded-xl border p-2 text-sm ${toneClass} ${isToday ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-50' : ''
                                        } h-[86px]`}
                                >
                                    <span className="font-medium">{day.getDate()}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:h-[740px]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Sessioni programmate</h2>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            {sortedSessions.length}
                        </span>
                    </div>

                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="Cerca mese..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                        />
                    </div>

                    <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                        {loading && <p className="text-sm text-slate-500">Caricamento sessioni...</p>}
                        {error && (
                            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}
                        {!loading && !error && sortedSessions.length === 0 && (
                            <p className="text-sm text-slate-500">Nessuna sessione programmata.</p>
                        )}
                        {!loading &&
                            !error &&
                            sortedSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="rounded-xl border border-slate-200 p-4"
                                >
                                    <div className="text-sm font-semibold text-slate-900">
                                        {getExaminationPeriodLabel(session.dateStartExamination, session.dateEndExamination)}
                                    </div>
                                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                                        <div>
                                            <span className="font-medium">Inserimento:</span>{' '}
                                            {formatDate(session.dateStartInsertion)} →{' '}
                                            {formatDate(session.dateEndInsertion)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Esaminazione:</span>{' '}
                                            {formatDate(session.dateStartExamination)} →{' '}
                                            {formatDate(session.dateEndExamination)}
                                        </div>
                                    </div>
                                    {(() => {
                                        const today = new Date();
                                        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                        const insertStart = new Date(session.dateStartInsertion).toISOString().slice(0, 10);
                                        const isStarted = todayStr >= insertStart;
                                        return !isStarted ? (
                                            <div className="mt-3 flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/sessions/${session.id}/edit`)}
                                                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                                >
                                                    Modifica
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(session.id)}
                                                    className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    Elimina
                                                </button>
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            ))}
                    </div>
                </aside>
            </div>

            <ConfirmModal
                open={deleteTarget !== null}
                title="Elimina sessione"
                message="Sei sicuro di voler eliminare questa sessione? L'operazione non può essere annullata."
                confirmLabel="Elimina"
                cancelLabel="Annulla"
                onConfirm={handleDeleteSession}
                onCancel={() => setDeleteTarget(null)}
            />
        </main>
    );
}
