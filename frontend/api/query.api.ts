const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export interface QueryResponse {
  query: string;
  transcribed?: string;
  structuredQuery?: any;
  context?: any;
  aggregatedContext?: string;
}

import * as FileSystem from 'expo-file-system';

export async function submitQuery(
  token: string,
  searchText?: string | null,
  audioUri?: string | null
): Promise<QueryResponse> {
  let response: Response;

  if (audioUri) {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);

    response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else if (searchText) {
    response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: searchText }),
    });
  } else {
    throw new Error('Must provide either text query or audio.');
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API error: ${message}`);
  }

  return response.json() as Promise<QueryResponse>;
}
