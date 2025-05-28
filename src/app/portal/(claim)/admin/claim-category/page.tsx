import React from 'react'
import { checkPagePermission } from '~/lib/permissions/check-page-permission';
import { PermissionList } from '@prisma/client';

const page = async () => {
  await checkPagePermission(PermissionList.PAGE_PERMISSION_CLAIM_CATEGORY);
  
  return (
    <div>page</div>
  )
}

export default page