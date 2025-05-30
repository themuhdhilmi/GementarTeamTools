"use client"
import * as React from "react"
import { api } from "~/trpc/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ArrowUpDown, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { EditUserDialog } from "./edit-user-dialog"

export function UserTable() {
    const [emailFilter, setEmailFilter] = React.useState("")
    const [selectedGroup, setSelectedGroup] = React.useState("ALL")
    const [currentPage, setCurrentPage] = React.useState(1)
    const [sortConfig, setSortConfig] = React.useState<{
        key: "email" | "group";
        direction: "asc" | "desc";
    }>({ key: "email", direction: "asc" })

    const { data: users, isLoading, refetch } = api.user.getAllUsers.useQuery({
        filterByName: emailFilter,
        filterByGroup: selectedGroup === "ALL" ? "" : selectedGroup,
        resultCount: 10,
        resultPage: currentPage,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
    });

    const { data: groups } = api.user.getAllGroups.useQuery();

    const handleSort = (key: "email" | "group") => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }))
    }

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
    }

    return (
        <div className="w-full space-y-4 p-2 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Input
                    placeholder="Search by email..."
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="w-full sm:max-w-sm"
                />
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Groups</SelectItem>
                        {groups?.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                                {group.id}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead 
                                className="cursor-pointer"
                                onClick={() => handleSort("email")}
                            >
                                <div className="flex items-center">
                                    Email
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </div>
                            </TableHead>
                            <TableHead 
                                className="cursor-pointer"
                                onClick={() => handleSort("group")}
                            >
                                <div className="flex items-center">
                                    Group
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </div>
                            </TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>}
                        {users?.users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.groupId}</TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <EditUserDialog
                                            userId={user.id}
                                            userName={user.name}
                                            userEmail={user.email}
                                            userGroupId={user.groupId}
                                            onSuccess={() => refetch()}
                                        />
                                        {/* <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button> */}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, users?.pagination.totalCount ?? 0)} of {users?.pagination.totalCount} entries
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= (users?.pagination.totalPages ?? 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
