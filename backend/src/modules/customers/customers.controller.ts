import { success } from "../../lib/responses";
import customersService from "./customers.service";
import { authenticatedControllerHandler } from "../../utils/controllerHandler";
import { ApiResponse } from "magnoli-types";

class CustomersController {
  getMe = authenticatedControllerHandler<unknown, unknown>(
    async (req, res) => {
      const data = await customersService.getById((req as any).user.sub);
      res.status(200).json(success(data, "Customer profile retrieved successfully"));
    }
  );

  updateMe = authenticatedControllerHandler<{ body: any }, unknown>(
    async (req, res) => {
      const updated = await customersService.update(
        (req as any).user.sub,
        req.body
      );
      res.status(200).json(success(updated, "Customer profile updated successfully"));
    }
  );

  getCustomerRules = authenticatedControllerHandler<
    { params: { customerId: string } },
    ApiResponse<unknown[]>
  >(async (req, res) => {
    const rules = await customersService.getCustomerRules(
      req.params.customerId
    );
    res.status(200).json(success(rules, "Route rules retrieved successfully"));
  });

  toggleCustomerRule = authenticatedControllerHandler<
    { params: { ruleId: string }; body: { isActive: boolean } },
    unknown
  >(async (req, res) => {
    const rule = await customersService.toggleCustomerRule(
      req.body.isActive,
      req.params.ruleId
    );
    res.status(200).json(success(rule, "Customer rule updated successfully"));
  });
}

const customersController = new CustomersController();

export default customersController;
