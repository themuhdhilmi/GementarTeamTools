import type Mochawesome from "mochawesome";
import { type NextRequest, NextResponse } from "next/server";
import { GetMochaData } from "../functions/convert-jira-csv";
import { getDashboardData } from "../functions/process-dashboard-data";

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

    const data = getDashboardData(mochaData);

    console.log(JSON.stringify(data));

    return NextResponse.json(data);
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

