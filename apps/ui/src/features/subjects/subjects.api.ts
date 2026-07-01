import { CreateSubjectDto, SubjectItem, UpdateSubjectDto } from "@server/courses";
import { handleApiError } from "../shared/utils.api";
import { ProfessorListItem } from "@server/people";

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
    }
}

export async function fetchSubjects() {
    const response = await fetch(`${API_URL}/subjects`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function createSubject(payload: CreateSubjectDto): Promise<SubjectItem> {
  const response = await fetch(`${API_URL}/subjects/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function deleteSubject(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/subjects/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }
}

export async function updateSubject(id: number, payload: UpdateSubjectDto): Promise<SubjectItem> {
  const response = await fetch(`${API_URL}/subjects/update/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function fetchSubjectById(id: number): Promise<SubjectItem> {
  const response = await fetch(`${API_URL}/subjects/${id}`, {
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function fetchProfessors(): Promise<ProfessorListItem[]> {
  const response = await fetch(`${API_URL}/people`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}