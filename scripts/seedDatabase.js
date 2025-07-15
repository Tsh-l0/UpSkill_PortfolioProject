const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Skill = require("../models/Skill");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding");

    // Clear existing data
    await User.deleteMany({});
    await Skill.deleteMany({});
    console.log("Cleared existing data");

    // Seed skills
    const skills = [
      {
        name: "JavaScript",
        category: "frontend",
        description: "Programming language for web development",
        difficulty: "intermediate",
      },
      {
        name: "React",
        category: "frontend",
        description: "JavaScript library for building user interfaces",
        difficulty: "intermediate",
      },
      {
        name: "Node.js",
        category: "backend",
        description: "JavaScript runtime for server-side development",
        difficulty: "intermediate",
      },
      {
        name: "Python",
        category: "backend",
        description: "High-level programming language",
        difficulty: "beginner",
      },
      {
        name: "MongoDB",
        category: "database",
        description: "NoSQL document database",
        difficulty: "intermediate",
      },
      {
        name: "Docker",
        category: "devops",
        description: "Containerization platform",
        difficulty: "advanced",
      },
      {
        name: "AWS",
        category: "devops",
        description: "Amazon Web Services cloud platform",
        difficulty: "advanced",
      },
      {
        name: "TypeScript",
        category: "frontend",
        description: "Typed superset of JavaScript",
        difficulty: "intermediate",
      },
      {
        name: "Vue.js",
        category: "frontend",
        description: "Progressive JavaScript framework",
        difficulty: "intermediate",
      },
      {
        name: "PostgreSQL",
        category: "database",
        description: "Open source relational database",
        difficulty: "intermediate",
      },
    ];

    const createdSkills = await Skill.insertMany(skills);
    console.log(`Seeded ${createdSkills.length} skills`);

    // Seed admin user
    const adminUser = await User.create({
      fullName: "Admin User",
      email: "admin@upskill.dev",
      password: "Admin123!",
      role: "admin",
      isEmailVerified: true,
      profileCompletionScore: 100,
    });

    // Seed test users
    const testUsers = [
      {
        fullName: "John Developer",
        email: "john@example.com",
        password: "Password123!",
        title: "Frontend Developer",
        bio: "Passionate frontend developer with 3 years of experience",
        location: "San Francisco, CA",
        currentCompany: "TechCorp",
        experienceLevel: "mid",
        yearsOfExperience: 3,
        githubUsername: "johndev",
        isEmailVerified: true,
      },
      {
        fullName: "Sarah Engineer",
        email: "sarah@example.com",
        password: "Password123!",
        title: "Full Stack Engineer",
        bio: "Full stack engineer who loves building scalable applications",
        location: "New York, NY",
        currentCompany: "StartupInc",
        experienceLevel: "senior",
        yearsOfExperience: 5,
        githubUsername: "saraheng",
        isEmailVerified: true,
      },
    ];

    const createdUsers = await User.insertMany(testUsers);
    console.log(`Seeded ${createdUsers.length + 1} users (including admin)`);

    console.log("Database seeded successfully!");
    console.log("Admin login: admin@upskill.dev / Admin123!");
    console.log("Test user: john@example.com / Password123!");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
