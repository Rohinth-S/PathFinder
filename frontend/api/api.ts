const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

const DEFAULT_TIMEOUT_MS = 10_000; // 10 seconds

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
      const message = await response.text();
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