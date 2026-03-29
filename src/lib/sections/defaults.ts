import {
  SECTION_KEYS,
  isLegacyNavHeroStatsKey,
  type SectionKey,
} from "./schemas";

const defaults: Record<SectionKey, Record<string, unknown>> = {
  site_header_nav: {
    logoText: "לוגו",
    navLinks: [],
    headerCta: { label: "טקסט כפתור", href: "#contact" },
  },
  hero_image_split: {
    heroImage: "",
    headline: "כותרת ראשית",
    subheadline: "כותרת משנה או פסקת משנה.",
    heroCta: { label: "טקסט כפתור", href: "#contact" },
    heroBackdropCircle: false,
  },
  stats_highlight_row: {
    stats: [
      { value: "0", label: "תווית 1" },
      { value: "0", label: "תווית 2" },
      { value: "0", label: "תווית 3" },
    ],
  },
  about_bio_qa: {
    image: "",
    blocks: [
      { title: "כותרת 1", body: "טקסט 1" },
      { title: "כותרת 2", body: "טקסט 2" },
      { title: "כותרת 3", body: "טקסט 3" },
    ],
  },
  split_three_qa_image: {
    image: "",
    blocks: [
      { title: "כותרת 1", body: "טקסט 1" },
      { title: "כותרת 2", body: "טקסט 2" },
      { title: "כותרת 3", body: "טקסט 3" },
    ],
  },
  testimonials_row: {
    items: [
      {
        headline: "כותרת 1",
        body: "טקסט המלצה 1",
        authorName: "שם 1",
        authorTitle: "תפקיד 1",
      },
      {
        headline: "כותרת 2",
        body: "טקסט המלצה 2",
        authorName: "שם 2",
        authorTitle: "תפקיד 2",
      },
      {
        headline: "כותרת 3",
        body: "טקסט המלצה 3",
        authorName: "שם 3",
        authorTitle: "תפקיד 3",
      },
    ],
  },
  center_richtext_cta: {
    title: "כותרת",
    paragraphs: ["פסקה 1", "פסקה 2", "פסקה 3", "פסקה 4"],
    cta: { label: "טקסט כפתור", href: "#contact" },
  },
  checklist_with_image: {
    title: "כותרת",
    image: "",
    items: [
      {
        title: "פריט 1",
        description: "תיאור 1",
      },
      {
        title: "פריט 2",
        description: "תיאור 2",
      },
      {
        title: "פריט 3",
        description: "תיאור 3",
      },
      {
        title: "פריט 4",
        description: "תיאור 4",
      },
    ],
  },
  pricing_banner: {
    headline: "כותרת מחיר",
    body: "טקסט הסבר.",
    cta: { label: "טקסט כפתור", href: "#contact" },
  },
  services_grid: {
    badge: "תגית",
    title: "כותרת",
    cards: [
      {
        title: "כותרת כרטיס 1",
        description: "תיאור 1",
        featured: true,
      },
      {
        title: "כותרת כרטיס 2",
        description: "תיאור 2",
        number: "1",
      },
      {
        title: "כותרת כרטיס 3",
        description: "תיאור 3",
        number: "3",
      },
      {
        title: "כותרת כרטיס 4",
        description: "תיאור 4",
        number: "4",
      },
    ],
  },
  gallery_row: {
    images: [
      { src: "", alt: "" },
      { src: "", alt: "" },
      { src: "", alt: "" },
      { src: "", alt: "" },
    ],
  },
  how_it_works_blue: {
    badge: "תגית",
    title: "כותרת",
    intro: "טקסט מבוא.",
    steps: [
      {
        title: "שלב 1",
        body: "תיאור שלב 1",
      },
      {
        title: "שלב 2",
        body: "תיאור שלב 2",
      },
      {
        title: "שלב 3",
        body: "תיאור שלב 3",
      },
    ],
  },
  faq_accordion: {
    badge: "תגית",
    title: "כותרת",
    items: [
      { question: "שאלה 1", answer: "תשובה 1" },
      { question: "שאלה 2", answer: "תשובה 2" },
      { question: "שאלה 3", answer: "תשובה 3" },
      { question: "שאלה 4", answer: "תשובה 4" },
      { question: "שאלה 5", answer: "תשובה 5" },
      { question: "שאלה 6", answer: "תשובה 6" },
    ],
  },
  contact_split_footer: {
    badge: "תגית",
    headline: "כותרת טופס",
    social: [
      { network: "tiktok", href: "https://example.com" },
      { network: "linkedin", href: "https://example.com" },
      { network: "facebook", href: "https://example.com" },
      { network: "whatsapp", href: "https://example.com" },
      { network: "instagram", href: "https://example.com" },
      { network: "youtube", href: "https://example.com" },
    ],
    email: "mail@example.com",
    phone: "050-000-0000",
    submitLabel: "שלח",
    footerCredit: "קרדיט פוטר",
    formFields: [
      { name: "full_name", label: "שם מלא", type: "text", required: true },
      { name: "email", label: "אימייל", type: "email", required: true },
      {
        name: "phone",
        label: "טלפון",
        type: "tel",
        placeholder: "050-000-0000",
        required: false,
      },
      { name: "message", label: "הודעה", type: "textarea", required: false },
    ],
  },
};

export function getDefaultContent(key: SectionKey): Record<string, unknown> {
  return structuredClone(defaults[key]) as Record<string, unknown>;
}

/** תוכן ברירת מחדל לתצוגה מקדימה באדמין (כולל מפתח legacy שלא ב־SECTION_KEYS) */
export function getDefaultContentForAdminPreview(sectionKey: string): Record<string, unknown> {
  if (isLegacyNavHeroStatsKey(sectionKey)) {
    return getDefaultContent("hero_image_split");
  }
  if (SECTION_KEYS.includes(sectionKey as SectionKey)) {
    return getDefaultContent(sectionKey as SectionKey);
  }
  return {};
}
