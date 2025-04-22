export interface LoginFormData {
  [key: string]: string;
  email: string;
  password: string;
}

export interface RegisterFormData {
  [key: string]: string;
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
} 