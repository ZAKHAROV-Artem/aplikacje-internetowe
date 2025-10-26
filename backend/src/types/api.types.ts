// ============================================================================
// API TYPES
// ============================================================================

export {}; // Make this file a module

declare global {
  namespace Express {
    interface User {
      sub: string;
      appType?: string;
      customerId?: string;
      magnoliCustomerId?: string;
      [key: string]: any;
    }

    interface Request {
      magnoliCustomerId?: string;
      magnoliCustomer?: {
        id: string;
      };
    }
  }
}
