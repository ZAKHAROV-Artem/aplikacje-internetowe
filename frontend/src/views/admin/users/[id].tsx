import { useNavigate, useParams } from "react-router";
import {
  useGetUserQuery,
  useUpdateUserMutation,
} from "@/modules/admin/users.api";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemas, type UpdateUserFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetUserQuery(id || "");
  const [updateUser] = useUpdateUserMutation();

  const user = data?.data;

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(schemas.updateUser),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "USER",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      console.log(user);
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UpdateUserFormValues) => {
    if (!id) return;

    try {
      await updateUser({ id, data }).unwrap();
      toast.success("User updated successfully");
      navigate("/admin/users");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage || "Failed to update user");
    }
  };

  const roleItems = [
    { id: "USER", title: "User" },
    { id: "COMPANY_MANAGER", title: "Company Manager" },
    { id: "ADMIN", title: "Admin" },
  ];

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Combobox
                    items={roleItems}
                    onValueChange={field.onChange}
                    value={field.value}
                    placeholder="Select a role"
                    searchPlaceholder="Search roles..."
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
      </Form>
    </div>
  );
}
