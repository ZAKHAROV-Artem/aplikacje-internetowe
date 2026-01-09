import {
  authenticatedControllerHandler,
  controllerHandler,
} from "../../utils/controllerHandler";
import companiesService from "./companies.service";
import { CreateCompanyInput, UpdateCompanyInput } from "./companies.types";
import { z } from "zod";
import { success } from "../../lib/responses";

const createCompanySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  managerId: z.string().uuid(),
});

const updateCompanySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().nullable().optional(),
  managerId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

class CompaniesController {
  create = authenticatedControllerHandler<
    { body: CreateCompanyInput },
    unknown
  >(async (req, res) => {
    const data = createCompanySchema.parse(req.body);
    const company = await companiesService.create(data);
    res.status(201).json(success(company, "Company created successfully"));
  });

  getById = authenticatedControllerHandler<{ params: { id: string } }, unknown>(
    async (req, res) => {
      const company = await companiesService.getById(req.params.id);
      res.status(200).json(success(company, "Company retrieved successfully"));
    }
  );

  update = authenticatedControllerHandler<
    { params: { id: string }; body: UpdateCompanyInput },
    unknown
  >(async (req, res) => {
    const data = updateCompanySchema.parse(req.body);
    const company = await companiesService.update(req.params.id, data);
    res.status(200).json(success(company, "Company updated successfully"));
  });

  delete = authenticatedControllerHandler<{ params: { id: string } }, unknown>(
    async (req, res) => {
      await companiesService.delete(req.params.id);
      res
        .status(200)
        .json(success({ deleted: true }, "Company deleted successfully"));
    }
  );

  list = authenticatedControllerHandler<unknown, unknown>(async (_req, res) => {
    const companies = await companiesService.list();
    res
      .status(200)
      .json(success(companies, "Companies retrieved successfully"));
  });

  getInfo = controllerHandler<unknown, unknown>(async (_req, res) => {
    const company = await companiesService.getInfo();
    res
      .status(200)
      .json(success(company, "Company info retrieved successfully"));
  });
}

const companiesController = new CompaniesController();
export default companiesController;
