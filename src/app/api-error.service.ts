import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiErrorService {

  /**
   * Extracts the most human-readable message from an HttpErrorResponse.
   * FastAPI returns errors as: { "detail": "message" } or { "detail": [{ "msg": "..." }] }
   */
  getMessage(err: HttpErrorResponse, fallback = 'An unexpected error occurred. Please try again.'): string {
    if (!err.error) return fallback;

    const detail = err.error?.detail;

    // FastAPI validation errors: detail is an array of { msg, loc, type }
    if (Array.isArray(detail)) {
      return detail
        .map((e: any) => {
          const field = e.loc?.slice(1).join(' → ') || '';
          const msg = e.msg || e.message || '';
          return field ? `${field}: ${msg}` : msg;
        })
        .filter(Boolean)
        .join('; ') || fallback;
    }

    // FastAPI HTTPException: detail is a plain string
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    // HTTP status-based fallbacks
    switch (err.status) {
      case 0:    return 'Cannot reach the server. Check your internet connection.';
      case 400:  return typeof detail === 'string' ? detail : 'Bad request. Please check your input.';
      case 401:  return 'Session expired or invalid credentials. Please log in again.';
      case 403:  return 'You do not have permission to perform this action.';
      case 404:  return 'The requested resource was not found.';
      case 409:  return typeof detail === 'string' ? detail : 'A conflict occurred. The resource may already exist.';
      case 422:  return typeof detail === 'string' ? detail : 'Invalid data submitted. Please check your inputs.';
      case 429:  return 'Too many requests. Please wait a moment and try again.';
      case 500:  return 'An internal server error occurred. Please try again later.';
      default:   return fallback;
    }
  }
}
