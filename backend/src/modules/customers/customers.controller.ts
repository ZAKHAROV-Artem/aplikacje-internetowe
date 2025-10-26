import { success } from "../../lib/http";
import customersService from "./customers.service";
import { authenticatedControllerHandler2 } from "../../utils/controllerHandler2";

class CustomersController {
  getMe = authenticatedControllerHandler2<unknown, unknown>(
    async (req, res) => {
      const data = await customersService.getById((req as any).user.sub);
      success(res, data);
    }
  );

  updateMe = authenticatedControllerHandler2<{ body: any }, unknown>(
    async (req, res) => {
      const updated = await customersService.update(
        (req as any).user.sub,
        req.body
      );
      success(res, updated);
    }
  );

  getCustomerRules = authenticatedControllerHandler2<
    { params: { customerId: string } },
    unknown[]
  >(async (req, res) => {
    const rules = await customersService.getCustomerRules(
      req.params.customerId
    );
    success(res, rules);
  });

  toggleCustomerRule = authenticatedControllerHandler2<
    { params: { ruleId: string }; body: { isActive: boolean } },
    unknown
  >(async (req, res) => {
    const rule = await customersService.toggleCustomerRule(
      req.body.isActive,
      req.params.ruleId
    );
    success(res, rule);
  });
}

const customersController = new CustomersController();

export default customersController;
