"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Topbar from "@/components/Topbar";
import { Loader2, Plus, CheckCircle2, Circle, AlertCircle, Clock, X } from "lucide-react";
import Logo from "@/components/Logo";
import { Priority, Status, PriorityValues, StatusValues } from "@/lib/types";

interface Role {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  roleId: string;
}

interface Briefing {
  top3: string[];
  alerts: string[];
  blockers: string[];
  dueOverdue: string[];
  id?: string;
  generatedAt?: string;
}

export default function RoleBriefingPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL");
  const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for create/edit
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<Priority>(PriorityValues.MEDIUM);
  const [formStatus, setFormStatus] = useState<Status>(StatusValues.TODO);
  const [formDueDate, setFormDueDate] = useState("");

  useEffect(() => {
    // Load roles
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => setError("Failed to load roles"));

    // Check localStorage for saved session
    const savedRoleId = localStorage.getItem("briefing_roleId");
    const savedName = localStorage.getItem("briefing_userName");
    if (savedRoleId && savedName) {
      setSelectedRoleId(savedRoleId);
      setUserName(savedName);
      loadTasks(savedRoleId);
    }
  }, []);

  const loadTasks = async (roleId: string) => {
    setLoadingTasks(true);
    try {
      const params = new URLSearchParams({ roleId });
      if (filterStatus !== "ALL") params.append("status", filterStatus);
      if (filterPriority !== "ALL") params.append("priority", filterPriority);

      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (selectedRoleId) {
      loadTasks(selectedRoleId);
    }
  }, [selectedRoleId, filterStatus, filterPriority]);

  const handleLogin = () => {
    if (!selectedRoleId || !userName.trim()) {
      setError("Please select a role and enter your name");
      return;
    }
    localStorage.setItem("briefing_roleId", selectedRoleId);
    localStorage.setItem("briefing_userName", userName);
    loadTasks(selectedRoleId);
  };

  const handleCreateTask = async () => {
    if (!formTitle.trim() || !selectedRoleId) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: selectedRoleId,
          title: formTitle,
          description: formDescription || null,
          priority: formPriority,
          status: formStatus,
          dueDate: formDueDate || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");
      setIsCreateModalOpen(false);
      resetForm();
      loadTasks(selectedRoleId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !formTitle.trim()) return;

    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || null,
          priority: formPriority,
          status: formStatus,
          dueDate: formDueDate || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update task");
      setIsEditModalOpen(false);
      setSelectedTask(null);
      resetForm();
      loadTasks(selectedRoleId!);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMarkDone = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: StatusValues.DONE }),
      });
      loadTasks(selectedRoleId!);
    } catch (err: any) {
      setError("Failed to update task");
    }
  };

  const handleGenerateBriefing = async () => {
    if (!selectedRoleId) return;

    setLoadingBriefing(true);
    setError(null);

    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: selectedRoleId }),
      });

      if (!res.ok) throw new Error("Failed to generate briefing");
      const data = await res.json();
      setBriefing(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingBriefing(false);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormPriority(PriorityValues.MEDIUM);
    setFormStatus(StatusValues.TODO);
    setFormDueDate("");
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
    setIsEditModalOpen(true);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case PriorityValues.CRITICAL:
        return "bg-red-100 text-red-800";
      case PriorityValues.HIGH:
        return "bg-orange-100 text-orange-800";
      case PriorityValues.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case PriorityValues.LOW:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case StatusValues.DONE:
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case StatusValues.IN_PROGRESS:
        return <Clock className="h-5 w-5 text-blue-600" />;
      case StatusValues.BLOCKED:
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!selectedRoleId) {
    return (
      <>
        <Topbar title="Role Briefing Hub" />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Demo Login</CardTitle>
                  <CardDescription>
                    Select your role to access your personalized briefing dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center mb-4">
                    <Logo size={96} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name (Optional)</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Role</label>
                    <Select
                      value={selectedRoleId || ""}
                      onValueChange={setSelectedRoleId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}
                  <Button onClick={handleLogin} className="w-full" disabled={!selectedRoleId}>
                    Enter
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title={`Role Briefing Hub - ${userName || "User"}`} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tasks Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Tasks</CardTitle>
                      <CardDescription>
                        Manage and track your assigned tasks
                      </CardDescription>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex gap-4 mb-4">
                    <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as Status | "ALL")}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value={StatusValues.TODO}>To Do</SelectItem>
                        <SelectItem value={StatusValues.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={StatusValues.BLOCKED}>Blocked</SelectItem>
                        <SelectItem value={StatusValues.DONE}>Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as Priority | "ALL")}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Priorities</SelectItem>
                        <SelectItem value={PriorityValues.CRITICAL}>Critical</SelectItem>
                        <SelectItem value={PriorityValues.HIGH}>High</SelectItem>
                        <SelectItem value={PriorityValues.MEDIUM}>Medium</SelectItem>
                        <SelectItem value={PriorityValues.LOW}>Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Task List */}
                  {loadingTasks ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : tasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No tasks found</p>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => openEditModal(task)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              {getStatusIcon(task.status)}
                              <div className="flex-1">
                                <h3 className="font-medium">{task.title}</h3>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  {task.dueDate && (
                                    <span className="text-xs text-gray-500">
                                      Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {task.status !== StatusValues.DONE && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkDone(task.id);
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Briefing Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Briefing</CardTitle>
                  <CardDescription>
                    Get AI-powered insights for your day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleGenerateBriefing}
                    disabled={loadingBriefing}
                    className="w-full mb-4"
                  >
                    {loadingBriefing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Daily Briefing"
                    )}
                  </Button>

                  {error && (
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                  )}

                  {briefing && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Top 3 Actions Today</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          {briefing.top3.map((item, idx) => (
                            <li key={idx} className="text-gray-700">{item}</li>
                          ))}
                        </ol>
                      </div>

                      {briefing.alerts.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-red-600">Critical Alerts</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {briefing.alerts.map((alert, idx) => (
                              <li key={idx} className="text-gray-700">{alert}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {briefing.blockers.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-orange-600">Blocking Dependencies</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {briefing.blockers.map((blocker, idx) => (
                              <li key={idx} className="text-gray-700">{blocker}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {briefing.dueOverdue.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Due/Overdue Items</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {briefing.dueOverdue.map((item, idx) => (
                              <li key={idx} className="text-gray-700">{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to your list</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PriorityValues.LOW}>Low</SelectItem>
                    <SelectItem value={PriorityValues.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={PriorityValues.HIGH}>High</SelectItem>
                    <SelectItem value={PriorityValues.CRITICAL}>Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as Status)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StatusValues.TODO}>To Do</SelectItem>
                    <SelectItem value={StatusValues.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={StatusValues.BLOCKED}>Blocked</SelectItem>
                    <SelectItem value={StatusValues.DONE}>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={!formTitle.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PriorityValues.LOW}>Low</SelectItem>
                    <SelectItem value={PriorityValues.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={PriorityValues.HIGH}>High</SelectItem>
                    <SelectItem value={PriorityValues.CRITICAL}>Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as Status)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StatusValues.TODO}>To Do</SelectItem>
                    <SelectItem value={StatusValues.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={StatusValues.BLOCKED}>Blocked</SelectItem>
                    <SelectItem value={StatusValues.DONE}>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask} disabled={!formTitle.trim()}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

