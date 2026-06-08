import { handleApiError } from "../shared/utils.api";
import { UserListItem } from "@server/users";
import { ProfessorListItem } from "@server/people";
import { CreatePeopleDto } from "@server/people";

const API_URL = 'http://localhost:3333/api/';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
    }
}

export async function fetchProfessors() {
  const response = await fetch(`${API_URL}people`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function createProfessor(payload: CreatePeopleDto): Promise<UserListItem> {
  const response = await fetch(`${API_URL}people`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if(!response.ok) {
    await handleApiError(response);
  }
  return response.json();
}

export async function getProfessorFromDegree(id: number): Promise<ProfessorListItem> {
  const response = await fetch(`${API_URL}degrees/${id}`, {
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    await handleApiError(response);
  }

  return response.json();

}

export async function deleteProfessor(id: number): Promise<boolean> {
  try {
      const token = localStorage.getItem('token'); 

      const response = await fetch(`/users/${id}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          }
      });
      return response.ok; 
  } catch (error) {
      console.error(`Failed to delete professor with ID ${id}:`, error);
      return false;
  } 
}

