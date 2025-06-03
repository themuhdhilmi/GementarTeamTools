"use server"

import { db } from "~/server/db"
import { revalidatePath } from "next/cache"

export async function deleteResult(formData: FormData) {
  const id = formData.get("id") as string
  if (!id) return

  await db.result.delete({
    where: { id },
  })
  revalidatePath("/portal/report-manager")
}

export async function createResult(formData: FormData) {
  const name = formData.get("name") as string
  const projectId = formData.get("projectId") as string
  if (!name || !projectId) return

  await db.result.create({
    data: {
      name,
      projectId,
      date: new Date(),
    },
  })
  revalidatePath("/portal/report-manager")
} 