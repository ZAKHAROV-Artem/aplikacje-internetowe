import { success } from "../../lib/http";
import {
  authenticatedControllerHandler2,
  controllerHandler2,
} from "../../utils/controllerHandler2";
import companiesService from "./companies.service";
import { CreateCompanyInput, UpdateCompanyInput } from "./companies.types";
import { z } from "zod";

const createCompanySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  managerId: z.string().uuid(),
});

const updateCompanySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  managerId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

class CompaniesController {
  create = authenticatedControllerHandler2<
    { body: CreateCompanyInput },
    unknown
  >(async (req, res) => {
    const data = createCompanySchema.parse(req.body);
    const company = await companiesService.create(data);
    success(res, company);
  });

  getById = authenticatedControllerHandler2<
    { params: { id: string } },
    unknown
  >(async (req, res) => {
    const company = await companiesService.getById(req.params.id);
    success(res, company);
  });

  update = authenticatedControllerHandler2<
    { params: { id: string }; body: UpdateCompanyInput },
    unknown
  >(async (req, res) => {
    const data = updateCompanySchema.parse(req.body);
    const company = await companiesService.update(req.params.id, data);
    success(res, company);
  });

  delete = authenticatedControllerHandler2<{ params: { id: string } }, unknown>(
    async (req, res) => {
      await companiesService.delete(req.params.id);
      success(res, { deleted: true });
    }
  );

  list = authenticatedControllerHandler2<unknown, unknown>(
    async (_req, res) => {
      const companies = await companiesService.list();
      success(res, companies);
    }
  );

  getInfo = controllerHandler2<unknown, unknown>(async (_req, res) => {
    const company = await companiesService.getInfo();
    success(res, company);
  });
}

const companiesController = new CompaniesController();
export default companiesController;
