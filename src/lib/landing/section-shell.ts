/**
 * מעטפת רספונסיבית אחידה לכל סקשני דף הנחיתה (נוכחיים ועתידיים).
 * ייבוא מ־כאן בכל סקשן חדש במקום קבועי px ידניים.
 */
export const LC_SECTION_PX =
  "px-4 min-[480px]:px-5 sm:px-6 lg:px-8" as const;

/** מונע גלישת רוחב ומרחיב עד קצה המסך בצורה צפויה */
export const LC_LANDING_SECTION_BASE =
  "lc-landing-section box-border w-full min-w-0 max-w-full" as const;

/** שילוב לשימוש ישיר כ־className על <section> / מעטפת עליונה */
export const LC_SECTION_SHELL = `${LC_LANDING_SECTION_BASE} ${LC_SECTION_PX}` as const;
