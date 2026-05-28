export async function handleApiError(response: Response): Promise<never> {
  const errorData = await response.json();

  throw new Error(
    Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message || 'Errore API'
  );
}