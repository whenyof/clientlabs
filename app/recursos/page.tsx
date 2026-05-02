import { redirect } from "next/navigation"

// /recursos redirige permanentemente a /blog
export default function RecursosPage() {
  redirect("/blog")
}
