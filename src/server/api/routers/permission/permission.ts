import { TRPCError } from "@trpc/server";
import z from "zod";
import { isUserHasPermission, getUserPermissions } from "~/lib/permissions/permission";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { PermissionList } from "@prisma/client";

export const permissionRouter = createTRPCRouter({
  isUserHasPermission: protectedProcedure
  .input(z.object({ 
    permission: z.string().refine((val) => Object.values(PermissionList).includes(val as PermissionList), {
      message: "Invalid permission value"
    })
  }))
  .query(async ({ ctx, input }) => {

    if(!ctx.session.user.email) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      });
    }

    return isUserHasPermission(ctx.session.user.email, input.permission as PermissionList);
  }),

  checkMultiplePermissions: protectedProcedure
  .input(z.object({
    permissions: z.array(z.string().refine((val) => Object.values(PermissionList).includes(val as PermissionList), {
      message: "Invalid permission value"
    }))
  }))
  .query(async ({ ctx, input }) => {
    if(!ctx.session.user.email) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      });
    }

    const userPermissions = await getUserPermissions(ctx.session.user.email);
    const result = new Map<PermissionList, boolean>();

    input.permissions.forEach(permission => {
      result.set(permission as PermissionList, userPermissions.includes(permission as PermissionList));
    });

    return Object.fromEntries(result);
  }),
});
