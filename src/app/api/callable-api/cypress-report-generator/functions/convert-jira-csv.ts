import Papa from 'papaparse';

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
    header: true,          // Automatically uses the first row as headers
    skipEmptyLines: true,  // Skip any empty lines
    dynamicTyping: true,   // Converts numbers and booleans automatically
  });

  return parsed.data.map((row: Record<string, string>) => { 
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
