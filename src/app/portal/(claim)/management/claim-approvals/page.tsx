import { PermissionList } from '@prisma/client';
import React from 'react'
import { checkPagePermission } from '~/lib/permissions/check-page-permission';

const page = async () => {
  await checkPagePermission(PermissionList.PAGE_PERMISSION_CLAIM_APPROVALS);
  
  return (
    <div>page</div>
  )
}

export default page