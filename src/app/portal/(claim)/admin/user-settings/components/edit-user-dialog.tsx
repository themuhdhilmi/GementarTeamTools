"use client"

import * as React from "react"
import { api } from "~/trpc/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Pencil } from "lucide-react"
import { toast } from "sonner"

interface EditUserDialogProps {
  userId: string
  userName: string
  userEmail: string
  userGroupId: string
  onSuccess?: () => void
}

export function EditUserDialog({ userId, userName, userEmail, userGroupId, onSuccess }: EditUserDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(userName)
  const [email, setEmail] = React.useState(userEmail)
  const [password, setPassword] = React.useState("")
  const [selectedGroup, setSelectedGroup] = React.useState(userGroupId)

  const { data: groups } = api.user.getAllGroups.useQuery()
  const updateUser = api.user.updateUser.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully")
      setOpen(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser.mutate({
      id: userId,
      name,
      email,
      password: password || undefined,
      groupId: selectedGroup
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password">Password (leave blank to keep current)</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="group">Group</label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groups?.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={updateUser.isPending }>
            {updateUser.isPending ? "Updating..." : "Update User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 