import { useEffect, useMemo, useState } from 'react';
import { fetchSessions } from './sessions.api';

type SessionItem = {
    id: number;
    dateStartExamination: string | Date;
    dateEndExamination: string | Date;
    dateStartInsertion: string | Date;
    dateEndInsertion: string | Date;
};

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

export function SessionsPage() {
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(() => new Date());

    useEffect(() => {
        let active = true;
        setLoading(true);
        fetchSessions()
            .then((data) => {
                if (active) {
                    setSessions(Array.isArray(data) ? data : []);
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
        return [...sessions].sort(
            (a, b) =>
                toDateOnly(a.dateStartInsertion).getTime() -
                toDateOnly(b.dateStartInsertion).getTime()
        );
    }, [sessions]);

    const monthLabel = currentMonth.toLocaleDateString('it-IT', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Sessioni</h1>
                <p className="text-sm text-slate-600">
                    Calendario delle finestre di inserimento e di esaminazione.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Inserimento
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            Esaminazione
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-violet-500" />
                            Periodi sovrapposti
                        </div>
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

                            const toneClass = inInsertion && inExamination
                                ? 'bg-violet-100 border-violet-200 text-violet-900'
                                : inInsertion
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-900'
                                    : inExamination
                                        ? 'bg-amber-100 border-amber-200 text-amber-900'
                                        : isCurrent
                                            ? 'bg-white border-slate-200 text-slate-900'
                                            : 'bg-slate-50 border-slate-200 text-slate-400';

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`flex h-20 flex-col justify-between rounded-xl border p-2 text-sm ${toneClass} ${isToday ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-50' : ''
                                        }`}
                                >
                                    <span className="font-medium">{day.getDate()}</span>
                                    <div className="flex items-center gap-1">
                                        {inInsertion && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                                        {inExamination && <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Sessioni programmate</h2>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            {sessions.length}
                        </span>
                    </div>

                    <div className="mt-4 space-y-3">
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
                                        Sessione #{session.id}
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
                                </div>
                            ))}
                    </div>
                </aside>
            </div>
        </main>
    );
}
