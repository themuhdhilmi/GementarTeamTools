import React from 'react'
import { checkPagePermission } from '~/lib/permissions/check-page-permission';    
import { PermissionList } from '@prisma/client';

const page = async () => {
  await checkPagePermission(PermissionList.PAGE_PERMISSION_GROUP_SETTINGS);
  
  return (
    <div>page</div>
  )
}

export default page