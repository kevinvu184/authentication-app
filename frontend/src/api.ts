import { AuthResponse, SignInRequest, SignUpRequest, User } from "./types";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "Unknown Error",
      message: "An unexpected error occurred",
    }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

// Helper function to get auth headers
function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// API functions
export const api = {
  // Sign up a new user
  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse<AuthResponse>(response);
  },

  // Sign in an existing user
  signIn: async (data: SignInRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse<AuthResponse>(response);
  },

  // Get user profile (using /api/me endpoint)
  getProfile: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/me`, {
      method: "GET",
      headers: getAuthHeaders(token),
    });

    return handleResponse<User>(response);
  },
};
