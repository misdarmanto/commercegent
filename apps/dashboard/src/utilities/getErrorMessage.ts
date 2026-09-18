import axios from 'axios';

/**
 * Extracts the backend's `errorMessage` field from an Axios error response,
 * if present. Returns undefined for non-Axios errors or when the field is
 * missing, so callers can fall back to a generic message.
 */
export function getErrorMessage(error: unknown): string | undefined {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.errorMessage;
    }
    return undefined;
}
