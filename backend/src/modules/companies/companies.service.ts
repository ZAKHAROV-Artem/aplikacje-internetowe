import { prisma } from "../../lib/prisma";
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyResponse,
} from "./companies.types";
import { NotFoundError } from "../../lib/http";

class CompaniesService {
  async create(data: CreateCompanyInput): Promise<CompanyResponse> {
    const company = await prisma.company.create({
      data: {
        name: data.name,
        description: data.description || null,
        managerId: data.managerId,
      },
    });

    return this.mapToResponse(company);
  }

  async getById(id: string): Promise<CompanyResponse> {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        manager: true,
        users: true,
      },
    });

    if (!company) {
      throw new NotFoundError("Company not found", { companyId: id });
    }

    return this.mapToResponse(company);
  }

  async update(id: string, data: UpdateCompanyInput): Promise<CompanyResponse> {
    const company = await prisma.company.update({
      where: { id },
      data,
    });

    return this.mapToResponse(company);
  }

  async delete(id: string): Promise<void> {
    await prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async list() {
    const companies = await prisma.company.findMany({
      include: {
        manager: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return companies.map((company) => this.mapToResponse(company));
  }

  async getInfo(): Promise<CompanyResponse> {
    const company = await prisma.company.findFirst({
      where: { isActive: true },
      include: {
        manager: true,
      },
    });

    if (!company) {
      throw new NotFoundError("Company not found");
    }

    return this.mapToResponse(company);
  }

  private mapToResponse(company: any): CompanyResponse {
    return {
      id: company.id,
      name: company.name,
      description: company.description,
      managerId: company.managerId,
      isActive: company.isActive,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}

const companiesService = new CompaniesService();
export default companiesService;
