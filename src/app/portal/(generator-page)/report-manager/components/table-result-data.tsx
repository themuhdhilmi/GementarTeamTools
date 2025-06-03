import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "~/components/ui/table"
import { ModalEdit } from "./modal-edit"
import { Button } from "~/components/ui/button"
import { db } from "~/server/db"
import { ProjectSelect } from "./project-select"
import { DeleteButton } from "./delete-button"
import { createResult } from "../actions"

interface TableResultDataProps {
  selectedProjectId?: string
}

export async function TableResultData({ selectedProjectId }: TableResultDataProps) {
  const projects = await db.project.findMany()
  const results = selectedProjectId 
    ? await db.result.findMany({
        where: {
          projectId: selectedProjectId,
        },
        orderBy: {
          date: "desc",
        },
      })
    : []

  const defaultProjectId = projects[0]?.id ?? ""
  const currentProjectId = selectedProjectId ?? defaultProjectId

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ProjectSelect projects={projects} defaultValue={currentProjectId} />
        <form action={createResult}>
          <input type="hidden" name="projectId" value={selectedProjectId} />
          <div className="flex gap-2">
            <input
              name="name"
              placeholder="Enter result name"
              className="px-3 py-2 border rounded"
              required
            />
            <Button type="submit">Create New Result</Button>
          </div>
        </form>
      </div>

      <Table>
        <TableCaption>List of results for the selected project.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id}>
              <TableCell className="font-medium">
                {new Date(result.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{result.name}</TableCell>
              <TableCell>{result.data ? "Ada Data" : "Tiada Data"} {JSON.stringify(result.data)}</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-row-reverse gap-2">
                  <DeleteButton id={result.id} />
                  <ModalEdit resultId={result.id} defaultName={result.name} defaultDate={result.date.toISOString()} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total Results</TableCell>
            <TableCell className="text-right">{results.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
  