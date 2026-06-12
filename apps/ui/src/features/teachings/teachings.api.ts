import { CreateTeachingDto, TeachingItem, UpdateTeachingDto } from "@server/courses";
import { handleApiError } from "../shared/utils.api";

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
    }
}

export async function fetchTeachings() {
    const response = await fetch(`${API_URL}/teachings`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function createTeaching(payload: CreateTeachingDto): Promise<TeachingItem> {
  const response = await fetch(`${API_URL}/teachings/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if(!response.ok) {
    await handleApiError(response);
  }
  return response.json();
}

export async function deleteTeaching(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/teachings/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }
}

export async function updateTeaching(id: number, payload: UpdateTeachingDto): Promise<TeachingItem> {
  const response = await fetch(`${API_URL}/teachings/update/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function fetchTeachingById(id: number): Promise<TeachingItem> {
  const response = await fetch(`${API_URL}/teachings/${id}`, {
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// TODO? API presenti nel controller non implementate nel client
//GET /teachings/by-professor/:professorId
export async function fetchTeachingsByProfessor(professorId: number): Promise<TeachingItem[]> {
    const response = await fetch(`${API_URL}/teachings/by-professor/${professorId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }
  
  return response.json();
}

// GET /teachings/by-degree/:degreeId/year/:year
export async function fetchTeachingsByDegreeAndYear(degreeId: number, year: number): Promise<TeachingItem[]> {
    const response = await fetch(`${API_URL}/teachings/by-degree/${degreeId}/year/${year}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

  return response.json();
}

// GET /teachings/by-subject/:subjectId
export async function fetchTeachingsBySubject(subjectId: number): Promise<TeachingItem[]> {
    const response = await fetch(`${API_URL}/teachings/by-subject/${subjectId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

  return response.json();
}
