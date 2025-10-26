export interface CreateCompanyInput {
  name: string;
  description?: string;
  managerId: string;
}

export interface UpdateCompanyInput {
  name?: string;
  description?: string;
  managerId?: string;
  isActive?: boolean;
}

export interface CompanyResponse {
  id: string;
  name: string;
  description: string | null;
  managerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
