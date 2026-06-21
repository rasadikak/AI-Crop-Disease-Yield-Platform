-- CreateTable
CREATE TABLE "chatMessage" (
    "id" SERIAL NOT NULL,
    "farmerId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chatMessage" ADD CONSTRAINT "chatMessage_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
