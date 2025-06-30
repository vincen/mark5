/*
  Warnings:

  - You are about to drop the column `image` on the `mark5_book` table. All the data in the column will be lost.
  - You are about to drop the `_BookAuthors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BookTranslators` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `imageUrl` to the `mark5_book` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_BookAuthors" DROP CONSTRAINT "_BookAuthors_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookAuthors" DROP CONSTRAINT "_BookAuthors_B_fkey";

-- DropForeignKey
ALTER TABLE "_BookTranslators" DROP CONSTRAINT "_BookTranslators_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookTranslators" DROP CONSTRAINT "_BookTranslators_B_fkey";

-- AlterTable
ALTER TABLE "mark5_book" DROP COLUMN "image",
ADD COLUMN     "imageUrl" TEXT NOT NULL;

-- DropTable
DROP TABLE "_BookAuthors";

-- DropTable
DROP TABLE "_BookTranslators";

-- CreateTable
CREATE TABLE "mark5_book_author" (
    "bookId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "mark5_book_author_pkey" PRIMARY KEY ("bookId","authorId")
);

-- CreateTable
CREATE TABLE "mark5_book_translator" (
    "bookId" INTEGER NOT NULL,
    "translatorId" INTEGER NOT NULL,

    CONSTRAINT "mark5_book_translator_pkey" PRIMARY KEY ("bookId","translatorId")
);

-- AddForeignKey
ALTER TABLE "mark5_book_author" ADD CONSTRAINT "mark5_book_author_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "mark5_book"("pkid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark5_book_author" ADD CONSTRAINT "mark5_book_author_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "mark5_author"("pkid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark5_book_translator" ADD CONSTRAINT "mark5_book_translator_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "mark5_book"("pkid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark5_book_translator" ADD CONSTRAINT "mark5_book_translator_translatorId_fkey" FOREIGN KEY ("translatorId") REFERENCES "mark5_author"("pkid") ON DELETE RESTRICT ON UPDATE CASCADE;
