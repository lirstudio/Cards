import { redirect } from "next/navigation";

/** קישור ישן ל־/pages/new — מפנה ללוח הבקרה. */
export default function LegacyNewPageRedirect() {
  redirect("/dashboard");
}
