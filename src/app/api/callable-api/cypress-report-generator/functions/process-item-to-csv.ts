import { MochaDataAPI } from "../route";
import { JiraIssue } from "./convert-jira-csv";
import { json2csv } from "json-2-csv";

interface CsvData {
  title?: string;
  updatedBy?: string;
  defectRefactorDependentPassedInLocal?: string;
  reason?: string;
  actionItem?: string;
  action?: string;
  localRun?: string;
  errorMessage?: string;
}

export function processItemToCsv(
  mochaData: MochaDataAPI[],
  jiraData: JiraIssue[],
) {
  const csvData = [] as CsvData[];

  mochaData.forEach((mocha, index) => {
    const data = {
      title: `---${mocha.module}---`,
      updatedBy: "",
      defectRefactorDependentPassedInLocal: "",
      reason: "",
      actionItem: "",
      action: "",
      localRun: "",
      errorMessage: "",
    } as CsvData;

    csvData.push(data);

    mocha.upload.forEach((upload) => {
      upload.results.forEach((result) => {
        result.suites.forEach((suite) => {
          suite.tests.forEach((test) => {
            const match = test.code?.match(/pdated:\s*(\w+)\s*\(?/i);
            const name = match?.[1]?.trim().substring(0, 10) ?? "Unknown";
            if (test.fail) {
              const data = {
                title: test.title,
                updatedBy: name,
                defectRefactorDependentPassedInLocal: "",
                reason: "",
                actionItem: "",
                action: "",
                localRun: "",
                errorMessage: test.err.message,
              } as CsvData;

              csvData.push(data);
            }
          });
        });
      });
    });
  });

  const csv = json2csv(csvData);

  console.log(csv);
}
