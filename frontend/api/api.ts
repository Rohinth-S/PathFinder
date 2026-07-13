const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

const DEFAULT_TIMEOUT_MS = 60_000; // 60 seconds to allow for long LLM processing

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        signal: controller.signal,
        headers: {
          ...(options.headers ?? {}),
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

    if (!response.ok) {
      let message = await response.text();
      // If the backend returns HTML (e.g. 404 Cannot GET), clean it up
      if (message.includes('<!DOCTYPE html>') || message.includes('<html>')) {
        if (response.status === 404) {
          message = `Endpoint ${endpoint} not implemented on the backend yet.`;
        } else {
          message = `Server error ${response.status}: ${response.statusText}`;
        }
      } else {
        // Try parsing JSON error
        try {
          const jsonError = JSON.parse(message);
          if (jsonError.error) message = jsonError.error;
        } catch {}
      }
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error(`Request to ${endpoint} timed out after ${DEFAULT_TIMEOUT_MS / 1000}s`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}