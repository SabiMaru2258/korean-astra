import { PrismaClient, Priority, Status } from "@prisma/client";

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
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      title: "Schedule quarterly safety training",
      description: "Coordinate with operations team for training dates",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    },
    {
      title: "Update employee handbook",
      description: "Add new policies regarding equipment usage",
      priority: Priority.LOW,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Process payroll for month end",
      description: "Verify timesheets and submit for processing",
      priority: Priority.CRITICAL,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
    },
    {
      title: "Conduct exit interviews",
      description: "Schedule interviews with departing employees",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Update benefits enrollment system",
      description: "Ensure all employees have access to new benefits portal",
      priority: Priority.HIGH,
      status: Status.BLOCKED,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Review performance evaluation forms",
      description: "Update evaluation criteria for engineering roles",
      priority: Priority.LOW,
      status: Status.DONE,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Admin tasks
  await createTasks(admin.id, [
    {
      title: "Approve purchase orders for Q2 supplies",
      description: "Review and approve pending POs from operations",
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Update facility access cards",
      description: "Issue new cards for recently hired staff",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Schedule vendor meeting",
      description: "Coordinate quarterly review with equipment suppliers",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Backup database systems",
      description: "Verify automated backups are running correctly",
      priority: Priority.CRITICAL,
      status: Status.DONE,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Renew software licenses",
      description: "Process renewals for CAD and simulation tools",
      priority: Priority.HIGH,
      status: Status.BLOCKED,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue
    },
    {
      title: "Update emergency contact list",
      description: "Ensure all departments have current emergency contacts",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Review security camera footage",
      description: "Check for any incidents from last week",
      priority: Priority.LOW,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Organize quarterly all-hands meeting",
      description: "Book venue and send calendar invites",
      priority: Priority.MEDIUM,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Process Engineer tasks
  await createTasks(processEngineer.id, [
    {
      title: "Optimize lithography process parameters",
      description: "Test new exposure settings to improve yield",
      priority: Priority.CRITICAL,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Analyze wafer defect data",
      description: "Review last batch results and identify patterns",
      priority: Priority.HIGH,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Update process documentation",
      description: "Document changes to etching procedure",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Calibrate metrology equipment",
      description: "Perform routine calibration on measurement tools",
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
    },
    {
      title: "Review new material specifications",
      description: "Evaluate alternative photoresist options",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Troubleshoot yield drop in Line 3",
      description: "Investigate recent yield decrease",
      priority: Priority.CRITICAL,
      status: Status.BLOCKED,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Train new engineer on process flow",
      description: "Schedule onboarding sessions",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Complete quarterly process audit",
      description: "Review all process steps for compliance",
      priority: Priority.HIGH,
      status: Status.DONE,
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Equipment Engineer tasks
  await createTasks(equipmentEngineer.id, [
    {
      title: "Repair wafer handler in Bay 2",
      description: "Replace faulty robotic arm component",
      priority: Priority.CRITICAL,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Perform preventive maintenance on etcher",
      description: "Schedule PM for Etching Tool #5",
      priority: Priority.HIGH,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Install new vacuum pump",
      description: "Replace pump in deposition chamber",
      priority: Priority.HIGH,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Update equipment maintenance logs",
      description: "Document all recent repairs and PMs",
      priority: Priority.MEDIUM,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Order spare parts inventory",
      description: "Restock critical components",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Calibrate temperature sensors",
      description: "Verify accuracy of all thermal sensors",
      priority: Priority.HIGH,
      status: Status.TODO,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue
    },
    {
      title: "Investigate equipment alarm frequency",
      description: "Analyze why alarms are triggering more often",
      priority: Priority.CRITICAL,
      status: Status.BLOCKED,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Train technicians on new equipment",
      description: "Conduct training for recently installed tool",
      priority: Priority.MEDIUM,
      status: Status.DONE,
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Operations/Technician tasks
  await createTasks(operations.id, [
    {
      title: "Load wafers into processing line",
      description: "Prepare next batch for lithography",
      priority: Priority.CRITICAL,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now()),
    },
    {
      title: "Monitor process parameters",
      description: "Watch for any deviations during current run",
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now()),
    },
    {
      title: "Clean processing chamber",
      description: "Perform routine cleaning after batch completion",
      priority: Priority.HIGH,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Record production metrics",
      description: "Log throughput and yield data",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Inspect wafers for defects",
      description: "Visual inspection of completed batch",
      priority: Priority.HIGH,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Restock consumables",
      description: "Replace photoresist and other materials",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Report equipment issues",
      description: "Document any problems observed during shift",
      priority: Priority.HIGH,
      status: Status.DONE,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Attend safety briefing",
      description: "Participate in weekly safety meeting",
      priority: Priority.MEDIUM,
      status: Status.BLOCKED,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Logistics/Driver tasks
  await createTasks(logistics.id, [
    {
      title: "Deliver wafers to customer facility",
      description: "Transport completed batch to client",
      priority: Priority.CRITICAL,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now()),
    },
    {
      title: "Pick up raw materials from supplier",
      description: "Collect silicon wafers from vendor",
      priority: Priority.HIGH,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Schedule vehicle maintenance",
      description: "Book service appointment for delivery truck",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Update delivery logs",
      description: "Document all shipments from last week",
      priority: Priority.MEDIUM,
      status: Status.IN_PROGRESS,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Coordinate with warehouse team",
      description: "Plan next week's delivery schedule",
      priority: Priority.HIGH,
      status: Status.TODO,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Verify shipment documentation",
      description: "Check all paperwork before delivery",
      priority: Priority.HIGH,
      status: Status.TODO,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
    },
    {
      title: "Inspect vehicle condition",
      description: "Check truck before next delivery",
      priority: Priority.MEDIUM,
      status: Status.DONE,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

