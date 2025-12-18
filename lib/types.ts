// Type definitions for Prisma string enums
// These match the string values used in the database

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Status = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
export type UserRole = "USER" | "ADMIN";
export type PostCategory = "ONBOARDING" | "EQUIPMENT" | "PROCESS" | "QUALITY" | "LOGISTICS" | "SAFETY" | "GENERAL";

// Constants for easier reference
export const PriorityValues = {
  LOW: "LOW" as const,
  MEDIUM: "MEDIUM" as const,
  HIGH: "HIGH" as const,
  CRITICAL: "CRITICAL" as const,
};

export const StatusValues = {
  TODO: "TODO" as const,
  IN_PROGRESS: "IN_PROGRESS" as const,
  BLOCKED: "BLOCKED" as const,
  DONE: "DONE" as const,
};

