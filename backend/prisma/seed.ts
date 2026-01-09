import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Real names for realistic data
const realNames = [
  { firstName: "James", lastName: "Wilson" },
  { firstName: "Sarah", lastName: "Johnson" },
  { firstName: "Michael", lastName: "Brown" },
  { firstName: "Emily", lastName: "Davis" },
  { firstName: "David", lastName: "Miller" },
  { firstName: "Jessica", lastName: "Garcia" },
  { firstName: "Christopher", lastName: "Martinez" },
  { firstName: "Ashley", lastName: "Anderson" },
  { firstName: "Matthew", lastName: "Taylor" },
  { firstName: "Amanda", lastName: "Thomas" },
  { firstName: "Joshua", lastName: "Hernandez" },
  { firstName: "Jennifer", lastName: "Moore" },
  { firstName: "Daniel", lastName: "Martin" },
  { firstName: "Lisa", lastName: "Jackson" },
  { firstName: "Andrew", lastName: "Thompson" },
  { firstName: "Michelle", lastName: "White" },
  { firstName: "Ryan", lastName: "Harris" },
  { firstName: "Kimberly", lastName: "Sanchez" },
  { firstName: "Kevin", lastName: "Clark" },
  { firstName: "Angela", lastName: "Ramirez" },
];

const companyNames = ["TechCorp Solutions"];

const routeNames = [
  "Downtown Express Route",
  "University Campus Route",
  "Business District Route",
  "Residential North Route",
  "Airport Shuttle Route",
];

const zipCodes = [
  "10001",
  "10002",
  "10003",
  "10004",
  "10005",
  "20001",
  "20002",
  "20003",
  "20004",
  "20005",
  "30001",
  "30002",
  "30003",
  "30004",
  "30005",
  "40001",
  "40002",
  "40003",
  "40004",
  "40005",
  "50001",
  "50002",
  "50003",
  "50004",
  "50005",
];

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const statuses = [
  "PENDING",
  "CONFIRMED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

const addresses = [
  "123 Main Street",
  "456 Oak Avenue",
  "789 Pine Road",
  "321 Elm Street",
  "654 Maple Drive",
  "987 Cedar Lane",
  "147 Birch Street",
  "258 Spruce Avenue",
  "369 Willow Road",
  "741 Poplar Street",
];

const cities = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
];

