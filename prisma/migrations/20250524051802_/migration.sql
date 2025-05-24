/*
  Warnings:

  - The values [GET_USERS_CLAIMS,GET_SELFS_CLAIMS] on the enum `Permission_permission` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `permission` MODIFY `permission` ENUM('LOGIN', 'LOGOUT', 'REQUEST_CLAIM', 'ASSIGN_CLAIM', 'GET_USER_CLAIMS', 'GET_SELF_CLAIMS') NOT NULL;
