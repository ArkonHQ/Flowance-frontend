import { getAllProjects } from "@/lib/api/projects";
import { cookies } from "next/headers";
import { TaskForm } from "../../components/TaskForm";




import { redirect } from "next/navigation";

export default async function NewProjectPage() {
  redirect("/tasks");
}








