import { type NextRequest, NextResponse } from "next/server";
import { type MochaData } from "~/app/(generator-page)/cypress-report-generator/columns";
import { type JiraIssue, parseJiraCSV } from "./functions/convert-jira-csv";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const mochaFile = formData.get("mochaData") as File;
    if (!mochaFile) {
      return NextResponse.json({ error: "Missing mochaData file" }, { status: 400 });
    }

    const mochaText = await mochaFile.text();

    const jiraFile = formData.get("jiraFile") as File;
    if (!jiraFile) {
      return NextResponse.json({ error: "Missing jiraFile" }, { status: 400 });
    }

    const jiraText = await jiraFile.text();

    //#region LOGIC
    const jiraData: JiraIssue[] = parseJiraCSV(jiraText);
    const mochaData = JSON.parse(mochaText) as MochaData[];


    //#endregion
    

    return NextResponse.json(
      {
        message: "Data received",
        mochaData,
        jiraData
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request", details: (error as Error).message },
      { status: 500 }
    );
  }
}
