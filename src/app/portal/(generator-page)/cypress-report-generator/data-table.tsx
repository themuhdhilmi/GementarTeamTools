/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  functionDeleteItem: (id: string) => void;
  functionHandleFileChange: (id: string, files: FileList | null) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  functionDeleteItem,
  functionHandleFileChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {(() => {
                       if (cell.column.id === "upload") {
                        const itemNames: string[] = [];
                        (cell.row.original as { upload : { name : string }[] }).upload.forEach(
                          (element: { name: string }, index: number) => {
                            if (index === 0) {
                              itemNames.push(element.name);
                            } else {
                              itemNames.push("," + element.name);
                            }
                          },
                        );
                        return <>{itemNames}</>;
                      }
                       else {
                        return (
                          <>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </>
                        );
                      }
                    })()}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture">mochaAwsome(s).json</Label>
                    <Input
                      type="file"
                      multiple
                      accept="application/json"
                      onChange={(e) =>
                        functionHandleFileChange(
                          (row as { original : { id : string} }).original.id,
                          e.target.files,
                        )
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button onClick={() => functionDeleteItem((row as { original : { id : string} }).original.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
