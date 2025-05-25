import {  HydrateClient } from "~/trpc/server";
import { SectionCards } from "../_components/section-cards";

export default async function Home() {
  
  return (
    <HydrateClient>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="aspect-video rounded-xl bg-muted/50 py-5"><SectionCards/></div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
    </HydrateClient>
  );
}
