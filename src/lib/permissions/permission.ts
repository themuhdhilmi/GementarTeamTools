import { PrismaClient, PermissionList } from "@prisma/client";
const prisma = new PrismaClient();

export async function getUserPermissions(userEmail : string | null | undefined) : Promise<PermissionList[]>
{
    if (!userEmail) {
        throw new Error("Email doesn't exist");
    }

    const user = await prisma.user.findUnique({
        where: {
            email: userEmail,
        },
        include: {
            group: {
                include: {
                    permission: true,
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user.group.permission.map((perm) => perm.permission);
}

export async function isUserHasPermission(userEmail : string | null | undefined, permission : PermissionList) : Promise<boolean>
{
    const permissions = await getUserPermissions(userEmail);
    return permissions.includes(permission);
}

export async function getUserGroup(userEmail : string | null | undefined) : Promise<string>
{
    if (!userEmail) {
        throw new Error("Email doesn't exist");
    }

    const user = await prisma.user.findUnique({
        where: {
            email: userEmail,
        },
        include: {
            group: {
                include: {
                    permission: true,
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user.group.id;
}

export async function isAdminOrSelf(userEmail : string | null | undefined, targetEmail : string | null | undefined) : Promise<boolean>
{
    if (!userEmail) {
        throw new Error("Email doesn't exist");
    }

    const user = await prisma.user.findUnique({
        where: {
            email: userEmail,
        },
        include: {
            group: {
                include: {
                    permission: true,
                }
            }
        }
    });

    if(!user) {
        throw new Error("User not found");
    }

    if(user.group.id === "ADMIN") {
        return true;
    }

    return user.email === targetEmail;
}
