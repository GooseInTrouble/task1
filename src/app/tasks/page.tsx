"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Card,
  CardContent,
  Box,
  TextField,
} from "@mui/material";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import SortableTaskItem from "@/app/components/SortableTaskItem";
import { Task } from "./types";

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo" as "todo" | "in_progress" | "done",
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setTasks(data);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase.from("tasks").insert([
      {
        ...form,
        id: uuidv4(),
        user_id: user.id,
      },
    ]);

    if (!error) {
      setOpen(false);
      setForm({ title: "", description: "", status: "todo" });
      fetchTasks();
    }
  };

  const handleDragStart = (event: any) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const updatedTasks = tasks.map((t) =>
      t.id === active.id ? { ...t, status: over.id } : t
    );
    setTasks(updatedTasks);

    await supabase
      .from("tasks")
      .update({ status: over.id })
      .eq("id", active.id);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h4" gutterBottom>
        Task Manager
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Task
      </Button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 16,
            height: "80vh",
          }}
        >
          {Object.entries(statusLabels).map(([status, label]) => {
            const columnTasks = tasks.filter((t) => t.status === status);
            return (
              <TaskColumn key={status} status={status} label={label}>
                <SortableContext
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      containerId={status}
                      onClick={() => handleTaskClick(task)} // додано
                    />
                  ))}
                </SortableContext>
              </TaskColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <Card sx={{ width: 250, backgroundColor: "#e3f2fd" }}>
              <CardContent>
                <Typography variant="subtitle1">{activeTask.title}</Typography>
                <Typography variant="body2">{activeTask.description}</Typography>
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            fullWidth
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <Select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as "todo" | "in_progress" | "done",
              })
            }
            fullWidth
          >
            <MenuItem value="todo">To Do</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent dividers>
          {selectedTask ? (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedTask.title}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedTask.description || "No description"}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status: {statusLabels[selectedTask.status]}
              </Typography>
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function TaskColumn({
  status,
  label,
  children,
}: {
  status: string;
  label: string;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: isOver ? "#bbdefb" : "#fff",
        boxShadow: "0 0 8px rgba(0,0,0,0.1)",
        borderRadius: 4,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ overflowY: "auto", flex: 1 }}>{children}</Box>
    </div>
  );
}
