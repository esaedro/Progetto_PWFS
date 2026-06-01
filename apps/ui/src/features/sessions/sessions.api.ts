const API_URL = 'http://localhost:3333/api';

export async function fetchSessions() {
    const response = await fetch(`${API_URL}/sessions`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch sessions');
    }

    return response.json();
}

export async function createSession(sessionData) {
    const response = await fetch(`${API_URL}/sessions/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(sessionData)
    });

    if (!response.ok) {
        throw new Error('Failed to create session');
    }

    return response.json();
}

export async function updateSession(sessionId, sessionData) {
    const response = await fetch(`${API_URL}/sessions/update/${sessionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(sessionData)
    });

    if (!response.ok) {
        throw new Error('Failed to update session');
    }

    return response.json();
}

export async function deleteSession(sessionId) {
    const response = await fetch(`${API_URL}/sessions/delete/${sessionId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete session');
    }

    return response.json();
}
