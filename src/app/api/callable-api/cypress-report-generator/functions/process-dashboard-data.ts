import { type MochaDataAPI } from "../route";

export function getDashboardData(mochaData: MochaDataAPI[]) {

  const statsPerModule = mochaData.map((module) => {

    const totalSuites = module.upload.reduce((acc, curr) => acc + (curr.stats?.suites ?? 0), 0);
    const totalTests = module.upload.reduce((acc, curr) => acc + (curr.stats?.tests ?? 0), 0);
    const totalPassed = module.upload.reduce((acc, curr) => acc + (curr.stats?.passes ?? 0), 0);
    const totalFailed = module.upload.reduce((acc, curr) => acc + (curr.stats?.failures ?? 0), 0);
    const totalPending = module.upload.reduce((acc, curr) => acc + (curr.stats?.pending ?? 0), 0);
    const totalSkipped = module.upload.reduce((acc, curr) => acc + (curr.stats?.skipped ?? 0), 0);
    const totalDuration = module.upload.reduce((acc, curr) => acc + (curr.stats?.duration ?? 0), 0);

    return {
      moduleName: module.module,
      totalSuites,
      totalTests,
      totalPassed,
      totalFailed,
      totalPending,
      totalSkipped,
      totalDuration,
    };
  });

  const statsModuleTotal = statsPerModule.reduce(
    (acc, curr) => {
      return {
        totalSuites: acc.totalSuites + curr.totalSuites,
        totalTests: acc.totalTests + curr.totalTests,
        totalPassed: acc.totalPassed + curr.totalPassed,
        totalFailed: acc.totalFailed + curr.totalFailed,
        totalPending: acc.totalPending + curr.totalPending,
        totalSkipped: acc.totalSkipped + curr.totalSkipped,
        totalDuration: acc.totalDuration + curr.totalDuration,
      };
    },
    {
      totalSuites: 0,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalPending: 0,
      totalSkipped: 0,
      totalDuration: 0,
    },
  );
  const statsPerPath = getDashboardDataPerPath(mochaData, "kl");
  const statsPerPathPerModule = getDashboardDataPerPathPerModule(mochaData, "kl");

  return {
    statsPerModule,
    statsModuleTotal,
    statsPerPath,
    statsPerPathPerModule,
  };
}

function getDashboardDataPerPath(mochaData: MochaDataAPI[], path: string) {
  const filteredResults = mochaData.flatMap((module) =>
    module.upload.flatMap(
      (uploadData) =>
        uploadData.results?.filter((result) =>
          result.fullFile?.includes(`src\\e2e\\${path}`),
        ) ?? [],
    ),
  );

  let totalSuites = 0;
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalPending = 0;
  let totalSkipped = 0;

  filteredResults.forEach((result) => {
    result.suites?.forEach((suite) => {
      suite.tests?.forEach((test) => {
        totalSuites += 1;
        totalTests += 1;
        totalPassed += test.state === "passed" ? 1 : 0;
        totalFailed += test.state === "failed" ? 1 : 0;
        totalPending += test.pending === true ? 1 : 0;
        totalSkipped += test.skipped === true ? 1 : 0;
      });
    });
  });

  return {
    path,
    totalSuites,
    totalTests,
    totalPassed,
    totalFailed,
    totalPending,
    totalSkipped,
  };
}

function getDashboardDataPerPathPerModule(mochaData: MochaDataAPI[], path: string) {
  const statsPerModule = mochaData.map((module) => {
    const filteredResults = module.upload.flatMap(
      (uploadData) =>
        uploadData.results?.filter((result) =>
          result.fullFile?.includes(`src\\e2e\\${path}`),
        ) ?? [],
    );

    let totalSuites = 0;
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalPending = 0;
    let totalSkipped = 0;

    filteredResults.forEach((result) => {
      result.suites?.forEach((suite) => {
        suite.tests?.forEach((test) => {
          totalSuites += 1;
          totalTests += 1;
          totalPassed += test.state === "passed" ? 1 : 0;
          totalFailed += test.state === "failed" ? 1 : 0;
          totalPending += test.pending === true ? 1 : 0;
          totalSkipped += test.skipped === true ? 1 : 0;
        });
      });
    });

    return {
      moduleName: module.module,
      path,
      totalSuites,
      totalTests,
      totalPassed,
      totalFailed,
      totalPending,
      totalSkipped,
    };
  });

  return statsPerModule;
}

