import { useNavigate } from "react-router";
import { useCreateUserMutation } from "@/modules/admin/users.api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewUserPage() {
  const navigate = useNavigate();
  const [createUser] = useCreateUserMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "USER" as "ADMIN" | "COMPANY_MANAGER" | "USER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUser(formData).unwrap();
      toast.success("User created successfully");
      navigate("/admin/users");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/users")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create New User</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Leave empty for auto-generated password"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty to auto-generate a password
          </p>
        </div>

        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value: any) =>
              setFormData({ ...formData, role: value })
            }
          >
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="COMPANY_MANAGER">Company Manager</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Create User
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/users")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
