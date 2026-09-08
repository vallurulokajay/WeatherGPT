import { ChatApiRequest, ChatApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const REQUEST_TIMEOUT_MS = 30000;

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isTimeout?: boolean
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function sendChatMessage(
  request: ChatApiRequest
): Promise<ChatApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(
        `Server returned ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();

    if (!data || typeof data.response !== 'string') {
      throw new ApiError('Received malformed response from server.');
    }

    return data as ChatApiResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. The server took too long to respond.',
        undefined,
        true
      );
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Unable to connect to WeatherGPT server. Please check your connection.'
      );
    }

    throw new ApiError(
      'Something went wrong while contacting WeatherGPT. Please try again.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
