import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { redirect } from "next/navigation";
import { getUserClaimsByYear } from "~/lib/claim/claim";

export default async function Home() {
  const session = await auth();
  
  if (session) {
    redirect("/portal");
  }
  
  return (
    <HydrateClient>
          <div>
          
          </div>
    </HydrateClient>
  );
}
