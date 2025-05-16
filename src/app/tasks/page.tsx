// app/tasks/page.tsx
"use client";
"use client";

import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Select,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  created_at: string;
};

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
const [form, setForm] = useState<{
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
}>({
  title: "",
  description: "",
  status: "todo",
})
  const sensors = useSensors(useSensor(PointerSensor));

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const updated = tasks.map((t) =>
      t.id === active.id ? { ...t, status: over.id } : t
    );
    setTasks(updated);

    await supabase
      .from("tasks")
      .update({ status: over.id })
      .eq("id", active.id);
  };

  const handleAddTask = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const newTask: Omit<Task, "id" | "created_at"> = {
      ...form,
      user_id: user.id,
    };

    const { error } = await supabase.from("tasks").insert([
      {
        ...newTask,
        id: uuidv4(),
      },
    ]);
    if (!error) {
      setOpen(false);
      setForm({ title: "", description: "", status: "todo" });
      fetchTasks();
    }
  };

  return (
    <div className="p-4">
      <Typography variant="h4" gutterBottom>
        Task Manager
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Task
      </Button>
      <Grid container spacing={2} className="mt-4">
        {Object.entries(statusLabels).map(([status, label]) => (
          <Grid key={status}>
            <Typography variant="h6" gutterBottom>
              {label}
            </Typography>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tasks
                  .filter((t) => t.status === status)
                  .map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasks
                  .filter((t) => t.status === status)
                  .map((task) => (
                    <Card key={task.id} className="mb-2">
                      <CardContent>
                        <Typography variant="subtitle1">
                          {task.title}
                        </Typography>
                        <Typography variant="body2">
                          {task.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
              </SortableContext>
            </DndContext>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent className="flex flex-col gap-2 mt-2">
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
    setForm({ ...form, status: e.target.value as "todo" | "in_progress" | "done" })
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
    </div>
  );
}
