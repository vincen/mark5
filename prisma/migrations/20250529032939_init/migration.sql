-- CreateTable
CREATE TABLE "mark5_user" (
    "pkid" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "mark5_user_pkey" PRIMARY KEY ("pkid")
);
