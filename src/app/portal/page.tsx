import { HydrateClient } from "~/trpc/server";

export default async function Home() {

  return (
    <HydrateClient>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

      </div>
    </HydrateClient>
  );
}
