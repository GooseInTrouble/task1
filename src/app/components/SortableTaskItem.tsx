// SortableTaskItem.tsx (приклад)
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, Typography } from "@mui/material";
import { Task } from "@/app/tasks/types";

interface Props {
  task: Task;
  containerId: string;
  onClick?: () => void; // додали onClick
}

export default function SortableTaskItem({ task, containerId, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: "pointer",
    opacity: isDragging ? 0.5 : 1,
    marginBottom: 8,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick} // викликаємо при кліку
      variant="outlined"
    >
      <CardContent>
        <Typography variant="subtitle1">{task.title}</Typography>
      </CardContent>
    </Card>
  );
}
