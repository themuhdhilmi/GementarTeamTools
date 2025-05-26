import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">401</h1>
        <Badge variant="destructive" className="text-lg">Unauthorized Access</Badge>
        <p className="text-muted-foreground">Sorry, you don&apos;t have access to this page.</p>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
