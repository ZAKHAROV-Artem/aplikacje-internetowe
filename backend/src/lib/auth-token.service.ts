class AuthTokenService {
  private token: string | null = null;

  clearToken(): void {
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }

  hasToken(): boolean {
    return this.token !== null;
  }

  setToken(token: string): void {
    this.token = token;
  }
}

const authTokenService = new AuthTokenService();
export { authTokenService  };
