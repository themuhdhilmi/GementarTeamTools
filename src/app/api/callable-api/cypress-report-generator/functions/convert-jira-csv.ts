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
    const lines = csvText.trim().split("\n"); // Split line by line
    const headers = lines.shift()?.split(",").map(h => h.trim()) ?? []; // Extract header
  
    return lines.map(line => {
      const values = line.split(",").map(v => v.trim()); // Ambil values
  
      return {
        issueType: values[headers.indexOf("Issue Type")] ?? "",
        issueKey: values[headers.indexOf("Issue key")] ?? "",
        issueId: values[headers.indexOf("Issue id")] ?? "",
        summary: values[headers.indexOf("Summary")] ?? "",
        assignee: values[headers.indexOf("Assignee")] ?? "",
        assigneeId: values[headers.indexOf("Assignee Id")] ?? "",
        reporter: values[headers.indexOf("Reporter")] ?? "",
        reporterId: values[headers.indexOf("Reporter Id")] ?? "",
        appsModules: values[headers.indexOf("Custom field (Apps/Modules)")] ?? "",
        severity: values[headers.indexOf("Custom field (Severity)")] ?? "",
        priority: values[headers.indexOf("Priority")] ?? "",
        status: values[headers.indexOf("Status")] ?? "",
        resolution: values[headers.indexOf("Resolution")] ?? "",
        created: values[headers.indexOf("Created")] ?? "",
        updated: values[headers.indexOf("Updated")] ?? "",
        dueDate: values[headers.indexOf("Due date")] ?? "",
        linkedIssues: values[headers.indexOf("Custom field (Linked issues)")] ?? "",
        outwardIssueLink: values[headers.indexOf("Outward issue link (Blocks)")] ?? "",
        inwardIssueLink: values[headers.indexOf("Inward issue link (Test)")] ?? "",
      } as JiraIssue;
    });
  }
  