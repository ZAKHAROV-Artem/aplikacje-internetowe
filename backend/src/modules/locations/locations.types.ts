export interface CreateLocationInput {
  name?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

export interface UpdateLocationInput {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  isDefault?: boolean;
}

export interface LocationResponse {
  id: string;
  userId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
