import type { Rule } from "magnoli-types";

// Extend Rule type with expected properties for display
export type DisplayRule = Rule & {
  id: string;
  magnoliCustomerId: string;
  type: string;
  payload: {
    customer: {
      id: string;
      phone: string;
      lastName: string;
      firstName: string;
    };
    stopDate?: string;
    dayOfTheWeek: string;
  };
  lastRunAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
