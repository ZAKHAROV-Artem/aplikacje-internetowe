import { useNavigate, useParams } from "react-router";
import {
  useGetUserQuery,
  useUpdateUserMutation,
} from "@/modules/admin/users.api";
import { useState, useEffect } from "react";
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

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetUserQuery(id || "");
  const [updateUser] = useUpdateUserMutation();

  const user = data?.data;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "USER" as "ADMIN" | "COMPANY_MANAGER" | "USER",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateUser({ id, data: formData }).unwrap();
      toast.success("User updated successfully");
      navigate("/admin/users");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

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
        <h1 className="text-3xl font-bold">Edit User</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Email cannot be changed
          </p>
        </div>

        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
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
            Update User
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
