import { type MochaDataAPI } from "../route";
import { type JiraIssue } from "./convert-jira-csv";
import { json2csv } from "json-2-csv";
import fs from "fs";

interface CsvData {
  moduleName: string;
  title?: string;
  updatedBy?: string;
  defectRefactorDependentPassedInLocal?: string;
  reason?: string;
  actionItem?: string;
  action?: string;
  defectId?: string[] | string;
  localRun?: string;
}

interface JiraConvertData {
  defectId?: "";
  tcId?: "";
  appsModules? : ""
}

export function processItemToCsv(
  mochaData: MochaDataAPI[],
  jiraData: JiraIssue[],
) : string {
  const csvData = getAzureMochaToCsvFormat(mochaData);
  const jiraConvertData = getConvertedJiraData(jiraData);

  // console.log(jiraConvertData)

  csvData.forEach(element => {
    const getDataMatchModuleName = jiraConvertData.filter((x) => x.appsModules === element.moduleName && x.tcId === element.title);

    if (getDataMatchModuleName.length > 0) {
      if (!Array.isArray(element.defectId)) {
        element.defectId = []; 
      }
        getDataMatchModuleName.forEach(moduleName => {
          element.defectId?.push(moduleName.defectId ?? "");
        });
    }else
    {
      element.defectId = ""; 
    }
  });
  
  const csv = json2csv(csvData);
  return csv
  // fs.writeFileSync("data.csv", csv, "utf8");
}

function getConvertedJiraData(jiraData: JiraIssue[]): JiraConvertData[] {
  const jiraConvertData = [] as JiraConvertData[];

  jiraData.forEach((element) => {
    // Extract everything inside the first set of parentheses
    const match = /\(([^)]+)\)/.exec(element.summary);
    let tcId = match?.[1]?.trim() ?? "";
    tcId = tcId.replace(/,/g, "|");
    const tcIds = tcId.split("|");

    const modules = element.appsModules.split('-')[0]?.trimEnd().trimStart()

    tcIds.forEach((tcId) => {
      const data = {
        defectId: element.issueKey,
        tcId: tcId,
        appsModules: modules
      } as JiraConvertData;
      jiraConvertData.push(data);
    });
  });

  return jiraConvertData;
}

function getAzureMochaToCsvFormat(mochaData: MochaDataAPI[]): CsvData[] {
  const csvData = [] as CsvData[];

  mochaData.forEach((mocha) => {
    let countTotalFail = 0;
    mocha.upload.forEach((upload) => {
      upload.results.forEach((result) => {
        result.suites.forEach((suite) => {
          suite.tests.forEach((test) => {
            const match = test.code?.replace(/\s+/g, '').match(/pdated:(\w+)\(?/i);
            const name = match?.[1]?.trim().substring(0, 10).replace(/[0-9\W_]/g, '') ?? "Unknown";
            if (test.fail) {
              const dataTestCase = {
                moduleName: mocha.module,
                title: test.title,
                updatedBy: name,
                defectRefactorDependentPassedInLocal: "",
                reason: "",
                actionItem: "",
                action: "",
                localRun: "",
                defectId: [],
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                errorMessage: test.err.message.replace(/[\r\n]+/g, " "),
              } as CsvData

              countTotalFail++;
              csvData.push(dataTestCase);
            }
          });
        });
      });
    });

    const dataTestCase = {
      moduleName: `Total Failed ${countTotalFail}`,
      title: "",
      updatedBy: "",
      defectRefactorDependentPassedInLocal: "",
      reason: "",
      actionItem: "",
      action: "",
      localRun: "",
      defectId: [],
      errorMessage: "",
    };
    const empty = {
      moduleName: "",
      title: "",
      updatedBy: "",
      defectRefactorDependentPassedInLocal: "",
      reason: "",
      actionItem: "",
      action: "",
      localRun: "",
      defectId: [],
      errorMessage: "",
    };
    csvData.push(dataTestCase);
    csvData.push(empty);
    csvData.push(empty);
    csvData.push(empty);
    csvData.push(empty);
  });

  return csvData;
}
