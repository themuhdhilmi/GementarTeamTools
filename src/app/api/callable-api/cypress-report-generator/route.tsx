import type Mochawesome from "mochawesome";
import { type NextRequest, NextResponse } from "next/server";
import { GetMochaData, parseJiraCSV } from "./functions/convert-jira-csv";
import { processItemToCsv } from "./functions/process-item-to-csv";
import { getDashboardData } from "./functions/process-dashboard-data";
// import { type MochaData } from "~/app/(generator-page)/cypress-report-generator/columns";

export type MochaDataAPI = {
  id: string
  module: string
  upload: Mochawesome.Output[]
}

export async function POST(request: NextRequest) {
  try {
    await new Promise(resolve => setTimeout(resolve, 5000)); // 10 seconds delay
    
    const formData = await request.formData();

    const mochaDataRaw = formData.get("mochaData") as File;
    if (!mochaDataRaw) {
      return NextResponse.json({ error: "Missing mochaData" }, { status: 400 });
    }

    const jiraFile = formData.get("jiraFile") as File;
    if (!jiraFile) {
      return NextResponse.json({ error: "Missing jiraFile" }, { status: 400 });
    }

    const mochaDataRawText = await mochaDataRaw.text()
    const mochaData  = JSON.parse(mochaDataRawText) as MochaDataAPI[];
    await GetMochaData(mochaData, formData);

    const jiraFileRawText = await jiraFile.text()
    const jiraData = parseJiraCSV(jiraFileRawText);

    const csv = processItemToCsv(mochaData, jiraData)

    const response = new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',  // Set content type to CSV
        'Content-Disposition': 'attachment; filename=generated-data.csv',  // Set file name
      }
    });

    return response;
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to process request',
        details: (error as Error).message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

