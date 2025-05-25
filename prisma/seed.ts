import { PrismaClient, PermissionList, ClaimCategory } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.group.deleteMany();

  const allPermissions = Object.values(PermissionList);

  let int = 0;
  for (const perm of allPermissions) {
    await prisma.permission.create({
      data: {
        id: int,
        permission: perm,
      },
    });
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
        connect: [{ id: 0 }, { id: 1 }],
      },
    },
  });

  await prisma.group.create({
    data: {
      id: "BANNED_USER",
      permission: {
        connect: [],
      },
    },
  });

  // await prisma.user.create({
  //   data: {
  //     name: "sample user",
  //     email: "sample@email.com",
  //     hashed_password: "$2a$12$twZYpoyxc8zHfoO3HE.pTOwMf8Y05OzrmxLYD80aXqvOVknUvBV3W", //Sample@123
  //     group: {
  //       connect: {
  //         id: "STAFF",
  //       },
  //     },
  //   },
  // });

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
        createMany: {
          data: [
            {
              value: 100,
              claimCategory: ClaimCategory.CATEGORY_1,
            },
            {
              value: 200,
              claimCategory: ClaimCategory.CATEGORY_2,
            },
            {
              value: 300,
              claimCategory: ClaimCategory.CATEGORY_3,
            },
          ],
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
