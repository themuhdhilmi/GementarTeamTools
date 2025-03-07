"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type MochaData = {
  id: string
  module: string
  upload: File[]
}

export const columns: ColumnDef<MochaData>[] = [
  {
    accessorKey: "module",
    header: "Module",
  },
  {
    accessorKey: "upload",
    header: "Uploaded file(s)",
  },
]
