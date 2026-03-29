/**
 * תוויות עברית למזהי שדות בתוכן סקשנים (ממשק עורך).
 * המפתח תואם לשם השדה ב־JSON; אם אין מיפוי — מוחזר המזהה המקורי.
 */
const LABELS: Record<string, string> = {
  logoText: "טקסט לוגו",
  topBarLeft: "סרגל עליון — טקסט משמאל",
  topBarRight: "סרגל עליון — טקסט מימין",
  headline: "כותרת",
  subheadline: "כותרת משנה",
  heroImage: "תמונת הירו",
  heroBackdropCircle: "עיגול צבע מאחורי התמונה (שדרוג עיצובי)",
  headerCta: "כפתור בראש העמוד",
  heroCta: "כפתור פעולה בהירו",
  navLinks: "קישורי ניווט",
  stats: "מספרים בולטים",
  body: "תוכן",
  authorName: "שם הממליץ",
  authorTitle: "תפקיד או תיאור",
  image: "תמונה",
  title: "כותרת",
  badge: "תגית",
  intro: "מבוא",
  question: "שאלה",
  answer: "תשובה",
  description: "תיאור",
  number: "מספר",
  featured: "מודגש",
  src: "כתובת תמונה",
  alt: "תיאור תמונה (alt)",
  name: "מזהה שדה",
  label: "תווית",
  type: "סוג שדה",
  network: "רשת",
  href: "קישור",
  placeholder: "טקסט מציין מקום",
  required: "חובה",
  email: "אימייל",
  phone: "טלפון",
  footerCredit: "קרדיט בפוטר",
  submitLabel: "טקסט כפתור שליחה",
  blocks: "בלוקים",
  items: "פריטים",
  cards: "כרטיסים",
  steps: "שלבים",
  paragraphs: "פסקאות",
  social: "רשתות חברתיות",
  formFields: "שדות טופס",
  value: "ערך",
  cta: "כפתור פעולה",
};

export function sectionContentFieldLabel(key: string): string {
  return LABELS[key] ?? key;
}

const TESTIMONIAL_LABELS: Record<string, string> = {
  headline: "כותרת",
  body: "תוכן ההמלצה",
  authorName: "שם הממליץ",
  authorTitle: "תפקיד או תואר",
  authorImage: "תמונת הממליץ",
  starRating: "דירוג (כוכבים)",
};

export function testimonialFieldLabel(key: string): string {
  return TESTIMONIAL_LABELS[key] ?? sectionContentFieldLabel(key);
}
