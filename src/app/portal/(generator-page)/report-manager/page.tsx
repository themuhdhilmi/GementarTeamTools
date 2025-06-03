import React from 'react'
import { TableResultData } from './components/table-result-data'
import { Toaster } from 'react-hot-toast'

interface PageProps {
  searchParams: { projectId?: string }
}

export default function ReportManagerPage({ searchParams }: PageProps) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Report Manager</h1>
      <Toaster />
      <TableResultData selectedProjectId={searchParams.projectId} />
    </div>
  )
}