import { HydrateClient } from "~/trpc/server";
import { DataTableDemo } from "~/app/_components/data-table";
import { PermissionList } from "@prisma/client";
import { checkPagePermission } from "~/lib/permissions/check-page-permission";

export default async function Home() {
  await checkPagePermission(PermissionList.PAGE_PERMISSION_REIMBURSEMENT_MANAGE_CLAIM);
  
  return (
    <HydrateClient>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DataTableDemo />
      </div>
    </HydrateClient>
  );
}
