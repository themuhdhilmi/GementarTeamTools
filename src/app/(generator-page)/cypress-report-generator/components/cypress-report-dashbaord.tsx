"use client";
import { Separator } from "~/components/ui/separator";
import { type CypressReportDashboardProps } from "../page";
import { PieChartReportDashboard } from "./pie-chart";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";

export default function CypressReportDashboard({
  dashboardData,
}: CypressReportDashboardProps) {
  // const data = await getData()

  const statsPerModuleTotal = {
    titleText: "Cumulative Stats",
    subTitleText: "Result for entire test suite for UAT2",
    totalSuites: dashboardData.statsModuleTotal.totalSuites,
    totalTests: dashboardData.statsModuleTotal.totalTests,
    totalPassed: dashboardData.statsModuleTotal.totalPassed,
    totalFailed: dashboardData.statsModuleTotal.totalFailed,
    totalPending: dashboardData.statsModuleTotal.totalPending,
    totalSkipped: dashboardData.statsModuleTotal.totalSkipped,
    totalDuration: dashboardData.statsModuleTotal.totalDuration,
  };

  const staterperModule = dashboardData.statsPerModule.map((module) => ({
    titleText: "Cumulative Stats for " + module.moduleName,
    moduleName: module.moduleName,
    subTitleText: "Result for entire test suite for UAT2",
    totalSuites: module.totalSuites,
    totalTests: module.totalTests,
    totalPassed: module.totalPassed,
    totalFailed: module.totalFailed,
    totalPending: module.totalPending,
    totalSkipped: module.totalSkipped,
    totalDuration: module.totalDuration,
  }));

  return (
    <div className="w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30}>
          <div className="p-4">
            <h3 className="mb-4 text-lg font-medium">Total Report</h3>

            <div className="pb-5">
              <Separator className="my-4" />
              <div className="flex h-5 items-center space-x-4 text-sm">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div>Passed</div>
                <Separator orientation="vertical" />
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div>Failed</div>
                <Separator orientation="vertical" />
                <div className="h-3 w-3 rounded-full bg-gray-500" />
                <div>Skipped</div>
                <Separator orientation="vertical" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div>Pending</div>
              </div>

            </div>
            <div className="rounded-lg border p-2">
              <PieChartReportDashboard dashboardData={statsPerModuleTotal} />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={70}>
          <div className="p-4">
            <h3 className="mb-4 text-lg font-medium">Module Reports</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {staterperModule.map((module, index) => (
                <div key={index} className="rounded-lg border p-2">
                  <PieChartReportDashboard dashboardData={module} />
                </div>
              ))}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
