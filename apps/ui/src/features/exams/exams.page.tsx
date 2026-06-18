import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../auth/auth.api';
import { fetchSessions } from '../sessions/sessions.api';
import { fetchExams, deleteExam } from './exams.api';
import { UserListItem } from '@server/users';
import { ExamItem, SessionItem } from '@server/exams';
import { ConfirmModal } from '../shared/confirm-modal';

const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

function toDateOnly(value: string | Date): Date {
    const date = value instanceof Date ? value : new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(value: string | Date): string {
    const date = toDateOnly(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

function formatDateTime(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function ExamsPage() {
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [allExams, setAllExams] = useState<ExamItem[]>([]);
    const [currentUser, setCurrentUser] = useState<UserListItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [showOnlyMine, setShowOnlyMine] = useState(true);
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [detailTarget, setDetailTarget] = useState<ExamItem | null>(null);
    const navigate = useNavigate();

    const handleDeleteExam = async () => {
        if (deleteTarget === null) return;
        try {
            await deleteExam(deleteTarget);
            setDeleteTarget(null);
            const examsData = await fetchExams();
            setAllExams(Array.isArray(examsData) ? examsData : []);
        } catch (err) {
            setDeleteTarget(null);
            setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione');
        }
    };

    useEffect(() => {
        let active = true;

        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [sessionsData, examsData, userData] = await Promise.all([
                    fetchSessions(),
                    fetchExams(),
                    fetchCurrentUser()
                ]);

                if (!active) {
                    return;
                }

                setSessions(Array.isArray(sessionsData) ? sessionsData : []);
                setAllExams(Array.isArray(examsData) ? examsData : []);
                setCurrentUser(userData);

                if (userData?.role !== 'PROFESSOR') {
                    setShowOnlyMine(false);
                }

                // La distinzione "miei appelli" è ora basata su subjectProfessors
                // Non serve più fetchare gli esami per professore
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : 'Errore nel caricamento degli appelli');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadData();

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

    const examCountByDay = useMemo(() => {
        const map = new Map<string, number>();
        allExams.forEach((exam) => {
            const key = toDateKey(exam.dateTimeStart);
            map.set(key, (map.get(key) ?? 0) + 1);
        });
        return map;
    }, [allExams]);

    // Un esame è "mio" se il professore loggato insegna la materia
    const myExamIds = useMemo(() => {
        if (!currentUser) return new Set<number>();
        const ids = new Set<number>();
        for (const exam of allExams) {
            const profs = (exam.teaching?.subject as any)?.professors ?? [];
            const teaches = profs.some(
                (p: any) => Number(p.professor_id) === Number(currentUser.id)
            );
            if (teaches) ids.add(exam.id);
        }
        return ids;
    }, [allExams, currentUser]);

    const mineCountByDay = useMemo(() => {
        const map = new Map<string, number>();
        allExams.forEach((exam) => {
            if (myExamIds.has(exam.id)) {
                const key = toDateKey(exam.dateTimeStart);
                map.set(key, (map.get(key) ?? 0) + 1);
            }
        });
        return map;
    }, [allExams, myExamIds]);

    const allHolidays = useMemo(() => {
        const holidays = new Set<string>();
        sessions.forEach((s) => (s.holidays ?? []).forEach((h) => holidays.add(h)));
        return holidays;
    }, [sessions]);

    const filteredExams = useMemo(() => {
        const base = showOnlyMine
            ? allExams.filter((exam) => myExamIds.has(exam.id))
            : allExams;
        return [...base].sort(
            (a, b) =>
                new Date(a.dateTimeStart).getTime() - new Date(b.dateTimeStart).getTime()
        );
    }, [allExams, myExamIds, showOnlyMine]);

    const monthLabel = currentMonth.toLocaleDateString('it-IT', {
        month: 'long',
        year: 'numeric',
    });

    const filteredExamsByDate = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const bySearch = query
            ? filteredExams.filter((exam) =>
                (exam.teaching?.subject?.name ?? '').toLowerCase().includes(query)
            )
            : filteredExams;

        if (!selectedDateKey) {
            return bySearch;
        }
        return bySearch.filter((exam) => toDateKey(exam.dateTimeStart) === selectedDateKey);
    }, [filteredExams, selectedDateKey, searchQuery]);

    const selectedDateLabel = selectedDateKey
        ? toDateOnly(selectedDateKey).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
        : null;

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Appelli</h1>
                    <p className="text-sm text-slate-600">
                        Calendario delle sessioni e degli appelli fissati.
                    </p>
                </div>
                {currentUser?.role === 'PROFESSOR' && (
                    <button
                        type="button"
                        onClick={() => navigate('/exams/new')}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-700"
                    >
                        Nuovo appello
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:h-[740px]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Calendario appelli</h2>
                            <p className="text-sm text-slate-500">
                                Evidenziazione periodi di sessione con appelli fissati.
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
                            <span className="h-2 w-2 rounded-full bg-violet-500" />
                            Periodi sovrapposti
                        </div>*/}
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-sky-500" />
                            Appelli fissati (tutti)
                        </div>
                        {currentUser?.role === 'PROFESSOR' && (
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-indigo-500" />
                                Appelli miei
                            </div>
                        )}
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
                            const dateStr = toDateKey(day);
                            const dayKey = dateStr;
                            const examCount = examCountByDay.get(dayKey) ?? 0;
                            const myExamCount = mineCountByDay.get(dayKey) ?? 0;
                            const isSelected = selectedDateKey === dayKey;
                            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                            const isHoliday = allHolidays.has(dateStr);
                            const isUnavailable = isWeekend || isHoliday;

                            // I giorni non disponibili (sabato, domenica, festivi) hanno sfondo scuro
                            // SOLO se non sono nel periodo di inserimento
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
                                <button
                                    type="button"
                                    key={day.toISOString()}
                                    onClick={() =>
                                        setSelectedDateKey((prev) => prev === dayKey ? null : dayKey)
                                    }
                                    className={`flex flex-col justify-between rounded-xl border p-2 text-left text-sm transition ${toneClass} ${isToday ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-50' : ''
                                        } ${isSelected ? 'ring-2 ring-slate-900 ring-offset-1 ring-offset-slate-50' : ''} h-[86px]`}
                                >
                                    <div className="flex items-start justify-between">
                                        <span className="font-medium">{day.getDate()}</span>
                                        <div className="flex items-center gap-1">
                                            {examCount > 0 && (
                                                <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                                                    {examCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div className="flex items-center gap-1">
                                            {examCount > 0 && <span className="h-2.5 w-2.5 rounded-full bg-sky-600" />}
                                            {myExamCount > 0 && <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
                                        </div>
                                        {currentUser?.role === 'PROFESSOR' && inExamination && !isUnavailable && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/exams/new?date=${toDateKey(day)}`);
                                                }}
                                                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-400"
                                                title="Crea appello in questa data"
                                            >
                                                +
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:h-[740px]">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Appelli programmati</h2>
                            {currentUser?.role === 'PROFESSOR' && (
                                <p className="text-xs text-slate-500">{currentUser?.name ?? currentUser?.email ?? 'Utente'}</p>
                            )}
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            {filteredExamsByDate.length}
                        </span>
                    </div>

                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="Cerca per insegnamento..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                        />
                    </div>

                    {currentUser?.role === 'PROFESSOR' && (
                        <label className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-slate-900"
                                checked={showOnlyMine}
                                onChange={(event) => setShowOnlyMine(event.target.checked)}
                            />
                            Mostra solo i miei appelli
                        </label>
                    )}

                    {selectedDateLabel && (
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            Appelli del <span className="font-semibold text-slate-800">{selectedDateLabel}</span>
                            <span className="ml-2 text-xs text-slate-400">
                                <br />(clicca di nuovo sulla data per rimuovere il filtro)
                            </span>
                        </div>
                    )}

                    <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                        {loading && <p className="text-sm text-slate-500">Caricamento appelli...</p>}
                        {error && (
                            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}
                        {!loading && !error && filteredExamsByDate.length === 0 && (
                            <p className="text-sm text-slate-500">Nessun appello programmato.</p>
                        )}
                        {!loading &&
                            !error &&
                            filteredExamsByDate.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="rounded-xl border border-slate-200 p-4"
                                >
                                    <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-900">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="truncate">
                                                {exam.teaching?.subject?.name ?? `Appello #${exam.id}`}
                                            </span>
                                            <span className="shrink-0 text-[10px] font-normal text-slate-500">
                                                Anno {exam.teaching?.year}
                                            </span>
                                            {!showOnlyMine && myExamIds.has(exam.id) && (
                                                <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                                    Mio
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                                        <div>
                                            <span className="font-medium">Inizio:</span>{' '}
                                            {formatDateTime(exam.dateTimeStart)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Fine:</span>{' '}
                                            {formatDateTime(exam.dateTimeEnd)}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setDetailTarget(exam)}
                                            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                        >
                                            Dettagli
                                        </button>
                                        {myExamIds.has(exam.id) && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/exams/${exam.id}/edit`)}
                                                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                                >
                                                    Modifica
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(exam.id)}
                                                    className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    Elimina
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </aside>
            </div>

            <ConfirmModal
                open={deleteTarget !== null}
                title="Elimina appello"
                message="Sei sicuro di voler eliminare questo appello? L'operazione non può essere annullata."
                confirmLabel="Elimina"
                cancelLabel="Annulla"
                onConfirm={handleDeleteExam}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* Modale dettagli esame */}
            {detailTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setDetailTarget(null)}
                    />
                    <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-base font-semibold text-slate-900">
                                Dettagli appello
                            </h3>
                            <button
                                type="button"
                                onClick={() => setDetailTarget(null)}
                                className="text-lg text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-sm text-slate-700">
                            <div>
                                <span className="font-semibold text-slate-900">Insegnamento:</span>{' '}
                                {detailTarget.teaching?.subject?.name ?? '—'}
                            </div>
                            <div>
                                <span className="font-semibold text-slate-900">Corso di laurea:</span>{' '}
                                {detailTarget.teaching?.degree?.name ?? '—'}
                            </div>
                            <div>
                                <span className="font-semibold text-slate-900">Anno:</span>{' '}
                                {detailTarget.teaching?.year ?? '—'}
                            </div>
                            <div>
                                <span className="font-semibold text-slate-900">Inizio:</span>{' '}
                                {formatDateTime(detailTarget.dateTimeStart)}
                            </div>
                            <div>
                                <span className="font-semibold text-slate-900">Fine:</span>{' '}
                                {formatDateTime(detailTarget.dateTimeEnd)}
                            </div>
                            {detailTarget.type && (
                                <div>
                                    <span className="font-semibold text-slate-900">Tipo:</span>{' '}
                                    {detailTarget.type}
                                </div>
                            )}
                            <div>
                                <span className="font-semibold text-slate-900">Professori:</span>{' '}
                                {(detailTarget.teaching?.subject as any)?.professors?.length > 0
                                    ? (detailTarget.teaching?.subject as any).professors.map((p: any) => p.user?.name).join(', ')
                                    : detailTarget.professor?.user.name ?? '—'}
                            </div>
                            {detailTarget.room && (
                                <div>
                                    <span className="font-semibold text-slate-900">Aula:</span>{' '}
                                    {detailTarget.room}
                                </div>
                            )}
                            <div>
                                <span className="font-semibold text-slate-900">Parziale:</span>{' '}
                                {detailTarget.partial ? 'Sì' : 'No'}
                            </div>
                            {detailTarget.description && (
                                <div>
                                    <span className="font-semibold text-slate-900">Descrizione:</span>{' '}
                                    {detailTarget.description}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setDetailTarget(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                            >
                                Chiudi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
