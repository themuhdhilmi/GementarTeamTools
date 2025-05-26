import { HydrateClient } from "~/trpc/server";
import { getUserClaimsByYear } from "~/lib/claim/claim";
import { auth } from "~/server/auth";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { SectionCards } from "~/app/_components/section-cards";

export default async function Home() {
  const session = await auth();
  const claims = await getUserClaimsByYear(session?.user.email, 2025);
  
  return (
    <HydrateClient>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="aspect-video rounded-xl bg-muted/50 p-5">
          <SectionCards/>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">ASSIGNED CLAIMS 2025</h2>
              <Badge variant="outline" className="ml-2">
                {claims.length} Claims
              </Badge>
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {claims.map((claim) => (
                <Card key={claim.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{claim.claimCategory.name}</span>
                      <Badge variant={claim.isCustomDate ? "secondary" : "default"}>
                        {claim.isCustomDate ? "Custom Date" : "Yearly"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Value:</span>
                        <span className="font-medium">RM {claim.value.toFixed(2)}</span>
                      </div>
                      {claim.perClaimLimit && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Per Claim Limit:</span>
                          <span className="font-medium">RM {claim.perClaimLimit.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Approved:</span>
                        <span className="font-medium">RM {claim.totalApproved.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Approved Claims:</span>
                        <span className="font-medium">{claim.totalApprovedCount}</span>
                      </div>
                      {claim.isCustomDate && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Date:</span>
                            <span className="font-medium">{new Date(claim.dateStart!).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">End Date:</span>
                            <span className="font-medium">{new Date(claim.dateEnd!).toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
