"use client";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { DataTable } from "../../cypress-report-generator/data-table";
import { useEffect, useState } from "react";
import { type CypressReportDashboardProps } from "../../cypress-report-generator/page";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { cn } from "~/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "~/components/ui/calendar";
import { api } from "~/trpc/react";
import {
  columns,
  type MochaData,
} from "../../cypress-report-generator/columns";

export interface ModalEditProps {
  resultId: string;
  defaultName: string;
  defaultDate: string;
}

export function ModalEdit({ resultId, defaultName, defaultDate }: ModalEditProps) {
  const [data, setData] = useState<MochaData[]>([]);
  const [text, setText] = useState("");
  const [jiraFile, setJiraFile] = useState<File | null>(null);
  const [dashboardData, setDashboardData] = useState<CypressReportDashboardProps["dashboardData"]>({
    statsModuleTotal: {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalPending: 0,
      totalSkipped: 0,
      totalSuites: 0,
      totalModules: 0
    },
    statsPerModule: [],
    statsPerPath: [],
    statsPerPathPerModule: [],
    paths: []
  });
  const [resultName, setResultName] = useState<string>(defaultName);
  const [date, setDate] = useState<Date | undefined>(defaultDate ? new Date(defaultDate) : undefined);
  const [disableButton, setDisableButton] = useState(false);

  const updateResult = api.result.updateResult.useMutation();

  useEffect(() => {
    const fetchData = async () => {
      // All static paths in an array
      const filePaths = {
        "Client Portal": "/sample-results/client-portal/index.json",
        "Core Payroll": [
          "/sample-results/core-payroll/index.json",
          "/sample-results/uam/index.json",
          "/sample-results/marketer-payroll/index.json",
        ],
        "Production Accounting (LUCA)": ["/sample-results/luca/index.json"],
        "Onboarding and Timecard entry": [
          "/sample-results/onboarding-timecard/index.json",
        ],
        "Commercial Talent & Vendor Payments": [
          "/sample-results/vendor-payments/index.json",
        ],
        "Hours To Gross": ["/sample-results/htg-linx/index.json"],
        "Talent and Rights": ["/sample-results/talent-and-rights/index.json"],
        "Payee Portal": ["/sample-results/payee-portal/index.json"],
        Residuals: ["/sample-results/residuals/index.json"],
      };

      // Fetch files
      const mochaData: MochaData[] = await Promise.all(
        Object.entries(filePaths).map(async ([module, paths]) => {
          const files = await Promise.all(
            (Array.isArray(paths) ? paths : [paths]).map(async (p) => {
              const res = await fetch(p);
              if (!res.ok) throw new Error(`Failed to fetch ${p}`);
              const blob = await res.blob();
              return new File([blob], p.split("/").at(-2) ?? "file");
            }),
          );

          return {
            id: uuidv4(),
            module,
            upload: files,
          };
        }),
      );

      setData(mochaData);

      // JIRA file
      const jiraPath = "/sample-results/1-jira-csv/index.csv";
      const jiraResponse = await fetch(jiraPath);
      if (!jiraResponse.ok)
        throw new Error(`Failed to fetch Jira file: ${jiraResponse.status}`);
      const jiraBlob = await jiraResponse.blob();
      const jiraFile = new File([jiraBlob], "jira.csv");
      setJiraFile(jiraFile);

      try {
        const formData = new FormData();
        formData.append("jiraFile", jiraFile);
        formData.append(
          "mochaData",
          new Blob([JSON.stringify(mochaData)], { type: "application/json" }),
        );

        mochaData.forEach((item) => {
          item.upload.forEach((file, index) => {
            formData.append(`${item.id}_${index}`, file);
          });
        });

        // Upload files to backend (S3 handled server-side)
        const uploadResp = await fetch(
          "/api/callable-api/cypress-report-generator",
          { method: "POST", body: formData }
        );

        if (!uploadResp.ok) throw new Error("Upload failed");

        // Get dashboard data
        const dashResp = await fetch(
          "/api/callable-api/cypress-report-generator/dashboard",
          { method: "POST", body: formData }
        );

        if (!dashResp.ok) throw new Error("Dashboard fetch failed");

        const dashboardData = (await dashResp.json()) as CypressReportDashboardProps["dashboardData"];

        setDashboardData(dashboardData);

        // save/update result info
        await updateResult.mutateAsync({
          id: resultId,
          name: resultName,
          date: date ?? new Date(),
          data: dashboardData,
        });
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to process data");
      }
    };

    void fetchData();
  }, []);

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
    if (!jiraFile || data.length === 0) {
      toast.error("Error! empty file.");
      return;
    }

    void toast.promise(
      async () => {
        try {
          setDisableButton(true);

          const formData = new FormData();
          formData.append("jiraFile", jiraFile);
          formData.append(
            "mochaData",
            new Blob([JSON.stringify(data)], { type: "application/json" }),
          );

          data.forEach((item) => {
            item.upload.forEach((file, index) => {
              formData.append(`${item.id}_${index}`, file);
            });
          });

          const uploadResp = await fetch(
            "/api/callable-api/cypress-report-generator",
            { method: "POST", body: formData }
          );

          if (!uploadResp.ok) throw new Error("Upload failed");

          const dashResp = await fetch(
            "/api/callable-api/cypress-report-generator/dashboard",
            { method: "POST", body: formData }
          );

          if (!dashResp.ok) throw new Error("Dashboard fetch failed");

          const dashboardData = (await dashResp.json()) as CypressReportDashboardProps["dashboardData"];

          setDashboardData(dashboardData);

          // save/update result info
          await updateResult.mutateAsync({
            id: resultId,
            name: resultName,
            date: date ?? new Date(),
            data: dashboardData,
          });
        } catch (error) {
          console.error("Upload failed:", error);
          throw error;
        } finally {
          setDisableButton(false);
        }
      },
      {
        loading: "Loading...",
        success: "Got the data!",
        error: "Error when fetching!",
      },
    );
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Edit</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] w-[90vw] overflow-y-auto sm:max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Edit Results</DialogTitle>
            <DialogDescription>
              Make changes to your results here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="z-50 w-auto rounded-md border bg-background p-0 shadow-md"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="grid w-full max-w-md items-center gap-1.5 pt-5">
            <label className="mb-1 block text-sm font-medium">Result Name</label>
            <input
              type="text"
              value={resultName}
              onChange={(e) => setResultName(e.target.value)}
              placeholder="Result Name"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="grid w-full max-w-md items-center gap-1.5 pt-5">
            <div>jira.csv {jiraFile?.name}</div>
            <input
              type="file"
              accept=".csv"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  setJiraFile(file);
                }
              }}
            />
          </div>
          <div className="flex w-full max-w-sm items-center space-x-2 py-3">
            <input
              type="text"
              onChange={(e) => setText(e.target.value)}
              placeholder="Module Name"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpload} disabled={disableButton}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
