import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { CreateUserInput, UpdateUserInput, UserResponse } from "./users.types";
import { NotFoundError } from "../../lib/http";

class UsersService {
  async create(data: CreateUserInput): Promise<UserResponse> {
    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, 10)
      : null;

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        companyId: data.companyId || null,
      },
    });

    return this.mapToResponse(user);
  }

  async getById(id: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found", { userId: id });
    }

    return this.mapToResponse(user);
  }

  async getByEmail(email: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? this.mapToResponse(user) : null;
  }

  async update(id: string, data: UpdateUserInput): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return this.mapToResponse(user);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async list(filters?: { role?: string; companyId?: string }) {
    const users = await prisma.user.findMany({
      where: {
        ...(filters?.role && { role: filters.role as any }),
        ...(filters?.companyId && { companyId: filters.companyId }),
      },
      include: {
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map((user) => this.mapToResponse(user));
  }

  private mapToResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

const usersService = new UsersService();
export default usersService;
