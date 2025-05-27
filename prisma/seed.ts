import { PrismaClient, PermissionList } from "@prisma/client";
const prisma = new PrismaClient();

async function generateMultipleUsers(count: number) {
  const groups = ["STAFF", "MANAGER", "EXECUTIVE", "HR", "FINANCE", "ADMIN", "STAFF_ADMIN", "DEACTIVATED_USER"] as const;
  const firstNames = ["Ahmad", "Siti", "John", "Sarah", "Raj", "Mei", "Ali", "Fatimah", "David", "Lisa"] as const;
  const lastNames = ["Abdullah", "Tan", "Kumar", "Wong", "Singh", "Lee", "Ibrahim", "Ng", "Patel", "Lim"] as const;
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]!;
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]!;
    const randomGroup = groups[Math.floor(Math.random() * groups.length)]!;
    
    await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`,
        group: {
          connect: {
            id: randomGroup
          }
        },
        hashed_password: "$2a$12$twZYpoyxc8zHfoO3HE.pTOwMf8Y05OzrmxLYD80aXqvOVknUvBV3W", //Sample@123
      },
    });
  }
}

async function main() {
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.group.deleteMany();
  await prisma.assignedClaim.deleteMany();
  await prisma.claimCategory.deleteMany();


  const allPermissions = Object.values(PermissionList);

  let int = 0; const connectPermissions = [];
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

  await prisma.group.create({
    data: {
      id: "ADMIN",
      permission: {
        connect: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
      },
    },
  });

  await prisma.group.create({
    data: {
      id: "STAFF_ADMIN",
      permission: {
        connect: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
      },
    },
  });

  await prisma.group.create({
    data: {
      id: "STAFF",
      permission: {
        connect: connectPermissions
      },
    },
  });

  await prisma.group.create({
    data: {
      id: "MANAGER",
      permission: {
        connect: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id : 4}, { id : 5}, { id : 6}, { id : 7}, { id : 8}, { id : 9}],
      },
    },
  });

  await prisma.group.create({
    data: {
      id: "EXECUTIVE",
      permission: {
        connect: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id : 4}, { id : 5}, { id : 6}, { id : 7}, { id : 8}, { id : 9}],
      },
    },
  });

  await prisma.group.create({
    data: {
      id: "HR",
      permission: {
        connect: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id : 4}, { id : 5}, { id : 6}, { id : 7}, { id : 8}, { id : 9}],
      },
    },
  });

  await prisma.group.create({
    data: {
      id: "FINANCE",
      permission: {
        connect: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id : 4}, { id : 5}, { id : 6}, { id : 7}, { id : 8}, { id : 9}],
      },
    },
  });

  await prisma.group.create({
    data: {
      id: "DEACTIVATED_USER",
      permission: {
        connect: [],
      },
    },
  });

  await prisma.claimCategory.createMany({
    data: [
      {
        name: "Category 1",
      },
      {
        name: "Category 2",
      },
      {
        name: "Category 3",
      },
      {
        name: "Category 4",
      },
    ],
  });

  const claimCategories = await prisma.claimCategory.findMany();
  
  if (claimCategories.length === 0) {
    throw new Error("No claim categories found in database");
  }

  const firstCategory = claimCategories[0]!; // Non-null assertion operator
  const secondCategory = claimCategories[1]!; // Non-null assertion operator
  const thirdCategory = claimCategories[2]!; // Non-null assertion operator
  const fourthCategory = claimCategories[3]!; // Non-null assertion operator

  await prisma.user.upsert({
    where: {
      email: "sample@email.com",
    },
    create: {
      name: "sample user",
      email: "sample@email.com",
      groupId: "STAFF",
      hashed_password: "$2a$12$twZYpoyxc8zHfoO3HE.pTOwMf8Y05OzrmxLYD80aXqvOVknUvBV3W", //Sample@123
      assignedClaim: {
        create: [
          {
            value: 1000,
            year: 2025,
            claimCategoryId: firstCategory.id,
          },
          {
            value: 12000,
            year: 2025,
            perClaimLimit: 1000,
            claimCategoryId: secondCategory.id,
          },
          {
            value: 15000,
            year: 2025,
            perClaimLimit: 1000,
            claimCategoryId: thirdCategory.id,
          },
          {
            value: 11000,
            year: 2025,
            isCustomDate: true,
            dateStart: new Date("2025-01-01"),
            dateEnd: new Date("2025-01-31"),
            claimCategoryId: fourthCategory.id,
            requestedClaim: {
              create: [
                {
                  value: 500,
                  status: "PENDING"
                },
                {
                  value: 750,
                  status: "APPROVED"
                },
                {
                  value: 150,
                  status: "APPROVED"
                },
                {
                  value: 1000,
                  status: "REJECTED"
                }
              ]
            }
          }
        ]
      },
    },
    update: {},
  });

  await generateMultipleUsers(9214);
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
