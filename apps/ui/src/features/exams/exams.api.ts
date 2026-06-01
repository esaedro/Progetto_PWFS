const API_URL = 'http://localhost:3000/api';

export async function fetchExams() {
    const response = await fetch(`${API_URL}/exams`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch exams');
    }

    return response.json();
}

export async function createExam(examData) {
    const response = await fetch(`${API_URL}/exams/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(examData)
    });

    if (!response.ok) {
        throw new Error('Failed to create exam');
    }

    return response.json();
}

export async function updateExam(examId, examData) {
    const response = await fetch(`${API_URL}/exams/update/${examId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(examData)
    });

    if (!response.ok) {
        throw new Error('Failed to update exam');
    }

    return response.json();
}

export async function deleteExam(examId) {
    const response = await fetch(`${API_URL}/exams/delete/${examId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete exam');
    }

    return response.json();
}
