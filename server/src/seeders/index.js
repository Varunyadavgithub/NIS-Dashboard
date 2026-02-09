import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Guard from "../models/Guard.js";
import Client from "../models/Client.js";
import Settings from "../models/Settings.js";
import logger from "../utils/logger.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("MongoDB Connected for seeding");
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

const seedSuperAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "super_admin" });
    if (existingAdmin) {
      logger.info("Super admin already exists");
      return existingAdmin;
    }

    const superAdmin = await User.create({
      name: "Super Admin",
      email: "admin@nehasecurity.com",
      password: "Admin@123",
      phone: "9999999999",
      role: "super_admin",
      isActive: true,
    });

    logger.info(`Super admin created: ${superAdmin.email}`);
    return superAdmin;
  } catch (error) {
    logger.error(`Error seeding super admin: ${error.message}`);
    throw error;
  }
};

const seedUsers = async (adminId) => {
  try {
    const users = [
      {
        name: "Manager User",
        email: "manager@nehasecurity.com",
        password: "Manager@123",
        phone: "9888888888",
        role: "manager",
        isActive: true,
        createdBy: adminId,
      },
      {
        name: "Accountant User",
        email: "accountant@nehasecurity.com",
        password: "Accountant@123",
        phone: "9777777777",
        role: "accountant",
        isActive: true,
        createdBy: adminId,
      },
      {
        name: "Supervisor User",
        email: "supervisor@nehasecurity.com",
        password: "Supervisor@123",
        phone: "9666666666",
        role: "supervisor",
        isActive: true,
        createdBy: adminId,
      },
    ];

    for (const userData of users) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        await User.create(userData);
        logger.info(`Created user: ${userData.email}`);
      }
    }
  } catch (error) {
    logger.error(`Error seeding users: ${error.message}`);
    throw error;
  }
};

const seedSettings = async () => {
  try {
    const count = await Settings.initializeDefaults();
    logger.info(`Initialized ${count} default settings`);
  } catch (error) {
    logger.error(`Error seeding settings: ${error.message}`);
    throw error;
  }
};

