import { PrismaClient, PermissionList } from "@prisma/client";
import { faker } from "@faker-js/faker";
const prisma = new PrismaClient();

async function generateMultipleUsers(count: number) {
  const groups = ["ADMIN", "USER"] as const;
  const projectIds = ["0", "1", "2"] as const;

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const randomProject =
      projectIds[Math.floor(Math.random() * projectIds.length)]!;
    const randomGroup = groups[Math.floor(Math.random() * groups.length)]!;

    await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }),
        group: {
          connect: {
            id: randomGroup,
          },
        },
        projects: {
          connect: {
            id: randomProject,
          },
        },
        hashed_password:
          "$2a$12$twZYpoyxc8zHfoO3HE.pTOwMf8Y05OzrmxLYD80aXqvOVknUvBV3W", //Sample@123
      },
    });
  }
}

async function generateResultsForProjects() {
  const projects = await prisma.project.findMany();
  
  for (const project of projects) {
    // Generate 5-10 results per project
    const resultCount = faker.number.int({ min: 5, max: 10 });
    
    for (let i = 0; i < resultCount; i++) {
      await prisma.result.create({
        data: {
          name: `Test Result ${i + 1} - ${faker.word.words(3)}`,
          projectId: project.id,
          date: faker.date.recent({ days: 30 }),
          data: {
            status: faker.helpers.arrayElement(["passed", "failed", "pending"]),
            duration: faker.number.int({ min: 1000, max: 60000 }),
            tests: faker.number.int({ min: 10, max: 100 }),
            suites: faker.number.int({ min: 1, max: 10 })
          },
          s3Files: {
            create: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
              fileName: `${faker.system.fileName()}.json`,
              remark: faker.helpers.maybe(() => faker.lorem.sentence()),
              bucketName: "test-bucket",
              contentType: "application/json",
              fileUrl: faker.internet.url()
            }))
          }
        }
      });
    }
  }
}

async function main() {
  await prisma.result.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.group.deleteMany();
  await prisma.project.deleteMany();

  // Create permissions
  const allPermissions = Object.values(PermissionList);
  let int = 0;
  const connectPermissions = [];
  for (const perm of allPermissions) {
    await prisma.permission.create({
      data: {
        id: int,
        permission: perm,
      },
    });
    connectPermissions.push({ id: int });
    int++;
  }

  // Create groups
  await prisma.group.create({
    data: {
      id: "ADMIN",
      name: "Admin",
      permission: {
        connect: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
      },
    },
  });

  await prisma.group.create({
    data: {
      id: "USER",
      name: "User",
      permission: {
        connect: connectPermissions,
      },
    },
  });

  await prisma.group.create({
    data: {
      id: "BANNED",
      name: "Banned",
      permission: {
        connect: [],
      },
    },
  });

  // Create projects
  await prisma.project.createMany({
    data: [
      {
        id: "0",
        name: "UAT2",
      },
      {
        id: "1",
        name: "AD SERVING",
      },
      {
        id: "2",
        name: "DEV",
      }
    ],
  });

  // Generate users after all necessary records exist
  await generateMultipleUsers(200);

  // Generate results for each project
  await generateResultsForProjects();

  // Create sample user last
  const firstProject = await prisma.project.findFirst();
  if (!firstProject) {
    throw new Error("No project found in database");
  }

  await prisma.user.upsert({
    where: {
      email: "sample@email.com",
    },
    create: {
      name: "sample user",
      email: "sample@email.com",
      groupId: "USER",
      hashed_password:
        "$2a$12$twZYpoyxc8zHfoO3HE.pTOwMf8Y05OzrmxLYD80aXqvOVknUvBV3W", //Sample@123
      projects: {
        connect: {
          id: firstProject.id,
        },
      },
    },
    update: {},
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    if (e instanceof Error) {
      console.error("Error creating permission:", e.message);
    } else {
      console.error("Unknown error:", e);
    }
    await prisma.$disconnect();
    process.exit(1);
  });
