/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { uploadMultipleFiles } from "~/lib/dashboards/uploadItems"
import type { CypressReportDashboardProps } from "~/app/portal/(generator-page)/cypress-report-generator/page"
import { Prisma } from "@prisma/client"

export const resultRouter = createTRPCRouter({
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.result.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          date: "desc",
        },
      })
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      projectId: z.string(),
      date: z.date(),
      data: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.result.create({
        data: input,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.result.delete({
        where: { id: input.id },
      })
    }),

  // New procedures for edit results
  uploadResults: protectedProcedure
    .input(z.object({
      mochaData: z.array(z.object({
        id: z.string(),
        module: z.string(),
        upload: z.array(z.unknown()),
      })),
      jiraFile: z.unknown(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { mochaData, jiraFile } = input;

      // Prepare files for upload
      const files = mochaData.flatMap((item) => 
        item.upload.map((file, index) => ({
          file: file as Blob,
          fileName: `${item.id}_${index}.json`,
          bucketName: 'cypress-reports',
          contentType: 'application/json'
        }))
      );

      // Add JIRA file
      files.push({
        file: jiraFile as Blob,
        fileName: 'jira.csv',
        bucketName: 'cypress-reports',
        contentType: 'text/csv'
      });

      // Upload files
      const uploadResult = await uploadMultipleFiles(files);

      return {
        success: true,
        downloadUrl: uploadResult,
      };
    }),

  getDashboardData: protectedProcedure
    .input(z.object({
      mochaData: z.array(z.object({
        id: z.string(),
        module: z.string(),
        upload: z.array(z.instanceof(File)),
      })),
      jiraFile: z.instanceof(File),
    }))
    .mutation(async ({ ctx, input }) => {
      const { mochaData, jiraFile } = input;

      // Prepare FormData
      const formData = new FormData();
      formData.append("jiraFile", jiraFile);
      formData.append(
        "mochaData",
        new Blob([JSON.stringify(mochaData)], { type: "application/json" }),
      );

      mochaData.forEach((item) => {
        item.upload.forEach((file, index) => {
          formData.append(`${item.id}_${index}`, file);
        });
      });

      // Fetch dashboard data
      const response = await fetch(
        "/api/callable-api/cypress-report-generator/dashboard",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dashboardData = await response.json() as CypressReportDashboardProps["dashboardData"];
      return dashboardData;
    }),

  updateResult: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      date: z.date(),
      data: z.unknown(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, name, date, data } = input;
      return ctx.db.result.update({
        where: { id },
        data: { name, date, data: data as Prisma.InputJsonValue },
      });
    }),
}) 