const seedSampleData = async (adminId) => {
  try {
    // Sample Guards
    const guards = [
      {
        firstName: "Rajesh",
        lastName: "Kumar",
        fatherName: "Ram Kumar",
        dateOfBirth: new Date("1990-05-15"),
        gender: "male",
        phone: "9876543210",
        currentAddress: { city: "Delhi", state: "Delhi", pincode: "110001" },
        permanentAddress: {
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
          sameAsCurrent: true,
        },
        dateOfJoining: new Date("2023-01-01"),
        designation: "security_guard",
        emergencyContact: {
          name: "Sunita Kumar",
          relationship: "Wife",
          phone: "9876543211",
        },
        status: "active",
        salary: {
          basic: 15000,
          hra: 3000,
          travelAllowance: 1000,
          foodAllowance: 1000,
          medicalAllowance: 500,
          specialAllowance: 500,
        },
        pfDetails: { isApplicable: true },
        esiDetails: { isApplicable: true },
        bankDetails: {
          accountHolderName: "Rajesh Kumar",
          accountNumber: "1234567890",
          bankName: "State Bank of India",
          ifscCode: "SBIN0001234",
        },
        createdBy: adminId,
      },
      {
        firstName: "Amit",
        lastName: "Singh",
        fatherName: "Vijay Singh",
        dateOfBirth: new Date("1988-08-20"),
        gender: "male",
        phone: "9876543220",
        currentAddress: {
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201301",
        },
        permanentAddress: {
          city: "Lucknow",
          state: "Uttar Pradesh",
          pincode: "226001",
        },
        dateOfJoining: new Date("2023-02-15"),
        designation: "senior_guard",
        emergencyContact: {
          name: "Priya Singh",
          relationship: "Wife",
          phone: "9876543221",
        },
        status: "active",
        salary: {
          basic: 18000,
          hra: 3600,
          travelAllowance: 1200,
          foodAllowance: 1200,
          medicalAllowance: 600,
          specialAllowance: 600,
        },
        pfDetails: { isApplicable: true },
        esiDetails: { isApplicable: true },
        bankDetails: {
          accountHolderName: "Amit Singh",
          accountNumber: "0987654321",
          bankName: "HDFC Bank",
          ifscCode: "HDFC0001234",
        },
        createdBy: adminId,
      },
      {
        firstName: "Suresh",
        lastName: "Yadav",
        fatherName: "Mohan Yadav",
        dateOfBirth: new Date("1985-12-10"),
        gender: "male",
        phone: "9876543230",
        currentAddress: {
          city: "Gurgaon",
          state: "Haryana",
          pincode: "122001",
        },
        permanentAddress: {
          city: "Gurgaon",
          state: "Haryana",
          pincode: "122001",
          sameAsCurrent: true,
        },
        dateOfJoining: new Date("2022-06-01"),
        designation: "supervisor",
        emergencyContact: {
          name: "Rekha Yadav",
          relationship: "Wife",
          phone: "9876543231",
        },
        status: "active",
        salary: {
          basic: 22000,
          hra: 4400,
          travelAllowance: 1500,
          foodAllowance: 1500,
          medicalAllowance: 750,
          specialAllowance: 750,
        },
        pfDetails: { isApplicable: true },
        esiDetails: { isApplicable: false },
        bankDetails: {
          accountHolderName: "Suresh Yadav",
          accountNumber: "5678901234",
          bankName: "ICICI Bank",
          ifscCode: "ICIC0001234",
        },
        createdBy: adminId,
      },
      {
        firstName: "Ramesh",
        lastName: "Verma",
        fatherName: "Shyam Verma",
        dateOfBirth: new Date("1992-03-25"),
        gender: "male",
        phone: "9876543240",
        currentAddress: { city: "Delhi", state: "Delhi", pincode: "110092" },
        permanentAddress: {
          city: "Varanasi",
          state: "Uttar Pradesh",
          pincode: "221001",
        },
        dateOfJoining: new Date("2023-04-01"),
        designation: "security_guard",
        emergencyContact: {
          name: "Geeta Verma",
          relationship: "Mother",
          phone: "9876543241",
        },
        status: "active",
        salary: {
          basic: 15000,
          hra: 3000,
          travelAllowance: 1000,
          foodAllowance: 1000,
          medicalAllowance: 500,
          specialAllowance: 500,
        },
        pfDetails: { isApplicable: true },
        esiDetails: { isApplicable: true },
        createdBy: adminId,
      },
      {
        firstName: "Deepak",
        lastName: "Sharma",
        fatherName: "Rakesh Sharma",
        dateOfBirth: new Date("1995-07-18"),
        gender: "male",
        phone: "9876543250",
        currentAddress: {
          city: "Faridabad",
          state: "Haryana",
          pincode: "121001",
        },
        permanentAddress: {
          city: "Faridabad",
          state: "Haryana",
          pincode: "121001",
          sameAsCurrent: true,
        },
        dateOfJoining: new Date("2023-05-15"),
        designation: "security_guard",
        emergencyContact: {
          name: "Anjali Sharma",
          relationship: "Sister",
          phone: "9876543251",
        },
        status: "active",
        salary: {
          basic: 15000,
          hra: 3000,
          travelAllowance: 1000,
          foodAllowance: 1000,
          medicalAllowance: 500,
          specialAllowance: 500,
        },
        pfDetails: { isApplicable: true },
        esiDetails: { isApplicable: true },
        createdBy: adminId,
      },
    ];

    const createdGuards = await Guard.insertMany(guards);
    logger.info(`Created ${createdGuards.length} sample guards`);

    // Sample Clients
    const clients = [
      {
        companyName: "Tech Solutions Pvt Ltd",
        tradeName: "TechSol",
        industryType: "it_software",
        gstNumber: "07AAACT1234A1ZA",
        panNumber: "AAACT1234A",
        contactPerson: {
          name: "Rahul Sharma",
          phone: "9988776655",
          email: "rahul@techsolutions.com",
          designation: "HR Manager",
        },
        registeredAddress: {
          street: "Sector 62",
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201301",
        },
        sites: [
          {
            name: "Main Office",
            address: {
              street: "Sector 62",
              city: "Noida",
              state: "Uttar Pradesh",
              pincode: "201301",
            },
            contactPerson: { name: "Ajay Kumar", phone: "9988776656" },
            guardsRequired: 3,
            currentStrength: 0,
            shifts: [
              {
                name: "day",
                startTime: "08:00",
                endTime: "20:00",
                guardsNeeded: 2,
              },
              {
                name: "night",
                startTime: "20:00",
                endTime: "08:00",
                guardsNeeded: 1,
              },
            ],
            isActive: true,
          },
        ],
        contract: {
          startDate: new Date("2023-01-01"),
          endDate: new Date("2024-12-31"),
          value: 900000,
          billingCycle: "monthly",
          paymentTerms: 30,
          autoRenewal: true,
        },
        billing: {
          ratePerGuard: 25000,
          billingType: "per_guard",
          gstApplicable: true,
          gstRate: 18,
        },
        requirements: {
          totalGuards: 3,
          currentStrength: 0,
        },
        status: "active",
        createdBy: adminId,
      },
      {
        companyName: "Global Manufacturing Ltd",
        tradeName: "GlobalMfg",
        industryType: "manufacturing",
        gstNumber: "06AAACG5678B1ZB",
        panNumber: "AAACG5678B",
        contactPerson: {
          name: "Vikram Patel",
          phone: "9988776644",
          email: "vikram@globalmanufacturing.com",
          designation: "Admin Head",
        },
        registeredAddress: {
          street: "IMT Manesar",
          city: "Gurgaon",
          state: "Haryana",
          pincode: "122001",
        },
        sites: [
          {
            name: "Factory Unit 1",
            address: {
              street: "IMT Manesar",
              city: "Gurgaon",
              state: "Haryana",
              pincode: "122001",
            },
            contactPerson: { name: "Sunil Verma", phone: "9988776645" },
            guardsRequired: 5,
            currentStrength: 0,
            shifts: [
              {
                name: "day",
                startTime: "06:00",
                endTime: "14:00",
                guardsNeeded: 2,
              },
              {
                name: "general",
                startTime: "14:00",
                endTime: "22:00",
                guardsNeeded: 2,
              },
              {
                name: "night",
                startTime: "22:00",
                endTime: "06:00",
                guardsNeeded: 1,
              },
            ],
            isActive: true,
          },
          {
            name: "Warehouse",
            address: {
              street: "Sector 8",
              city: "Gurgaon",
              state: "Haryana",
              pincode: "122001",
            },
            contactPerson: { name: "Rajiv Gupta", phone: "9988776646" },
            guardsRequired: 2,
            currentStrength: 0,
            shifts: [
              {
                name: "general",
                startTime: "08:00",
                endTime: "20:00",
                guardsNeeded: 1,
              },
              {
                name: "night",
                startTime: "20:00",
                endTime: "08:00",
                guardsNeeded: 1,
              },
            ],
            isActive: true,
          },
        ],
        contract: {
          startDate: new Date("2023-03-01"),
          endDate: new Date("2025-02-28"),
          value: 1680000,
          billingCycle: "monthly",
          paymentTerms: 15,
          autoRenewal: false,
        },
        billing: {
          ratePerGuard: 22000,
          billingType: "per_guard",
          gstApplicable: true,
          gstRate: 18,
        },
        requirements: {
          totalGuards: 7,
          currentStrength: 0,
        },
        status: "active",
        createdBy: adminId,
      },
      {
        companyName: "City Hospital",
        industryType: "healthcare",
        contactPerson: {
          name: "Dr. Priya Mehta",
          phone: "9988776633",
          email: "admin@cityhospital.com",
          designation: "Administrator",
        },
        registeredAddress: {
          street: "Sector 15",
          city: "Delhi",
          state: "Delhi",
          pincode: "110085",
        },
        sites: [
          {
            name: "Main Hospital",
            address: {
              street: "Sector 15",
              city: "Delhi",
              state: "Delhi",
              pincode: "110085",
            },
            guardsRequired: 4,
            currentStrength: 0,
            shifts: [
              {
                name: "day",
                startTime: "07:00",
                endTime: "19:00",
                guardsNeeded: 2,
              },
              {
                name: "night",
                startTime: "19:00",
                endTime: "07:00",
                guardsNeeded: 2,
              },
            ],
            isActive: true,
          },
        ],
        contract: {
          startDate: new Date("2023-06-01"),
          endDate: new Date("2024-05-31"),
          value: 1200000,
          billingCycle: "monthly",
          paymentTerms: 30,
        },
        billing: {
          ratePerGuard: 25000,
          billingType: "per_guard",
          gstApplicable: true,
          gstRate: 18,
        },
        requirements: {
          totalGuards: 4,
          currentStrength: 0,
        },
        status: "active",
        createdBy: adminId,
      },
    ];

    const createdClients = await Client.insertMany(clients);
    logger.info(`Created ${createdClients.length} sample clients`);

    return { guards: createdGuards, clients: createdClients };
  } catch (error) {
    logger.error(`Error seeding sample data: ${error.message}`);
    throw error;
  }
};