const states = ["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "CA"];

async function main() {
  console.log("Seeding database with comprehensive data...");

  const commonPassword = "123456";
  const hashedCommonPassword = await bcrypt.hash(commonPassword, 10);

  // Create admin user - can manage everything
  const adminEmail = "admin@mail.com";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      email: adminEmail,
      password: hashedCommonPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      password: hashedCommonPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", admin.email);

  // Create second admin user
  const admin2Email = "szakharovartem@gmail.com";
  const admin2 = await prisma.user.upsert({
    where: { email: admin2Email },
    update: {
      email: admin2Email,
      password: hashedCommonPassword,
      firstName: "Artem",
      lastName: "Szakharov",
      role: "ADMIN",
    },
    create: {
      email: admin2Email,
      password: hashedCommonPassword,
      firstName: "Artem",
      lastName: "Szakharov",
      role: "ADMIN",
    },
  });

  console.log("Second admin user created:", admin2.email);

  // Create manager user first (needed for company creation)
  const managerEmail = "manager@mail.com";
  const manager = await prisma.user.upsert({
    where: { email: managerEmail },
    update: {
      email: managerEmail,
      password: hashedCommonPassword,
      firstName: "Manager",
      lastName: "User",
      role: "COMPANY_MANAGER",
    },
    create: {
      email: managerEmail,
      password: hashedCommonPassword,
      firstName: "Manager",
      lastName: "User",
      role: "COMPANY_MANAGER",
    },
  });

  // Create company for manager
  const companyName = companyNames[0];
  const company = await prisma.company.upsert({
    where: { name: companyName },
    update: {
      name: companyName,
      description: `${companyName} - Professional delivery and logistics services`,
      managerId: manager.id,
    },
    create: {
      name: companyName,
      description: `${companyName} - Professional delivery and logistics services`,
      managerId: manager.id,
    },
  });

  // Update admin users with companyId so they can create pickup requests
  await prisma.user.update({
    where: { id: admin.id },
    data: {
      companyId: company.id,
    },
  });

  await prisma.user.update({
    where: { id: admin2.id },
    data: {
      companyId: company.id,
    },
  });

  // Update manager with companyId so they can create pickup requests
  await prisma.user.update({
    where: { id: manager.id },
    data: {
      companyId: company.id,
    },
  });

  console.log("Manager user created:", manager.email);

  console.log(
    `Company created: ${company.name} with manager: ${manager.email}`
  );

  // Create location for admin user
  const existingAdminLocation = await prisma.location.findFirst({
    where: {
      userId: admin.id,
      name: "Home",
    },
  });

  if (existingAdminLocation) {
    await prisma.location.update({
      where: { id: existingAdminLocation.id },
      data: {
        address: addresses[0],
        city: cities[0],
        state: states[0],
        zip: zipCodes[0],
        isDefault: true,
      },
    });
  } else {
    await prisma.location.create({
      data: {
        userId: admin.id,
        name: "Home",
        address: addresses[0],
        city: cities[0],
        state: states[0],
        zip: zipCodes[0],
        isDefault: true,
      },
    });
  }

  // Create location for manager user
  const existingManagerLocation = await prisma.location.findFirst({
    where: {
      userId: manager.id,
      name: "Home",
    },
  });

  if (existingManagerLocation) {
    await prisma.location.update({
      where: { id: existingManagerLocation.id },
      data: {
        address: addresses[1],
        city: cities[1],
        state: states[1],
        zip: zipCodes[1],
        isDefault: true,
      },
    });
  } else {
    await prisma.location.create({
      data: {
        userId: manager.id,
        name: "Home",
        address: addresses[1],
        city: cities[1],
        state: states[1],
        zip: zipCodes[1],
        isDefault: true,
      },
    });
  }

  console.log("Created locations for admin and manager users");

  // Create regular users (clients) - can see only own orders, update info, new etc pages
  const users: any[] = [];
  const totalUsers = 10; // 10 regular users

  for (let j = 0; j < totalUsers; j++) {
    const userName = realNames[j];
    const userEmail = `user${j + 1}@mail.com`;

    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        email: userEmail,
        password: hashedCommonPassword,
        firstName: userName.firstName,
        lastName: userName.lastName,
        role: "USER",
        companyId: company.id,
      },
      create: {
        email: userEmail,
        password: hashedCommonPassword,
        firstName: userName.firstName,
        lastName: userName.lastName,
        role: "USER",
        companyId: company.id,
      },
    });

    users.push(user);
  }

  console.log(`Created ${users.length} regular users`);

  // Create locations for users
  const locations: any[] = [];
  for (const user of users) {
    const numLocations = Math.floor(Math.random() * 3) + 1; // 1-3 locations per user

    for (let i = 0; i < numLocations; i++) {
      const address = addresses[Math.floor(Math.random() * addresses.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const zip = zipCodes[Math.floor(Math.random() * zipCodes.length)];

      const location = await prisma.location.create({
        data: {
          userId: user.id,
          name: i === 0 ? "Home" : `Location ${i + 1}`,
          address,
          city,
          state,
          zip,
          isDefault: i === 0,
        },
      });

      locations.push(location);
    }
  }

  console.log(`Created ${locations.length} user locations`);

  // Create routes for the company
  const routes: any[] = [];
  const numRoutes = 5; // 5 routes for the single company

  // Helper function to convert minutes to AM/PM format
  const minutesToTime = (minutes: number): string => {
    const hours24 = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hour12 =
      hours24 === 0
        ? 12
        : hours24 > 12
        ? hours24 - 12
        : hours24 === 12
        ? 12
        : hours24;
    const ampm = hours24 < 12 ? "AM" : "PM";
    return `${hour12}:${mins.toString().padStart(2, "0")} ${ampm}`;
  };

  for (let j = 0; j < numRoutes; j++) {
    const routeName = routeNames[j]; // Use all route names
    const routeZipCodes = zipCodes.slice(0, Math.floor(Math.random() * 5) + 3); // 3-7 zip codes
    const routeWeekdays = weekdays.slice(0, Math.floor(Math.random() * 3) + 3); // 3-5 weekdays
    const startTimeMins = 480 + Math.floor(Math.random() * 240); // 8:00 AM to 12:00 PM
    const endTimeMins = startTimeMins + 480 + Math.floor(Math.random() * 240); // 8-12 hours later
    const startTime = minutesToTime(startTimeMins);
    const endTime = minutesToTime(endTimeMins);

    const route = await prisma.route.create({
      data: {
        companyId: company.id,
        name: `${routeName} - ${company.name}`,
        zipCodes: routeZipCodes,
        weekdays: routeWeekdays,
        startTime: startTime,
        endTime: endTime,
        active: true,
      },
    });

    routes.push(route);
  }

  console.log(`Created ${routes.length} routes`);

  // Create pickup requests (100 requests for better testing)
  const pickupRequests: any[] = [];
  const now = new Date();

  for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const userLocations = locations.filter((loc) => loc.userId === user.id);
    const userRoutes = routes.filter(
      (route) => route.companyId === user.companyId
    );

    if (userLocations.length === 0 || userRoutes.length === 0) continue;

    const location =
      userLocations[Math.floor(Math.random() * userLocations.length)];
    const route = userRoutes[Math.floor(Math.random() * userRoutes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Create dates spread across past and future (60 days range: 30 days ago to 30 days ahead)
    const daysOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
    const pickupDate = new Date(
      now.getTime() + daysOffset * 24 * 60 * 60 * 1000
    );
    const dropoffDate = new Date(
      pickupDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
    ); // 0-7 days later

    const pickupRequest = await prisma.pickupRequest.create({
      data: {
        userId: user.id,
        routeId: route.id,
        companyId: user.companyId!,
        locationId: location.id,
        status,
        pickupDate,
        dropoffDate,
        notes:
          Math.random() > 0.7
            ? `Special instructions for pickup request ${i + 1}`
            : null,
      },
    });

    pickupRequests.push(pickupRequest);
  }

  console.log(`Created ${pickupRequests.length} pickup requests`);

  // Summary
  console.log("\n=== SEEDING COMPLETED ===");
  console.log(`Admins: ${admin.email}, ${admin2.email}`);
  console.log(`Manager: ${manager.email}`);
  console.log(`Company: ${company.name}`);
  console.log(`Users: ${users.length}`);
  console.log(`Locations: ${locations.length}`);
  console.log(`Routes: ${routes.length}`);
  console.log(`Pickup Requests: ${pickupRequests.length}`);

  console.log("\n=== LOGIN CREDENTIALS ===");
  console.log("All passwords are set to: 123456");
  console.log("\nAdmins (can manage everything):");
  console.log(`  1. Email: ${admin.email}`);
  console.log(`  2. Email: ${admin2.email}`);

  console.log("\nManager (can manage routes only):");
  console.log(`  Email: ${manager.email}`);

  console.log(
    "\nRegular Users (can see only own orders, update info, new etc pages):"
  );
  users.slice(0, 5).forEach((user, i) => {
    console.log(`  ${i + 1}. Email: ${user.email}`);
  });
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
