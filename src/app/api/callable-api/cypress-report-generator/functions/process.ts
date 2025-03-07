import { type MochaData } from "~/app/(generator-page)/cypress-report-generator/columns";
import { type JiraIssue } from "./convert-jira-csv";

export type ProcessedData = {
  modules: {
    name: string;
    fromJira: {
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
    fromMocha: {
      tcId: string;
      updatedBy: string;
      defectRefactorDependent?: string;
      reason?: string;
      actionsItem?: string;
      action?: string;
      errorMessage?: string;
    };
  };
};

export function reportProcess(jiraData: JiraIssue[], mochaData: MochaData[]): void {
    // Cari semua JIRA issue yang module dia sama dengan mocha.module
    // const matchingJiraIssues = jiraData.filter(jira => jira.appsModules === mochaData.module);
  
    // Cari JIRA issue yang ada summary mengandungi `[tcId]`
    // const matchedJira = matchingJiraIssues.find(jira => jira.summary.includes(`[${mochaData.id}]`)) ?? null;
  
  }
  
  
