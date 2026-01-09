import { useNavigate } from "react-router";
import {
  useListRoutesQuery,
  useDeleteRouteMutation,
} from "@/modules/admin/routes.api";
import { useGetCompanyInfoQuery } from "@/modules/companies/companies.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Route as RouteIcon } from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export default function AdminRoutesPage() {
  const navigate = useNavigate();
  const { data: companyInfo } = useGetCompanyInfoQuery();
  const companyId = companyInfo?.data?.id || "";

  const { data, isLoading } = useListRoutesQuery({ companyId });
  const [deleteRoute] = useDeleteRouteMutation();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const routes = data?.data || [];

  const handleDelete = (route: { id: string; name: string }) => {
    confirm({
      title: "Delete Route",
      description: `Are you sure you want to delete "${route.name}"? This action cannot be undone and will also delete any associated pickup requests.`,
      variant: "destructive",
      confirmText: "Delete Route",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await deleteRoute(route.id).unwrap();
          toast.success("Route deleted successfully");
        } catch (error: any) {
          toast.error(error?.data?.message || "Failed to delete route");
        }
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <RouteIcon className="h-8 w-8" />
          Manage Routes
        </h1>
        <Button onClick={() => navigate("/admin/routes/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Route
        </Button>
      </div>

      <div className="grid gap-4">
        {routes.map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div>
                  <p className="text-lg">{route.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Zips: {route.zipCodes.join(", ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/routes/${route.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(route)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Days</p>
                  <p>{route.weekdays.join(", ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hours</p>
                  <p>
                    {route.startTime} - {route.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p>{route.active ? "Active" : "Inactive"}</p>
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
