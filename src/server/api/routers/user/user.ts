import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
  .query(async ({ ctx }) => {

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
        group : true,
      },
    });

    return user;
  }),
});
