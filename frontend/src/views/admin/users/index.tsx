import { useNavigate } from "react-router";
import {
  useListUsersQuery,
  useDeleteUserMutation,
} from "@/modules/admin/users.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useListUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const users = data?.data || [];

  const handleDelete = (user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    confirm({
      title: "Delete User",
      description: `Are you sure you want to delete "${user.firstName} ${user.lastName}" (${user.email})? This action cannot be undone.`,
      variant: "destructive",
      confirmText: "Delete User",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await deleteUser(user.id).unwrap();
          toast.success("User deleted successfully");
        } catch (error: any) {
          toast.error(error?.data?.message || "Failed to delete user");
        }
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UsersIcon className="h-8 w-8" />
          Manage Users
        </h1>
        <Button onClick={() => navigate("/admin/users/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div>
                  <p className="text-lg">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p>{user.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p>{user.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog />
    </div>
  );
}
