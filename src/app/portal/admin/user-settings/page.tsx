  import React from 'react'
  import { checkPagePermission } from '~/lib/permissions/check-page-permission';
  import { PermissionList } from '@prisma/client';
import { UserTable } from './components/user-table';

const page = async () => {
  await checkPagePermission(PermissionList.PAGE_PERMISSION_USER_SETTINGS);
  
  return (
    <div><UserTable /></div>
  )
}

export default page