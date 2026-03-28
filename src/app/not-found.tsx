import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">הדף לא נמצא</h1>
      <p className="mt-3 text-neutral-600">
        ייתכן שהכתובת שגויה או שהעמוד עדיין לא פורסם.
      </p>
      <Link href="/" className="mt-8 text-[var(--lc-primary)] underline">
        חזרה לדף הבית
      </Link>
    </div>
  );
}
