"use client"

import { Button } from "~/components/ui/button"
import { deleteResult } from "../actions"

export function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteResult}>
      <input type="hidden" name="id" value={id} />
      <Button 
        variant="outline" 
        type="submit"
        onClick={(e) => {
          if (!confirm("Are you sure you want to delete this result?")) {
            e.preventDefault()
          }
        }}
      >
        Delete
      </Button>
    </form>
  )
} 