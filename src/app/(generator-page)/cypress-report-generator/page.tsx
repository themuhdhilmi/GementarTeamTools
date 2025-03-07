"use client";
import { useState } from "react";
import { columns, type MochaData } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import { Label } from "~/components/ui/label";

export default function DemoPage() {
  // const data = await getData()
  const [data, setData] = useState<MochaData[]>([]);
  const [text, setText] = useState("");
  const [jiraFile, setJiraFile] = useState<File | null>(null);

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
      console.error("No file or data available");
      return;
    }
  
    const formData = new FormData();
  
    // Append each MochaData object as JSON
    formData.append("mochaData", new Blob([JSON.stringify(data)], { type: "application/json" }));
  
    // Append Jira file
    formData.append("jiraFile", jiraFile);
  
    try {
      const response = await fetch("/api/callable-api/cypress-report-generator", {
        method: "POST",
        body: formData,
      });
  
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await response.json();
      console.log("Upload success:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="container mx-auto px-5 py-10">
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

        <Button onClick={handleUpload}>
          Submit
        </Button>
      </div>
    </div>
  );
}
