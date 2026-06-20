import { redirect } from "next/navigation";
import { createAnonServerClient } from "@/lib/supabase/server";

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAnonServerClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!quiz) redirect("/");
  redirect(`/build/${quiz.id}`);
}
