import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to chat as the main page
  redirect("/dashboard/chat");
}
