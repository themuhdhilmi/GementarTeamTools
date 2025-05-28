import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { hash } from "bcrypt";

export const userRouter = createTRPCRouter({
  samplePublicProcedure: publicProcedure.query(async ({ ctx }) => {
    return "Hello World";
  }),

  samplePublicProcedureMutation: publicProcedure.input(z.object({
    name: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return "Hello World " + input.name;
  }),

  getUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.email) {
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
        group: true,
      },
    });

    return user;
  }),

  getAllUsers: protectedProcedure
    .input(
      z.object({
        filterByName: z.string().optional(),
        filterByGroup: z.string().optional(),
        resultCount: z.number().min(1).default(10),
        resultPage: z.number().min(1).default(1),
        sortBy: z.enum(["email", "group"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).default("asc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource",
        });
      }

      const {
        filterByName,
        filterByGroup,
        resultCount,
        resultPage,
        sortBy,
        sortOrder,
      } = input;

      // Calculate skip for pagination
      const skip = (resultPage - 1) * resultCount;

      // Get total count for pagination
      const totalCount = await ctx.db.user.count({
        where: {
          AND: [
            filterByName
              ? {
                  OR: [
                    { name: { contains: filterByName } },
                    { email: { contains: filterByName } },
                  ],
                }
              : {},
            filterByGroup
              ? {
                  groupId: filterByGroup,
                }
              : {},
          ],
        },
      });

      const users = await ctx.db.user.findMany({
        where: {
          AND: [
            filterByName
              ? {
                  OR: [
                    { name: { contains: filterByName } },
                    { email: { contains: filterByName } },
                  ],
                }
              : {},
            filterByGroup
              ? {
                  groupId: filterByGroup,
                }
              : {},
          ],
        },
        include: {
          group: true,
        },
        orderBy: {
          ...(sortBy === "email"
            ? { email: sortOrder }
            : { group: { id: sortOrder } }),
        },
        take: resultCount,
        skip: skip,
      });

      return {
        users,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / resultCount),
          currentPage: resultPage,
          pageSize: resultCount,
        },
      };
    }),

  getAllGroups: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.email) {
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

  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        password: z.string().optional(),
        groupId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource",
        });
      }

      const { id, name, email, password, groupId } = input;

      // Check if email is already taken by another user
      const existingUser = await ctx.db.user.findFirst({
        where: {
          email,
          NOT: {
            id,
          },
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email is already taken by another user",
        });
      }

      if (password) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const hashedPassword = (await hash(password, 10));

        // Update user
        const updatedUser = await ctx.db.user.update({
          where: { id },
          data: {
            name,
            email,
            groupId,
            hashed_password: hashedPassword,
          },
        });

        return updatedUser;
      }

      const updatedUser = await ctx.db.user.update({
        where: { id },
        data: {
          name,
          email,
          groupId,
        },
      });

      return updatedUser;
    }),
});
