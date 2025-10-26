import { Card, CardContent } from "@/components/ui/card";

export const SubscriptionsLoadingSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="animate-pulse border-0 shadow-sm bg-card">
        <CardContent className="p-3 sm:p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2">
              <div className="h-3.5 w-3.5 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-muted rounded w-full max-w-md"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 bg-muted rounded-full w-14"></div>
              <div className="h-7 w-7 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
