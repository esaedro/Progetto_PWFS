import { handleApiError } from '../shared/utils.api';
import { SessionItem, CreateSessionDto, UpdateSessionDto } from '@server/exams';

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
}

export async function fetchSessions(): Promise<SessionItem[]> {
    const response = await fetch(`${API_URL}/sessions`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function fetchSessionById(sessionId: number): Promise<SessionItem> {
    const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function findSessionByDate(date: Date): Promise<SessionItem | null> {
    const dateString = date.toISOString()
    const response = await fetch(`${API_URL}/sessions/find-by-date/${dateString}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json().catch(() => null);
}

export async function createSession(sessionData: CreateSessionDto): Promise<SessionItem> {
    const response = await fetch(`${API_URL}/sessions/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sessionData)
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function updateSession(sessionId: number, sessionData: UpdateSessionDto): Promise<SessionItem> {
    const response = await fetch(`${API_URL}/sessions/update/${sessionId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(sessionData)
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function deleteSession(sessionId: number): Promise<void> {
    const response = await fetch(`${API_URL}/sessions/delete/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}
