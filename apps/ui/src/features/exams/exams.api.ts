import { handleApiError } from '../shared/utils.api';
import { ExamItem, CreateExamDto, UpdateExamDto } from '@server/exams';

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
}

export async function fetchExams() {
    const response = await fetch(`${API_URL}/exams`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function fetchExamsByProfessor(professorId) {
    const response = await fetch(`${API_URL}/exams/professor/${professorId}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function createExam(examData: CreateExamDto): Promise<ExamItem> {
    const response = await fetch(`${API_URL}/exams/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(examData)
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function updateExam(examId: number, examData: UpdateExamDto): Promise<ExamItem> {
    const response = await fetch(`${API_URL}/exams/update/${examId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(examData)
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function deleteExam(examId) {
    const response = await fetch(`${API_URL}/exams/delete/${examId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}
