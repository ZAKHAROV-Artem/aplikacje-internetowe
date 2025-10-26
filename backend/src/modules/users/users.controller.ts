import { success } from "../../lib/http";
import { controllerHandler2 } from "../../utils/controllerHandler2";
import usersService from "./users.service";
import { CreateUserInput, UpdateUserInput } from "./users.types";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "COMPANY_MANAGER", "USER"]),
  companyId: z.string().optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["ADMIN", "COMPANY_MANAGER", "USER"]).optional(),
  companyId: z.string().optional(),
  isActive: z.boolean().optional(),
});

class UsersController {
  create = controllerHandler2<{ body: CreateUserInput }, unknown>(
    async (req, res) => {
      const data = createUserSchema.parse(req.body);
      const user = await usersService.create(data);
      success(res, user);
    }
  );

  getById = controllerHandler2<{ params: { id: string } }, unknown>(
    async (req, res) => {
      const user = await usersService.getById(req.params.id);
      success(res, user);
    }
  );

  getMe = controllerHandler2<unknown, unknown>(async (req, res) => {
    const user = await usersService.getById((req as any).user?.sub || "");
    success(res, user);
  });

  update = controllerHandler2<
    { params: { id: string }; body: UpdateUserInput },
    unknown
  >(async (req, res) => {
    const data = updateUserSchema.parse(req.body);
    const user = await usersService.update(req.params.id, data);
    success(res, user);
  });

  updateMe = controllerHandler2<{ body: UpdateUserInput }, unknown>(
    async (req, res) => {
      const data = updateUserSchema.parse(req.body);
      const user = await usersService.update(
        (req as any).user?.sub || "",
        data
      );
      success(res, user);
    }
  );

  delete = controllerHandler2<{ params: { id: string } }, unknown>(
    async (req, res) => {
      await usersService.delete(req.params.id);
      success(res, { deleted: true });
    }
  );

  list = controllerHandler2<{ query: any }, unknown>(async (req, res) => {
    const users = await usersService.list(req.query);
    success(res, users);
  });
}

const usersController = new UsersController();
export default usersController;
