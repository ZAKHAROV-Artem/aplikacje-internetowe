import { useSelector } from "@/store";
import { useGetCompanyInfoQuery } from "@/modules/companies/companies.api";

export default function Header() {
  const accessToken = useSelector((state) => state.auth.accessToken);

  // Fetch company info
  const { data: companyResponse } = useGetCompanyInfoQuery();
  const company = companyResponse?.data;

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-card">
      <div className="w-full py-2 md:py-3">
        {/* Mobile Layout - Company name centered only */}
        <div className="md:hidden flex items-center justify-center px-3">
          <div className="flex items-center gap-3 text-center">
            {company?.logo && (
              <img
                src={company.logo}
                alt={company?.name || "Company logo"}
                className="h-10 w-10 object-contain"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">
                {company?.name || "CS Department"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {company?.description || "Computer Science Department"}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block px-3 max-w-7xl mx-auto">
          {accessToken ? (
            /* Authenticated: Company info left, nav right */
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 text-center">
                {company?.logo && (
                  <img
                    src={company.logo}
                    alt={company?.name || "Company logo"}
                    className="h-12 w-12 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold">
                    {company?.name || "CS Department"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {company?.description ||
                      "Computer Science Department of the University"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Not authenticated: Company info centered */
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 text-center">
                {company?.logo && (
                  <img
                    src={company.logo}
                    alt={company?.name || "Company logo"}
                    className="h-14 w-14 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold">
                    {company?.name || "CS Department"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {company?.description ||
                      "Computer Science Department of the University"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
