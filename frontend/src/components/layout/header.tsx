import { useLocation } from "react-router";
import { useSelector } from "@/store";
import { useGetMeQuery } from "@/modules/customers/customers.api";
import { useGetCompanyInfoQuery } from "@/modules/companies/companies.api";
import MobileUserDropup from "./mobile-user-dropup";

export default function Header() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const { data, isFetching: isLoadingMe } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });
  const me = data?.data;
  const location = useLocation();
  const isOnboardingRoute = location.pathname.startsWith("/onboarding");
  const isOnboarded = Boolean(me?.metadata?.isOnboarded);

  // Fetch company info
  const { data: companyResponse } = useGetCompanyInfoQuery();
  const company = companyResponse?.data;

  // Hide nav and account only when not authenticated or still loading user data
  const shouldHideNav =
    !accessToken || (!isLoadingMe && !isOnboarded && !isOnboardingRoute);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-card">
      <div className="w-full py-2 md:py-3">
        {/* Mobile Layout - Company name centered only */}
        <div className="md:hidden flex items-center justify-center px-3">
          <div className="text-center">
            <h1 className="text-xl font-bold">
              {company?.name || "CS Department"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {company?.description || "Computer Science Department"}
            </p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block px-3 max-w-7xl mx-auto">
          {accessToken ? (
            /* Authenticated: Company info left, nav right */
            <div className="flex items-center justify-between">
              {/* Company Info */}
              <div className="flex items-center gap-3">
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

              <div className="flex items-center gap-3">
                {/* User Account Section - only show on desktop */}
                {!shouldHideNav && (
                  <div className="h-10 flex items-stretch">
                    <MobileUserDropup
                      direction="down"
                      showName
                      variant="desktop"
                      hideAdminLinks={false}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Not authenticated: Company info centered */
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold">
                  {company?.name || "CS Department"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {company?.description ||
                    "Computer Science Department of the University"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
