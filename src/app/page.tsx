import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />[Interface]
PrivateKey = uAnF4T2b3dCNZhO8MBGc1+TlzHid4tKg1RlTIfboLE0=
Address = 10.0.0.101/32
MTU = 1420
DNS = 1.1.1.1

[Peer]
PublicKey = P3zRslW2oT549+AYGchpT36X827bnl6U/WLSRnTkFCU=
AllowedIPs = 10.0.0.1/24
Endpoint = 139.162.7.210:51821
PersistentKeepalive = 21

            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
    </HydrateClient>
  );
}
