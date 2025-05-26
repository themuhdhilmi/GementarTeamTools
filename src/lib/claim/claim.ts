import { PrismaClient, PermissionList, AssignedClaim, RequestedClaim } from "@prisma/client";
const prisma = new PrismaClient();

interface AssignedClaimWithTotal extends AssignedClaim {
    totalApproved: number;
    totalApprovedCount: number;
    claimCategory: {
        id: string;
        name: string;
    };
}

export async function getUserClaimsByYear(userEmail : string | null | undefined, year : number) : Promise<AssignedClaimWithTotal[]>
{
    if (!userEmail) {
        throw new Error("Email doesn't exist");
    }

    const assignedClaims = await prisma.assignedClaim.findMany({
        where: {
            year: year,
            user: {
                email: userEmail,
            }
        },
        include: {
            user: true,
            requestedClaim: {
                where: {
                    status: 'APPROVED'
                }
            },
            claimCategory: true,
        }
    });

    if (!assignedClaims) {
        throw new Error("User not found");
    }

    // Calculate total approved claims and count for each assigned claim
    const claimsWithTotal: AssignedClaimWithTotal[] = assignedClaims.map(claim => ({
        ...claim,
        user: claim.user ? {
            id: claim.user.id,
            name: claim.user.name,
            email: claim.user.email,
            groupId: claim.user.groupId
        } : null,
        requestedClaim: claim.requestedClaim.map(claim => ({
            id: claim.id,
            value: claim.value,
            status: claim.status
        })),
        totalApproved: claim.requestedClaim.reduce((sum: number, req: RequestedClaim) => sum + req.value, 0),
        totalApprovedCount: claim.requestedClaim.length
    }));

    console.log(JSON.stringify(claimsWithTotal));

    return claimsWithTotal;
}
