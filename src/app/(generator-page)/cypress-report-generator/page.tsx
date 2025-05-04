"use client";
import { useState } from "react";
import { columns, type MochaData } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import { Label } from "~/components/ui/label";
import toast, { Toaster } from "react-hot-toast";
import CypressReportDashboard from "./components/cypress-report-dashbaord";

export interface CypressReportDashboardProps {
  dashboardData: {
    statsModuleTotal: {
      totalTests: number;
      totalPassed: number;
      totalFailed: number;
      totalPending: number;
      totalSkipped: number;
      totalDuration: number;
      totalSuites: number;
      totalModules: number;
    };
    statsPerModule: {
      moduleName: string;
      totalTests: number;
      totalPassed: number;
      totalFailed: number;
      totalPending: number;
      totalSkipped: number;
      totalDuration: number;
      totalSuites: number;
      totalModules: number;
    }[];
  };
}

export default function DemoPage() {
  // const data = await getData()
  const [data, setData] = useState<MochaData[]>([]);
  const [text, setText] = useState("");
  const [jiraFile, setJiraFile] = useState<File | null>(null);
  const [dashboardData, setDashboardData] =
    useState<CypressReportDashboardProps | null>(null);

  const [disableButton, setDisableButton] = useState(false);

  const deleteItem = (index: string) => {
    setData((prevData) => prevData.filter((item) => item.id !== index));
  };

  const handleFileChange = (id: string, files: FileList | null) => {
    if (!files) return;

    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, upload: Array.from(files) } : item,
      ),
    );
  };

  const handleUpload = async () => {
    let isAbleToSubmit = true;
    const formData = new FormData();

    if (!jiraFile || data.length === 0) {
      isAbleToSubmit = false;
    } else {
      // Append Jira file
      formData.append("jiraFile", jiraFile);
    }

    formData.append(
      "mochaData",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );

    data.forEach((item) => {
      if (item.upload.length === 0) isAbleToSubmit = false;

      item.upload.forEach((element, index: number) => {
        formData.append(item.id + "_" + index, element);
      });
    });

    if (!isAbleToSubmit) {
      toast.error("Error! empty file.");
      return;
    }

    void toast.promise(
      async () => {
        try {
          setDisableButton(true);

          const responseDashboard = await fetch(
            "/api/callable-api/cypress-report-generator/dashboard",
            {
              method: "POST",
              body: formData,
            },
          );

          if (!responseDashboard.ok) {
            throw new Error(`HTTP error! status: ${responseDashboard.status}`);
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const dashboardData = await responseDashboard.json();
          console.log("Dashboard data:", dashboardData);

          setDashboardData(dashboardData);

          const response = await fetch(
            "/api/callable-api/cypress-report-generator",
            {
              method: "POST",
              body: formData,
            },
          );

          const contentType = response.headers.get("Content-Type");

          if (contentType?.includes("text/csv")) {
            const blob = await response.blob();
            const link = document.createElement("a");

            const url = URL.createObjectURL(blob);

            link.href = url;
            link.download = "cypress-report.csv";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log("CSV file download initiated.");
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const result = await response.json();
            console.log("Upload success:", result);
          }
        } catch (error) {
          console.error("Upload failed:", error);
          throw error; // Ensure the error is propagated so that `toast.promise` can trigger the error toast
        }

        setDisableButton(false);
      },
      {
        loading: "Loading...",
        success: "Got the data!",
        error: "Error when fetching!",
      },
    );
  };

  return (
    <div className="container mx-auto px-5 py-10">
      <Toaster />
      <div className="flex w-full max-w-sm items-center space-x-2 py-3">
        <Input
          type="text"
          onChange={(e) => setText(e.target.value)}
          placeholder="Module Name"
        />
        <Button
          type="submit"
          onClick={() => {
            if (text === "") return;
            const id = uuidv4();
            const newData: MochaData = {
              id: id,
              module: text,
              upload: [],
            };

            if (text != "!!xr") {
              setData((prevData) => [...prevData, newData]);
            } else {
              const newData2: MochaData[] = [
                {
                  id: uuidv4(),
                  module: "Core Payroll",
                  upload: [],
                },
                {
                  id: uuidv4(),
                  module: "Production Accounting (LUCA)",
                  upload: [],
                },
                {
                  id: uuidv4(),
                  module: "Onboarding and Timecard entry",
                  upload: [],
                },
                {
                  id: uuidv4(),
                  module: "Commercial Talent & Vendor Payments",
                  upload: [],
                },
                {
                  id: uuidv4(),
                  module: "Hours To Gross",
                  upload: [],
                },
                {
                  id: uuidv4(),
                  module: "Talent and Rights",
                  upload: [],
                },
                {
                  id: uuidv4(),
                  module: "Payee Portal",
                  upload: [],
                },
                {
                  id: uuidv4(),
                  module: "Residuals",
                  upload: [],
                },
                {
                  id: uuidv4(),
                  module: "Client Portal",
                  upload: [],
                },
              ];
              setData(newData2);
            }
          }}
        >
          Add Module
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        functionDeleteItem={deleteItem}
        functionHandleFileChange={handleFileChange}
      />

      <div className="grid w-full max-w-md items-center gap-1.5 pt-5">
        <Label htmlFor="picture">jira.csv {jiraFile?.name}</Label>
        <Input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setJiraFile(file);
            }
          }}
        />

        <Button onClick={handleUpload} disabled={disableButton}>
          Submit
        </Button>
      </div>
      <div className="w-full">
        {dashboardData && (
          <CypressReportDashboard dashboardData={dashboardData} />
        )}
      </div>
    </div>
  );
}
