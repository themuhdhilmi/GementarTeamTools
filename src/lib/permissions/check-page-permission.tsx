import { auth } from "~/server/auth";
import { PermissionList } from "@prisma/client";
import { isUserHasPermission } from "./permission";
import { redirect } from "next/navigation";

export async function checkPagePermission(permission: PermissionList) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/unauthorized");
  }

  const hasPermission = await isUserHasPermission(
    session.user.email,
    permission
  );

  if (!hasPermission) {
    redirect("/unauthorized");
  }

  return true;
} 