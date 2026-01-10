import { redirect } from "next/navigation";

export default function Dashboard() {
  // Redirect to chat as the main dashboard page
  redirect("/dashboard/chat");
}
