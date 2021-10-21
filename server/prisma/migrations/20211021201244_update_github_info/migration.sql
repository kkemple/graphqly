/*
  Warnings:

  - You are about to drop the column `repoUrl` on the `Project` table. All the data in the column will be lost.
  - Added the required column `apolloKey` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repoId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "repoUrl",
ADD COLUMN     "apolloKey" TEXT NOT NULL,
ADD COLUMN     "repoId" TEXT NOT NULL;
