import type Mochawesome from "mochawesome";
import { type NextRequest, NextResponse } from "next/server";
import { GetMochaData, parseJiraCSV } from "./functions/convert-jira-csv";
import { processItemToCsv } from "./functions/process-item-to-csv";
import { getDashboardData } from "./functions/process-dashboard-data";
import { uploadMultipleFiles, uploadToS3 } from "~/lib/dashboards/uploadItems";
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

    // Create files for upload
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    const timestamp = Date.now();
    const csvFileName = `cypress-report-${timestamp}.csv`;
    
    // Create separate JSON files for each module
    const jsonFiles = mochaData.map((data, index) => ({
      file: new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      fileName: `cypress-report-${timestamp}-module-${index + 1}.json`,
      bucketName: 'cypress-reports',
      contentType: 'application/json'
    }));
    
    // Commented out upload section as it's not working yet
    /*
    try {
      const uploadResult = await uploadMultipleFiles([
        {
          file: csvBlob,
          fileName: csvFileName,
          bucketName: 'cypress-reports',
          contentType: 'text/csv'
        },
        ...jsonFiles
      ]);

      console.log('uploadResult', JSON.stringify(uploadResult));

      return NextResponse.json({ 
        success: true, 
        downloadUrl: uploadResult,
        message: 'Files processed and uploaded successfully'
      });
    } catch (uploadError) {
      console.error('Error uploading to S3:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload files to storage',
        details: (uploadError as Error).message 
      }, { status: 500 });
    }
    */

    // Return CSV data directly for now
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${csvFileName}"`,
      },
    });
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

