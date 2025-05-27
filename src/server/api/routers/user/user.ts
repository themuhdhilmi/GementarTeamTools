import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

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

  getAllUsers: protectedProcedure
      .input(z.object({ 
        filterByName: z.string().optional(), 
        filterByGroup: z.string().optional(),
        resultCount: z.number().min(1).default(10),
        resultPage: z.number().min(1).default(1),
        sortBy: z.enum(['email', 'group']).optional(),
        sortOrder: z.enum(['asc', 'desc']).default('asc')
      }))
    .query(async ({ ctx, input }) => {

    if(!ctx.session.user.email) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      });
    }

    const { filterByName, filterByGroup, resultCount, resultPage, sortBy, sortOrder } = input;

    // Calculate skip for pagination
    const skip = (resultPage - 1) * resultCount;

    // Get total count for pagination
    const totalCount = await ctx.db.user.count({
      where: {
        AND: [
          filterByName ? {
            OR: [
              { name: { contains: filterByName } },
              { email: { contains: filterByName } }
            ]
          } : {},
          filterByGroup ? {
            groupId: filterByGroup
          } : {}
        ]
      }
    });

    const users = await ctx.db.user.findMany({
      where: {
        AND: [
          filterByName ? {
            OR: [
              { name: { contains: filterByName } },
              { email: { contains: filterByName } }
            ]
          } : {},
          filterByGroup ? {
            groupId: filterByGroup
          } : {}
        ]
      },
      include: {
        group: true,
      },
      orderBy: sortBy ? {
        [sortBy === 'group' ? 'group.name' : sortBy]: sortOrder
      } : undefined,
      take: resultCount,
      skip: skip,
    }); 

    return {
      users,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / resultCount),
        currentPage: resultPage,
        pageSize: resultCount
      }
    };
  }),

  getAllGroups: protectedProcedure
    .query(async ({ ctx }) => {
      if(!ctx.session.user.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource",
        });
      }

      const groups = await ctx.db.group.findMany({
        select: {
          id: true,
        },
      });

      return groups;
    }),
});
