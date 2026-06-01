import { CreateDegreeDto, DegreeItem, UpgradeDegreeDto } from "@server/courses";
import { handleApiError } from "../shared/utils.api";
import { UserListItem } from "@server/users";
import { ProfessorListItem } from "@server/people";

const API_URL = 'http://localhost:3333/api/';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
    }
}

// TODO API
export async function fetchProfessors() {
  const response = await fetch(`${API_URL}/people`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function createProfessor(payload: CreateDegreeDto): Promise<UserListItem> {
  const response = await fetch(`${API_URL}/people`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if(!response.ok) {
    await handleApiError(response);
  }
  return response.json();
}

export async function ou(id: number): Promise<ProfessorListItem> {
  const response = await fetch(`${API_URL}/degrees/${id}`, {
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();

}

