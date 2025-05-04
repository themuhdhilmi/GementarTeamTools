"use client";
import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Separator } from "~/components/ui/separator";

const COLORS = {
  passed: "#22c55e", // hijau
  failed: "#ef4444", // merah
  skipped: "#eab308", // hitam
  pending: "#6b7280", // coklat
};

{/* <div className="h-3 w-3 rounded-full bg-green-500" />
<div>Passed</div>
<Separator orientation="vertical" />
<div className="h-3 w-3 rounded-full bg-red-500" />
<div>Failed</div>
<Separator orientation="vertical" />
<div className="h-3 w-3 rounded-full bg-gray-500" />
<div>Skipped</div>
<Separator orientation="vertical" />
<div className="h-3 w-3 rounded-full bg-yellow-500" />
<div>Pending</div> */}

const chartConfig = {
  visitors: {
    label: "Passed",
    color: COLORS.passed,
  },
  chrome: {
    label: "Failed",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Pending",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Skipped",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

interface PieChartReportDashboardProps {
  dashboardData: {
    moduleName?: string;
    titleText?: string;
    subTitleText?: string;
    totalTests?: number;
    totalPassed?: number;
    totalFailed?: number;
    totalPending?: number;
    totalSkipped?: number;
    totalDuration?: number;
  };
}
export function PieChartReportDashboard({
  dashboardData,
}: PieChartReportDashboardProps) {
  const chartData = [
    {
      browser: "Passed",
      visitors: dashboardData.totalPassed,
      fill: COLORS.passed,
    },
    {
      browser: "Failed",
      visitors: dashboardData.totalFailed,
      fill: COLORS.failed,
    },
    {
      browser: "Pending",
      visitors: dashboardData.totalPending,
      fill: COLORS.pending,
    },
    {
      browser: "Skipped",
      visitors: dashboardData.totalSkipped,
      fill: COLORS.skipped,
    },
  ];

//   const totalVisitors = React.useMemo(() => {
//     return dashboardData.totalTests
//   }, []);

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + (curr.visitors ?? 0), 0)
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{dashboardData.titleText}</CardTitle>
        
        {dashboardData.moduleName === undefined ? <CardDescription><div>{dashboardData.subTitleText}</div></CardDescription> : ``}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className={`mx-auto aspect-square ${dashboardData.moduleName === undefined ? "max-h-[250px]" : "max-h-[0px]"}`}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        x={viewBox.cx}
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                          x={viewBox.cx}
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors?.toLocaleString()}
                        </tspan>
                        <tspan
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                          x={viewBox.cx}
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Tests
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none text-center w-full">
            {dashboardData.moduleName === undefined ? "" : `${dashboardData.totalTests} Tests | ${Math.floor( parseInt(dashboardData.totalDuration?.toString() ?? "0") / (1000 * 60 * 60))}h ${Math.floor((parseInt(dashboardData.totalDuration?.toString() ?? "0") % (1000 * 60 * 60)) / (1000 * 60))}m ${Math.floor((parseInt(dashboardData.totalDuration?.toString() ?? "0") % (1000 * 60)) / 1000)}s | ${((dashboardData?.totalPassed ?? 0) / (dashboardData?.totalTests ?? 1) * 100).toFixed(2)}% Passed`}
            </h4>
          </div>
          <Separator className="my-4" />
          <div className="flex h-5 items-center space-x-4 text-sm">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <div>{dashboardData.totalPassed}</div>
            <Separator orientation="vertical" />
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div>{dashboardData.totalFailed}</div>
            <Separator orientation="vertical" />
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            <div>{dashboardData.totalSkipped}</div>
            <Separator orientation="vertical" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div>{dashboardData.totalPending}</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
