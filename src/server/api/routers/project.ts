import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

export const projectRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany()
  }),
}) 