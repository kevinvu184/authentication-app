export type User = {
  createdAt: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  updatedAt: string;
};

export type AuthResponse = {
  expiresIn: number;
  token: string;
  user: User;
};

export type SignUpRequest = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type ErrorResponse = {
  error: string;
  message: string;
};

export type AuthContextType = {
  isLoading: boolean;
  token: string | null;
  user: User | null;
  signIn: (data: SignInRequest) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (data: SignUpRequest) => Promise<void>;
};
