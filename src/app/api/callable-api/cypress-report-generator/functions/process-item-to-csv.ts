import { type MochaDataAPI } from "../route";
import { type JiraIssue } from "./convert-jira-csv";
import { json2csv } from "json-2-csv";

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
  errorMessage? : string;
}

interface JiraConvertData {
  defectId?: "";
  tcId?: "";
  appsModules?: "";
}

interface CountUpdatedBy {
  name?: string,
  count?: number,
}

export function processItemToCsv(
  mochaData: MochaDataAPI[],
  jiraData: JiraIssue[],
): string {
  const csvData = getAzureMochaToCsvFormat(mochaData);
  const jiraConvertData = getConvertedJiraData(jiraData);

  updateCsvToInsertAllDataPerModule(csvData, jiraConvertData);

  updateCsvToInsertNextLine(csvData);
  updateCsvToInsertNextLine(csvData);
  updateCsvToInsertNextLine(csvData);

  updatCsvTotalEntireFailed(csvData);
  updateCsvTotalEntireDefectPerTc(csvData);
  // updateCsvTotalEntireDefect(csvData);

  updateCsvToInsertNextLine(csvData);
  updateCsvToInsertNextLine(csvData);
  updateCsvToInsertNextLine(csvData);

  updateCsvToFindTotalFailPerPerson(csvData);

  const csv = json2csv(csvData);
  return csv;
}

function updatCsvTotalEntireFailed(csvData : CsvData[])
{

  let countFailed = 0;
  csvData.forEach(element => {
    if(element.errorMessage && element.errorMessage.length > 1)
    {
      countFailed++;
    }
  });

  const title = {
    moduleName: "",
    title: "",
    updatedBy: "",
    defectRefactorDependentPassedInLocal: "Total Entire Failed",
    reason: countFailed.toString(),
    actionItem: "",
    action: "",
    localRun: "",
    defectId: "",
    errorMessage: "",
  } as CsvData

  csvData.push(title);

}

function updateCsvTotalEntireDefectPerTc(csvData : CsvData[])
{

  let countFailed = 0;
  csvData.forEach(element => {
    if(element.defectId && element.defectId.length > 0)
    {
      countFailed++;
    }
  });

  const title = {
    moduleName: "",
    title: "",
    updatedBy: "",
    defectRefactorDependentPassedInLocal: "Total Entire TC with Defects",
    reason: countFailed.toString(),
    actionItem: "",
    action: "",
    localRun: "",
    defectId: "",
    errorMessage: "",
  } as CsvData

  csvData.push(title);

}

function updateCsvTotalEntireDefect(csvData : CsvData[])
{

  let countFailed = 0;
  csvData.forEach(element => {
    if(element.defectId && element.defectId.length > 0)
    {
      countFailed += element.defectId.length;
    }
  });

  const title = {
    moduleName: "",
    title: "",
    updatedBy: "",
    defectRefactorDependentPassedInLocal: "Total Entire Defect",
    reason: countFailed.toString(),
    actionItem: "",
    action: "",
    localRun: "",
    defectId: "",
    errorMessage: "",
  } as CsvData

  csvData.push(title);

}

function getConvertedJiraData(jiraData: JiraIssue[]): JiraConvertData[] {
  const jiraConvertData = [] as JiraConvertData[];

  jiraData.forEach((element) => {
    // Extract everything inside the first set of parentheses
    const match = /\(([^)]+)\)/.exec(element.summary);
    let tcId = match?.[1]?.trim() ?? "";
    tcId = tcId.replace(/,/g, "|");
    const tcIds = tcId.split("|");

    const modules = element.appsModules.split("-")[0]?.trimEnd().trimStart();

    tcIds.forEach((tcId) => {
      const data = {
        defectId: element.issueKey,
        tcId: tcId,
        appsModules: modules,
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
            const match = test.code
              ?.replace(/\s+/g, "")
              .match(/pdated:(\w+)\(?/i);
            const name =
              match?.[1]
                ?.trim()
                .substring(0, 10)
                .replace(/[0-9\W_]/g, "") ?? "Unknown";

           const errorMessage = (test.err as Error)?.message?.replace(/[\r\n]+/g, " ") ?? "No error message";
           const isErrorMessageStartWithTimeout = errorMessage.startsWith("CypressError: Timed");

            if (test.fail) {
              const dataTestCase = {
                moduleName: mocha.module,
                title: test.title,
                updatedBy: name,
                defectRefactorDependentPassedInLocal: isErrorMessageStartWithTimeout ? "CYPESS TIMEOUT" : "",
                reason: "",
                actionItem: "",
                action: "",
                localRun: "",
                defectId: [],
                errorMessage: errorMessage,
              } as CsvData;

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

    csvData.push(dataTestCase);
    updateCsvToInsertNextLine(csvData);
    updateCsvToInsertNextLine(csvData);
    updateCsvToInsertNextLine(csvData);
    updateCsvToInsertNextLine(csvData);
  });

  return csvData;
}

function updateCsvToInsertAllDataPerModule(csvData : CsvData[], jiraConvertData : JiraConvertData[])
{
  csvData.forEach((element) => {
    const getDataMatchModuleName = jiraConvertData.filter(
      (x) => x.appsModules === element.moduleName && x.tcId === element.title,
    );

    if (getDataMatchModuleName.length > 0) {
      if (!Array.isArray(element.defectId)) {
        element.defectId = [];
      }
      getDataMatchModuleName.forEach((moduleName) => {
        if (Array.isArray(element.defectId)) {
          element.defectId.push(moduleName.defectId ?? "");
        }
      });
    } else {
      element.defectId = "";
    }
  });
}

function updateCsvToFindTotalFailPerPerson(csvData : CsvData[])
{

  const countUpdatedBy = [] as CountUpdatedBy[]
  csvData.forEach(element => {

    if(element.updatedBy === "") return;

    const findUser = countUpdatedBy.find((x) => x.name === element.updatedBy);
    if(!findUser)
    {
      countUpdatedBy.push({ count : 1, name : element.updatedBy })
    }else
    {
      const currentCount = findUser.count ?? 0;
      const updateCount = currentCount + 1;
      findUser.count = updateCount;
    }
  });

  const title = {
    moduleName: "",
    title: "",
    updatedBy: "",
    defectRefactorDependentPassedInLocal: "Total fail per/person",
    reason: "",
    actionItem: "",
    action: "",
    localRun: "",
    defectId: "",
    errorMessage: "",
  };
  csvData.push(title);

  const title2 = {
    moduleName: "",
    title: "",
    updatedBy: "",
    defectRefactorDependentPassedInLocal: "Name",
    reason: "Total",
    actionItem: "",
    action: "",
    localRun: "",
    defectId: "",
    errorMessage: "",
  };
  csvData.push(title2);

  countUpdatedBy.forEach(element => {
    const countDataCsv = {
      moduleName: "",
      title: "",
      updatedBy: "",
      defectRefactorDependentPassedInLocal: element.name,
      reason: element?.count?.toString() ?? "",
      actionItem: "",
      action: "",
      localRun: "",
      defectId: "",
      errorMessage: "",
    };
    
    csvData.push(countDataCsv);
  });
}


function updateCsvToInsertNextLine(csvData : CsvData[])
{
  const empty = {
    moduleName: "",
    title: "",
    updatedBy: "",
    defectRefactorDependentPassedInLocal: "",
    reason: "",
    actionItem: "",
    action: "",
    localRun: "",
    defectId: "",
    errorMessage: "",
  };
  csvData.push(empty);
}