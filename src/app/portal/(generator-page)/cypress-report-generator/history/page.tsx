"use client";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { format } from "date-fns";
import { ms } from "date-fns/locale";

export default function ReportHistoryPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = api.cypressReportGenerator.getReportHistory.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">History Laporan Cypress</h1>
      
      <div className="grid gap-4">
        {data?.pages.map((page) =>
          page.items.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{report.module}</span>
                  <span className="text-sm text-gray-500">
                    {format(report.createdAt, "dd MMMM yyyy HH:mm", { locale: ms })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">File: {report.fileName}</p>
                    <p className="text-sm text-gray-500">Path: {report.filePath}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
} 