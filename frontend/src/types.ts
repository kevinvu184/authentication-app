// User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

// Auth response interface
export interface AuthResponse {
  token: string;
  expiresIn: number;
  user: User;
}

// Sign up request interface
export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Sign in request interface
export interface SignInRequest {
  email: string;
  password: string;
}

// Profile update request interface
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

// Error response interface
export interface ErrorResponse {
  error: string;
  message: string;
}

// Auth context interface
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signUp: (data: SignUpRequest) => Promise<void>;
  signIn: (data: SignInRequest) => Promise<void>;
  signOut: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
}