import { success } from "../../lib/responses";
import { controllerHandler } from "../../utils/controllerHandler";
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
  create = controllerHandler<{ body: CreateUserInput }, unknown>(
    async (req, res) => {
      const data = createUserSchema.parse(req.body);
      const user = await usersService.create(data);
      res.status(201).json(success(user, "User created successfully"));
    }
  );

  getById = controllerHandler<{ params: { id: string } }, unknown>(
    async (req, res) => {
      const user = await usersService.getById(req.params.id);
      res.status(200).json(success(user, "User retrieved successfully"));
    }
  );

  getMe = controllerHandler<unknown, unknown>(async (req, res) => {
    const user = await usersService.getById((req as any).user?.sub || "");
    res.status(200).json(success(user, "User profile retrieved successfully"));
  });

  update = controllerHandler<
    { params: { id: string }; body: UpdateUserInput },
    unknown
  >(async (req, res) => {
    const data = updateUserSchema.parse(req.body);
    const user = await usersService.update(req.params.id, data);
    res.status(200).json(success(user, "User updated successfully"));
  });

  updateMe = controllerHandler<{ body: UpdateUserInput }, unknown>(
    async (req, res) => {
      const data = updateUserSchema.parse(req.body);
      const user = await usersService.update(
        (req as any).user?.sub || "",
        data
      );
      res.status(200).json(success(user, "User profile updated successfully"));
    }
  );

  delete = controllerHandler<{ params: { id: string } }, unknown>(
    async (req, res) => {
      await usersService.delete(req.params.id);
      res.status(200).json(success({ deleted: true }, "User deleted successfully"));
    }
  );

  list = controllerHandler<{ query: any }, unknown>(async (req, res) => {
    const users = await usersService.list(req.query);
    res.status(200).json(success(users, "Users retrieved successfully"));
  });
}

const usersController = new UsersController();
export default usersController;
