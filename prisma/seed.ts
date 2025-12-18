import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const hr = await prisma.role.upsert({
    where: { name: "HR" },
    update: {},
    create: { name: "HR" },
  });

  const admin = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin" },
  });

  const processEngineer = await prisma.role.upsert({
    where: { name: "Process Engineer" },
    update: {},
    create: { name: "Process Engineer" },
  });

  const equipmentEngineer = await prisma.role.upsert({
    where: { name: "Equipment Engineer" },
    update: {},
    create: { name: "Equipment Engineer" },
  });

  const operations = await prisma.role.upsert({
    where: { name: "Operations/Technician" },
    update: {},
    create: { name: "Operations/Technician" },
  });

  const logistics = await prisma.role.upsert({
    where: { name: "Logistics/Driver" },
    update: {},
    create: { name: "Logistics/Driver" },
  });

  // Helper to create tasks
  const createTasks = async (roleId: string, tasks: any[]) => {
    for (const task of tasks) {
      await prisma.task.create({
        data: {
          roleId,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
        },
      });
    }
  };

  // HR tasks
  await createTasks(hr.id, [
    {
      title: "Review new hire onboarding documents",
      description: "Process completed forms from last week's new hires",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      title: "Schedule quarterly safety training",
      description: "Coordinate with operations team for training dates",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    },
    {
      title: "Update employee handbook",
      description: "Add new policies regarding equipment usage",
      priority: "LOW",
      status: "TODO",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Process payroll for month end",
      description: "Verify timesheets and submit for processing",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
    },
    {
      title: "Conduct exit interviews",
      description: "Schedule interviews with departing employees",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Update benefits enrollment system",
      description: "Ensure all employees have access to new benefits portal",
      priority: "HIGH",
      status: "BLOCKED",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Review performance evaluation forms",
      description: "Update evaluation criteria for engineering roles",
      priority: "LOW",
      status: "DONE",
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Admin tasks
  await createTasks(admin.id, [
    {
      title: "Approve purchase orders for Q2 supplies",
      description: "Review and approve pending POs from operations",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Update facility access cards",
      description: "Issue new cards for recently hired staff",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Schedule vendor meeting",
      description: "Coordinate quarterly review with equipment suppliers",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Backup database systems",
      description: "Verify automated backups are running correctly",
      priority: "CRITICAL",
      status: "DONE",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Renew software licenses",
      description: "Process renewals for CAD and simulation tools",
      priority: "HIGH",
      status: "BLOCKED",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue
    },
    {
      title: "Update emergency contact list",
      description: "Ensure all departments have current emergency contacts",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Review security camera footage",
      description: "Check for any incidents from last week",
      priority: "LOW",
      status: "TODO",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Organize quarterly all-hands meeting",
      description: "Book venue and send calendar invites",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Process Engineer tasks
  await createTasks(processEngineer.id, [
    {
      title: "Optimize lithography process parameters",
      description: "Test new exposure settings to improve yield",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Analyze wafer defect data",
      description: "Review last batch results and identify patterns",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Update process documentation",
      description: "Document changes to etching procedure",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Calibrate metrology equipment",
      description: "Perform routine calibration on measurement tools",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
    },
    {
      title: "Review new material specifications",
      description: "Evaluate alternative photoresist options",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Troubleshoot yield drop in Line 3",
      description: "Investigate recent yield decrease",
      priority: "CRITICAL",
      status: "BLOCKED",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Train new engineer on process flow",
      description: "Schedule onboarding sessions",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Complete quarterly process audit",
      description: "Review all process steps for compliance",
      priority: "HIGH",
      status: "DONE",
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Equipment Engineer tasks
  await createTasks(equipmentEngineer.id, [
    {
      title: "Repair wafer handler in Bay 2",
      description: "Replace faulty robotic arm component",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Perform preventive maintenance on etcher",
      description: "Schedule PM for Etching Tool #5",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Install new vacuum pump",
      description: "Replace pump in deposition chamber",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Update equipment maintenance logs",
      description: "Document all recent repairs and PMs",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Order spare parts inventory",
      description: "Restock critical components",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Calibrate temperature sensors",
      description: "Verify accuracy of all thermal sensors",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue
    },
    {
      title: "Investigate equipment alarm frequency",
      description: "Analyze why alarms are triggering more often",
      priority: "CRITICAL",
      status: "BLOCKED",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Train technicians on new equipment",
      description: "Conduct training for recently installed tool",
      priority: "MEDIUM",
      status: "DONE",
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Operations/Technician tasks
  await createTasks(operations.id, [
    {
      title: "Load wafers into processing line",
      description: "Prepare next batch for lithography",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now()),
    },
    {
      title: "Monitor process parameters",
      description: "Watch for any deviations during current run",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now()),
    },
    {
      title: "Clean processing chamber",
      description: "Perform routine cleaning after batch completion",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Record production metrics",
      description: "Log throughput and yield data",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Inspect wafers for defects",
      description: "Visual inspection of completed batch",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Restock consumables",
      description: "Replace photoresist and other materials",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Report equipment issues",
      description: "Document any problems observed during shift",
      priority: "HIGH",
      status: "DONE",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Attend safety briefing",
      description: "Participate in weekly safety meeting",
      priority: "MEDIUM",
      status: "BLOCKED",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Logistics/Driver tasks
  await createTasks(logistics.id, [
    {
      title: "Deliver wafers to customer facility",
      description: "Transport completed batch to client",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now()),
    },
    {
      title: "Pick up raw materials from supplier",
      description: "Collect silicon wafers from vendor",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Schedule vehicle maintenance",
      description: "Book service appointment for delivery truck",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Update delivery logs",
      description: "Document all shipments from last week",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Coordinate with warehouse team",
      description: "Plan next week's delivery schedule",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Verify shipment documentation",
      description: "Check all paperwork before delivery",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
    },
    {
      title: "Inspect vehicle condition",
      description: "Check truck before next delivery",
      priority: "MEDIUM",
      status: "DONE",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Create users
  const adminPasswordHash = await bcrypt.hash("admin", 10);
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
      reputation: 0,
    },
  });

  // Create 5 demo users
  const demoUsers = [
    { username: "alice", password: "password123" },
    { username: "bob", password: "password123" },
    { username: "charlie", password: "password123" },
    { username: "diana", password: "password123" },
    { username: "eve", password: "password123" },
  ];

  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
        username: user.username,
        passwordHash,
        role: "USER",
        isActive: true,
        reputation: 0,
      },
    });
  }

  console.log("Seed data created successfully!");
  console.log("Admin credentials: username=admin, password=admin");
  console.log("Demo users: alice, bob, charlie, diana, eve (all password: password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

