import { redirect } from "next/navigation";

// The app starts at the found items directory — the old static dashboard
// was removed; every "Home" link and the post-login redirect land here.
export default function Home() {
  redirect("/found-items");
}
