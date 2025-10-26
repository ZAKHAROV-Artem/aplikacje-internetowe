-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'COMPANY_MANAGER', 'USER');

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "payload" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "customerId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeliveryAppSettings" (
    "id" TEXT NOT NULL,
    "magnoliCustomerId" TEXT NOT NULL,
    "deliveryAppUrl" TEXT NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryAppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "managerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "companyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Home',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Route" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zipCodes" TEXT[],
    "weekdays" TEXT[],
    "startTimeMins" INTEGER NOT NULL,
    "endTimeMins" INTEGER NOT NULL,
    "pricelistId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PickupRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "locationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "dropoffDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_id_idx" ON "public"."Event"("id");

-- CreateIndex
CREATE INDEX "Event_customerId_idx" ON "public"."Event"("customerId");

-- CreateIndex
CREATE INDEX "EmailOtp_email_idx" ON "public"."EmailOtp"("email");

-- CreateIndex
CREATE INDEX "EmailOtp_expiresAt_idx" ON "public"."EmailOtp"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAppSettings_magnoliCustomerId_key" ON "public"."DeliveryAppSettings"("magnoliCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAppSettings_deliveryAppUrl_key" ON "public"."DeliveryAppSettings"("deliveryAppUrl");

-- CreateIndex
CREATE INDEX "DeliveryAppSettings_magnoliCustomerId_idx" ON "public"."DeliveryAppSettings"("magnoliCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "public"."Company"("name");

-- CreateIndex
CREATE INDEX "Company_managerId_idx" ON "public"."Company"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "public"."User"("companyId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "Location_userId_idx" ON "public"."Location"("userId");

-- CreateIndex
CREATE INDEX "Location_zip_idx" ON "public"."Location"("zip");

-- CreateIndex
CREATE INDEX "Route_companyId_idx" ON "public"."Route"("companyId");

-- CreateIndex
CREATE INDEX "Route_active_idx" ON "public"."Route"("active");

-- CreateIndex
CREATE INDEX "PickupRequest_userId_idx" ON "public"."PickupRequest"("userId");

-- CreateIndex
CREATE INDEX "PickupRequest_routeId_idx" ON "public"."PickupRequest"("routeId");

-- CreateIndex
CREATE INDEX "PickupRequest_companyId_idx" ON "public"."PickupRequest"("companyId");

-- CreateIndex
CREATE INDEX "PickupRequest_status_idx" ON "public"."PickupRequest"("status");

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Route" ADD CONSTRAINT "Route_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickupRequest" ADD CONSTRAINT "PickupRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickupRequest" ADD CONSTRAINT "PickupRequest_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickupRequest" ADD CONSTRAINT "PickupRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickupRequest" ADD CONSTRAINT "PickupRequest_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
