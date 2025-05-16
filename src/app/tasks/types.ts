
export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  created_at: string;
};
