import React from 'react'
import { checkPagePermission } from '~/lib/permissions/check-page-permission';    
import { PermissionList } from '@prisma/client';

const page = async () => {
  await checkPagePermission(PermissionList.ADMIN);
  
  return (
    <div>page</div>
  )
}

export default page