const clearDatabase = async () => {
  try {
    logger.info("Clearing database...");
    await User.deleteMany({ role: { $ne: "super_admin" } });
    await Guard.deleteMany({});
    await Client.deleteMany({});
    logger.info("Database cleared (except super admin)");
  } catch (error) {
    logger.error(`Error clearing database: ${error.message}`);
    throw error;
  }
};

const runSeeder = async () => {
  try {
    await connectDB();

    const args = process.argv.slice(2);
    const shouldClear = args.includes("--clear");
    const shouldSeedSample =
      args.includes("--sample") || process.env.NODE_ENV === "development";

    logger.info("Starting database seeding...");
    logger.info("");

    if (shouldClear) {
      await clearDatabase();
    }

    // Seed super admin
    const admin = await seedSuperAdmin();

    // Seed other users
    await seedUsers(admin._id);

    // Seed settings
    await seedSettings();

    // Seed sample data if requested or in development
    if (shouldSeedSample) {
      const existingGuards = await Guard.countDocuments();
      if (existingGuards === 0) {
        await seedSampleData(admin._id);
      } else {
        logger.info("Sample data already exists, skipping...");
      }
    }

    logger.info("");
    logger.info("=".repeat(60));
    logger.info("Database seeding completed successfully!");
    logger.info("=".repeat(60));
    logger.info("");
    logger.info("Login Credentials:");
    logger.info("-".repeat(60));
    logger.info("Super Admin:");
    logger.info("  Email: admin@nehasecurity.com");
    logger.info("  Password: Admin@123");
    logger.info("");
    logger.info("Manager:");
    logger.info("  Email: manager@nehasecurity.com");
    logger.info("  Password: Manager@123");
    logger.info("");
    logger.info("Accountant:");
    logger.info("  Email: accountant@nehasecurity.com");
    logger.info("  Password: Accountant@123");
    logger.info("");
    logger.info("Supervisor:");
    logger.info("  Email: supervisor@nehasecurity.com");
    logger.info("  Password: Supervisor@123");
    logger.info("-".repeat(60));
    logger.info("");

    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// Run seeder
runSeeder();
