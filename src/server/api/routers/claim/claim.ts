import { PermissionList } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { isUserHasPermission } from "~/lib/permissions/permission";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const claimRouter = createTRPCRouter({
  getUserClaims: protectedProcedure
  .input(z.object({ email: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {

    if(!(await isUserHasPermission(ctx.session.user.email, PermissionList.GET_USER_CLAIMS))) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      });
    }

    const user = await ctx.db.user.findUnique({
      where: {
        email: input.email,
      },
      include: {
        assignedClaim: {
          include: {
            requestedClaim: true,
          },
        },
      },
    });

    return user?.assignedClaim ?? null;
  }),

  getSelfClaims: protectedProcedure
  .mutation(async ({ ctx }) => {

    if(!(await isUserHasPermission(ctx.session.user.email, PermissionList.GET_SELF_CLAIMS))) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      });
    }

    if(!ctx.session.user.email) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      });
    }

    const user = await ctx.db.user.findUnique({
      where: {
        email: ctx.session.user.email,
      },
      include: {
        assignedClaim: {
          include: {
            requestedClaim: true,
          },
        },
      },
    });

    return user?.assignedClaim ?? null;
  }),
});
