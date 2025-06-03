"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import type { Project } from "@prisma/client"

interface ProjectSelectProps {
  projects: Project[]
  defaultValue: string
}

export function ProjectSelect({ projects, defaultValue }: ProjectSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("projectId", value)
    router.push(`?${params.toString()}`)
  }

  return (
    <Select defaultValue={defaultValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Pilih Project" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 