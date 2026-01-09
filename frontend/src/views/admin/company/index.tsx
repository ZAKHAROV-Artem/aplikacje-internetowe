import { useNavigate } from "react-router";
import {
  useGetCompanyInfoQuery,
  useUpdateCompanyMutation,
} from "@/modules/companies/companies.api";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export default function CompanyInfoPage() {
  const navigate = useNavigate();
  const { data: companyInfo, isLoading } = useGetCompanyInfoQuery();
  const [updateCompany] = useUpdateCompanyMutation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const company = companyInfo?.data;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Initialize form data when company data loads
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        description: company.description || "",
      });
      // Set existing logo preview if available
      if (company.logo) {
        setLogoPreview(company.logo);
      }
    }
  }, [company]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    confirm({
      title: "Remove Logo",
      description:
        "Are you sure you want to remove the logo? This action cannot be undone.",
      variant: "warning",
      confirmText: "Remove Logo",
      cancelText: "Keep Logo",
      onConfirm: () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updateData: any = {
        name: formData.name,
        description: formData.description,
      };

      // If there's a logo preview (either new or existing), include it
      // If logoPreview exists but no logoFile, it means it's the existing logo
      // If both exist, it's a new logo (base64 from FileReader)
      if (logoPreview && logoFile) {
        // New logo selected - use the base64 preview (already converted)
        updateData.logo = logoPreview;
      } else if (logoPreview && !logoFile) {
        // Existing logo, keep it as is
        updateData.logo = logoPreview;
      } else if (!logoPreview && company?.logo) {
        // Logo was removed - set to null
        updateData.logo = null;
      }

      await updateCompany({ id: company?.id || "", data: updateData }).unwrap();
      toast.success("Company information updated successfully");
      navigate("/admin");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to update company information"
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!company) return <div>Company not found</div>;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Company Information
        </h1>
      </div>

      <div className="grid gap-6">
        {/* Logo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Logo Display */}
              {logoPreview ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Company logo"
                      className="w-24 h-24 object-contain border rounded-lg bg-muted"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {logoFile ? "New logo selected" : "Current logo"}
                    </p>
                    {logoFile && (
                      <p className="text-xs text-muted-foreground">
                        {logoFile.name} (
                        {(logoFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No logo uploaded
                  </p>
                </div>
              )}

              {/* Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Upload company logo</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, or SVG up to 5MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Brief description of your company..."
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Update Company Information
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog />
    </div>
  );
}
