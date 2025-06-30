-- CreateTable
CREATE TABLE "mark5_book" (
    "pkid" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "edition" TEXT NOT NULL,
    "printing" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "remark" TEXT,
    "publisherId" INTEGER NOT NULL,

    CONSTRAINT "mark5_book_pkey" PRIMARY KEY ("pkid")
);

-- CreateTable
CREATE TABLE "mark5_author" (
    "pkid" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "birthDate" TIMESTAMP(3),
    "deathDate" TIMESTAMP(3),
    "introduction" TEXT,

    CONSTRAINT "mark5_author_pkey" PRIMARY KEY ("pkid")
);

-- CreateTable
CREATE TABLE "mark5_publisher" (
    "pkid" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "mark5_publisher_pkey" PRIMARY KEY ("pkid")
);

-- CreateTable
CREATE TABLE "_BookAuthors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BookAuthors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BookTranslators" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BookTranslators_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "mark5_book_isbn_key" ON "mark5_book"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "mark5_publisher_name_key" ON "mark5_publisher"("name");

-- CreateIndex
CREATE INDEX "_BookAuthors_B_index" ON "_BookAuthors"("B");

-- CreateIndex
CREATE INDEX "_BookTranslators_B_index" ON "_BookTranslators"("B");

-- AddForeignKey
ALTER TABLE "mark5_book" ADD CONSTRAINT "mark5_book_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "mark5_publisher"("pkid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookAuthors" ADD CONSTRAINT "_BookAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "mark5_author"("pkid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookAuthors" ADD CONSTRAINT "_BookAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "mark5_book"("pkid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookTranslators" ADD CONSTRAINT "_BookTranslators_A_fkey" FOREIGN KEY ("A") REFERENCES "mark5_author"("pkid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookTranslators" ADD CONSTRAINT "_BookTranslators_B_fkey" FOREIGN KEY ("B") REFERENCES "mark5_book"("pkid") ON DELETE CASCADE ON UPDATE CASCADE;
