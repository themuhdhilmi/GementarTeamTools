import Papa from 'papaparse';
import { MochaDataAPI } from '../route';
import Mochawesome from 'mochawesome';

export type JiraIssue = {
  issueType: string;
  issueKey: string;
  issueId: string;
  summary: string;
  assignee: string;
  assigneeId: string;
  reporter: string;
  reporterId: string;
  appsModules: string;
  severity: string;
  priority: string;
  status: string;
  resolution: string;
  created: string;
  updated: string;
  dueDate: string;
  linkedIssues: string;
  outwardIssueLink: string;
  inwardIssueLink: string;
};

export function parseJiraCSV(csvText: string): JiraIssue[] {
  const parsed = Papa.parse(csvText, {
    header: true, 
    skipEmptyLines: true,
    dynamicTyping: true, 
  });

  const data = parsed.data as Record<string, string>[];

  return data.map((row: Record<string, string>) => { 
    return {
      issueType: row["Issue Type"] ?? "",
      issueKey: row["Issue key"] ?? "",
      issueId: row["Issue id"] ?? "",
      summary: row.Summary ?? "",
      assignee: row.Assignee ?? "",
      assigneeId: row["Assignee Id"] ?? "",
      reporter: row.Reporter ?? "",
      reporterId: row["Reporter Id"] ?? "",
      appsModules: row["Custom field (Apps/Modules)"] ?? "",
      severity: row["Custom field (Severity)"] ?? "",
      priority: row.Priority ?? "",
      status: row.Status ?? "",
      resolution: row.Resolution ?? "",
      created: row.Created ?? "",
      updated: row.Updated ?? "",
      dueDate: row["Due date"] ?? "",
      linkedIssues: row["Custom field (Linked issues)"] ?? "",
      outwardIssueLink: row["Outward issue link (Blocks)"] ?? "",
      inwardIssueLink: row["Inward issue link (Test)"] ?? "",
    } as JiraIssue;
  });
}


export async function GetMochaData(mochaData : MochaDataAPI[] , formData : FormData) {

  await Promise.all(
    mochaData.map(async (element) => {
      const uploadLengthCount = element.upload.length;
      const arrayFile: Mochawesome.Output[] = [];
  
      await Promise.all(
        Array.from({ length: uploadLengthCount }, async (_, i) => {
          const json = formData.get(`${element.id}_${i}`) as File;
          if (json) {
            const mochaDataRawText = await json.text(); 
            const mochaDataObj = JSON.parse(mochaDataRawText) as Mochawesome.Output; 
            arrayFile.push(mochaDataObj);
          }
        })
      );
  
      element.upload = arrayFile;
    })
  );
}