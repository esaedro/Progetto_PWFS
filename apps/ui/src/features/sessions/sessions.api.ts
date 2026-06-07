import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
}

export async function fetchSessions() {
    const response = await fetch(`${API_URL}/sessions`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function fetchSessionById(sessionId) {
    const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function findSessionByDate(date) {
    const response = await fetch(`${API_URL}/sessions/find-by-date/${date}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json().catch(() => null);
}

export async function createSession(sessionData) {
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

export async function updateSession(sessionId, sessionData) {
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

export async function deleteSession(sessionId) {
    const response = await fetch(`${API_URL}/sessions/delete/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}
