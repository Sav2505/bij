export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: 'ADMIN' | 'USER';
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
    }
  }
}
