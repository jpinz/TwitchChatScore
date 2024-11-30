-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "value" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_username_key" ON "Chat"("username");
