import { CreateDegreeDto, DegreeItem, UpgradeDegreeDto } from "@server/courses";
import { handleApiError } from "../shared/utils.api";

const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
    }
}

export async function fetchDegrees() {
  const response = await fetch(`${API_URL}/degrees`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function createDegree(payload: CreateDegreeDto): Promise<DegreeItem> {
  const response = await fetch(`${API_URL}/degrees`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if(!response.ok) {
    await handleApiError(response);
  }
  return response.json();
}

export async function deleteDegree(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/degrees/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }
}

export async function updateDegree(id: number, payload: UpgradeDegreeDto): Promise<DegreeItem> {
  const response = await fetch(`${API_URL}/degrees/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function fetchDegreeById(id: number): Promise<DegreeItem> {
  const response = await fetch(`${API_URL}/degrees/${id}`, {
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();

}

