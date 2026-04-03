/** Map common Supabase Auth API errors to Hebrew UX hints. */
export function formatAuthEmailError(message: string): string {
  const m = message.toLowerCase();

  const cooldownMatch = m.match(/after\s+(\d+)\s*seconds?/i);
  if (
    m.includes("security purposes") ||
    m.includes("only request this") ||
    cooldownMatch
  ) {
    const sec = cooldownMatch?.[1];
    const wait = sec ? `${sec} שניות` : "כמה שניות";
    return `נדרשת המתנה לפני שליחת איפוס נוסף (הגנת קצב של Supabase). נסו שוב בעוד ${wait}.`;
  }

  if (m.includes("redirect") && (m.includes("not allowed") || m.includes("invalid"))) {
    return `${message} — ב־Supabase: Authentication → URL configuration הוסיפו את כתובת האימות המלאה ל־Redirect URLs (כולל /auth/callback).`;
  }

  if (m.includes("rate limit") || m.includes("too many")) {
    return `${message} — נסו שוב בעוד כמה דקות.`;
  }

  if (m.includes("smtp") || m.includes("mail") || m.includes("email")) {
    return `${message} — בדקו ב־Supabase Authentication → SMTP / Logs אם שליחת המייל נכשלת.`;
  }

  return message;
}
