export interface CreateUserInput {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "COMPANY_MANAGER" | "USER";
  companyId?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  role?: "ADMIN" | "COMPANY_MANAGER" | "USER";
  companyId?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
