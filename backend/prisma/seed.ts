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

  // Create admin user
  const adminEmail = "szakharovartem@gmail.com";
  const adminPassword = "Admin123!";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      email: adminEmail,
      password: hashedAdminPassword,
      firstName: "Artem",
      lastName: "Zakharov",
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      firstName: "Artem",
      lastName: "Zakharov",
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", admin.email);
  console.log("Admin password:", adminPassword);

  // Create companies with managers
  const companies: any[] = [];
  const managers: any[] = [];

  for (let i = 0; i < companyNames.length; i++) {
    const companyName = companyNames[i];
    const managerName = realNames[i];
    const managerEmail = `manager${i + 1}@${companyName
      .toLowerCase()
      .replace(/\s+/g, "")}.com`;
    const hashedManagerPassword = await bcrypt.hash("Manager123!", 10);

    // Create company manager first
    const manager = await prisma.user.upsert({
      where: { email: managerEmail },
      update: {
        email: managerEmail,
        password: hashedManagerPassword,
        firstName: managerName.firstName,
        lastName: managerName.lastName,
        role: "COMPANY_MANAGER",
      },
      create: {
        email: managerEmail,
        password: hashedManagerPassword,
        firstName: managerName.firstName,
        lastName: managerName.lastName,
        role: "COMPANY_MANAGER",
      },
    });

    managers.push(manager);

    // Create company
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

    companies.push(company);
    console.log(
      `Company created: ${company.name} with manager: ${manager.email}`
    );
  }

  // Create regular users (clients) for the company
  const users: any[] = [];
  const userCompany = companies[0]; // Only one company
  const totalUsers = 20; // 20 users for the single company

  for (let j = 0; j < totalUsers; j++) {
    const userName = realNames[j];
    const userEmail = `user${j + 1}@${userCompany.name
      .toLowerCase()
      .replace(/\s+/g, "")}.com`;
    const hashedUserPassword = await bcrypt.hash("User123!", 10);

    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        email: userEmail,
        password: hashedUserPassword,
        firstName: userName.firstName,
        lastName: userName.lastName,
        role: "USER",
        companyId: userCompany.id,
      },
      create: {
        email: userEmail,
        password: hashedUserPassword,
        firstName: userName.firstName,
        lastName: userName.lastName,
        role: "USER",
        companyId: userCompany.id,
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
  const routeCompany = companies[0]; // Only one company
  const numRoutes = 5; // 5 routes for the single company

  for (let j = 0; j < numRoutes; j++) {
    const routeName = routeNames[j]; // Use all route names
    const routeZipCodes = zipCodes.slice(0, Math.floor(Math.random() * 5) + 3); // 3-7 zip codes
    const routeWeekdays = weekdays.slice(0, Math.floor(Math.random() * 3) + 3); // 3-5 weekdays
    const startTime = 480 + Math.floor(Math.random() * 240); // 8:00 AM to 12:00 PM
    const endTime = startTime + 480 + Math.floor(Math.random() * 240); // 8-12 hours later

    const route = await prisma.route.create({
      data: {
        companyId: routeCompany.id,
        name: `${routeName} - ${routeCompany.name}`,
        zipCodes: routeZipCodes,
        weekdays: routeWeekdays,
        startTimeMins: startTime,
        endTimeMins: endTime,
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
  console.log(`Admin: ${admin.email} (password: ${adminPassword})`);
  console.log(`Companies: ${companies.length}`);
  console.log(`Managers: ${managers.length}`);
  console.log(`Users: ${users.length}`);
  console.log(`Locations: ${locations.length}`);
  console.log(`Routes: ${routes.length}`);
  console.log(`Pickup Requests: ${pickupRequests.length}`);

  console.log("\n=== LOGIN CREDENTIALS ===");
  console.log("Admin:");
  console.log(`  Email: ${admin.email}`);
  console.log(`  Password: ${adminPassword}`);

  console.log("\nManager:");
  console.log(`  Email: ${managers[0].email}, Password: Manager123!`);

  console.log("\nSample Users:");
  users.slice(0, 5).forEach((user, i) => {
    console.log(`  ${i + 1}. Email: ${user.email}, Password: User123!`);
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
