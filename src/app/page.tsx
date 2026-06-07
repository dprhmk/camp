import { redirect } from "next/navigation";
import { getCurrentUser, getActiveCampId } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const activeCamp = await getActiveCampId();
  redirect(activeCamp ? "/members" : "/camps");
}
