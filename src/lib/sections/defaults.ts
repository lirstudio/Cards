import {
  SECTION_KEYS,
  isLegacyNavHeroStatsKey,
  type SectionKey,
} from "./schemas";

const defaults: Record<SectionKey, Record<string, unknown>> = {
  site_header_nav: {
    logoText: "לוגו",
    navLinks: [],
    headerCta: { label: "דברו איתנו", href: "#contact" },
  },
  hero_image_split: {
    heroImage: "",
    headline:
      "שליטה פיננסית בעסק תוך 30 יום – בלי אקסלים, בלי ניחושים, ובלי להיות גאון במספרים",
    subheadline:
      "סדנה פרקטית לבעלי עסקים שרוצים להבין סוף־סוף מה קורה עם הכסף בעסק – ולבנות תמחור, תזרים ורווחיות שמחזיקים לאורך זמן.",
    heroCta: { label: "אני בפנים – תשריין לי מקום", href: "#contact" },
  },
  stats_highlight_row: {
    stats: [
      { value: "93%", label: "שיפור בתזרים תוך 90 יום" },
      { value: "388+", label: "עסקים מלווים אישית" },
      { value: "11", label: "שנות ניסיון" },
    ],
  },
  about_bio_qa: {
    image: "",
    blocks: [
      { title: "קצת עליי", body: "ניסיון מקצועי בליווי עסקים ובניית מודלים פיננסיים ברורים." },
      { title: "מה אני עושה?", body: "סדנאות, ליווי והכלה של בעלי עסקים בשפה פשוטה ומדויקת." },
      { title: "למה זה חשוב?", body: "כשיש שליטה במספרים – קל יותר לגדול, לגייס ולישון בשקט." },
    ],
  },
  split_three_qa_image: {
    image: "",
    blocks: [
      { title: "מי אנחנו?", body: "צוות שמתמחה בניהול פיננסי פרקטי לעסקים קטנים ובינוניים." },
      { title: "איך אנחנו עובדים?", body: "כלים פשוטים, דוגמאות מהשטח וליווי צמוד עד התוצאה." },
      { title: "למה זה שונה?", body: "פחות תיאוריה – יותר יישום מדוד שרואים בבנק." },
    ],
  },
  testimonials_row: {
    items: [
      {
        headline: "הרגשתי שהוא באמת מבין אותנו",
        body: "הסדנה סידרה לנו את תמחור ותזרים בצורה שאני יכול להחזיק מעצמי.",
        authorName: "דני כ.",
        authorTitle: "בעל עסק שירותים",
      },
      {
        headline: "סוף סוף בהירות",
        body: "ידענו איפה הכסף נעלם ומה לתקן כבר בחודש הראשון.",
        authorName: "מיכל ר.",
        authorTitle: "מנכ״לית סטארטאפ",
      },
      {
        headline: "מומלץ בחום",
        body: "שפה פשוטה, בלי פוזות. יצאנו עם תוכנית פעולה.",
        authorName: "יוסי א.",
        authorTitle: "יזם",
      },
    ],
  },
  center_richtext_cta: {
    title: "על הסדנה שלנו",
    paragraphs: [
      "רועי סבן מעביר סדנה פרקטית לבעלי עסקים שרוצים לקחת שליטה על הכסף בעסק – ולהפסיק לנהל לפי תחושת בטן.",
      "במהלך הסדנה נלמד איך לבנות תמחור נכון, להבין את התזרים, לזהות חורים ברווחיות ולתכנן קדימה בלי לחץ.",
      "בלי נוסחאות מסובכות ובלי בולשיט – כלים פשוטים שמביאים תוצאות.",
      "הסדנה מיועדת לבעלי עסקים קטנים ובינוניים, עצמאיים, ולכל מי שמרגיש שהוא עובד קשה – אבל לא רואה את הכסף.",
    ],
    cta: { label: "אני בפנים – תשריין לי מקום", href: "#contact" },
  },
  checklist_with_image: {
    title: "מה זה כולל?",
    image: "",
    items: [
      {
        title: "שיטת ניהול תזרים פשוטה ושימושית",
        description:
          "תבין סוף־סוף מה נכנס, מה יוצא, ומה באמת נשאר לך ביד – בלי כאב ראש ובלי אקסלים מסובכים.",
      },
      {
        title: "מודל תמחור חכם",
        description:
          "איך מתמחרים שירות או מוצר בצורה שמכסה הוצאות, שומרת על רווח – ומרגישה נכונה גם ללקוח.",
      },
      {
        title: "מפת רווחיות לעסק שלך",
        description:
          "תלמד לזהות איפה הכסף הולך לאיבוד ואיך לתקן את זה – כבר מהחודש הקרוב.",
      },
      {
        title: "תוכנית פעולה ל־30 הימים הקרובים",
        description:
          "יוצאים מהסדנה עם תוכנית מדויקת לביצוע – לא רק רעיונות, אלא פעולות ברורות ומדידות.",
      },
    ],
  },
  pricing_banner: {
    headline: "עלות ההשתתפות בסדנה 297₪ בלבד!",
    body: "מכיוון שזו שיטה פרקטית ופריצת דרך שכבר עזרה לבעלי עסקים רבים, מחיר ההשתתפות ל־250 הנרשמים הראשונים מוסדר ל־97₪ סימליים.",
    cta: { label: "אני בפנים – תשריין לי מקום", href: "#contact" },
  },
  services_grid: {
    badge: "שירותים",
    title: "השירותים שלנו",
    cards: [
      {
        title: "בניית אסטרטגיית תמחור ורווחיות",
        description: "מודל כלכלי לעסק – תמחור, עלויות קבועות־משתנות ויעד רווח.",
        featured: true,
      },
      {
        title: "ליווי פיננסי שוטף לעסקים",
        description: "ניהול תזרים, תקציב והחלטות יום־יום לפי נתונים.",
        number: "1",
      },
      {
        title: "הכנה לפגישות עם הבנק ורשויות",
        description: "תיעוד מסודר ו״סיפור עסקי״ שמייצג אותך נכון.",
        number: "3",
      },
      {
        title: "סדנאות והרצאות לעסקים וצוותים",
        description: "תוכן פרקטי לבעלי עסקים ולצוותים.",
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
    badge: "הסבר על הסדנה",
    title: "איך זה עובד?",
    intro: "תהליך קצר וברור – מרגיעה ועד תוכנית פעולה.",
    steps: [
      {
        title: "נרשמים בקלות",
        body: "נכנסים לקישור, בוחרים מועד שמתאים – ומקבלים גישה לכל חומרי הסדנה, כולל בונוסים וכלים שימושיים.",
      },
      {
        title: "הסדנה מועברת בזום",
        body: "הסדנה מועברת אונליין בשידור חי, עם ליווי צמוד, זמן לשאלות, ודוגמאות מהשטח – הכל בשפה פשוטה וברורה.",
      },
      {
        title: "תוכנית פעולה",
        body: "בתום הסדנה יוצאים עם כלים פרקטיים, תבניות לעסק ותוכנית מסודרת ליישום מיידי – בלי תלות באף אחד.",
      },
    ],
  },
  faq_accordion: {
    badge: "שאלות נפוצות",
    title: "תשובות לשאלות שלכם",
    items: [
      { question: "הסדנה מתאימה גם אם אני רק בתחילת הדרך?", answer: "כן. בנויה לשפה פשוטה ומתחילה מיסודות." },
      { question: "זה מתאים לעסק שאין לו רואה חשבון צמוד?", answer: "כן – מייצרים שקיפות וכלים גם בלעדיו." },
      { question: "כמה זמן נמשכת הסדנה?", answer: "משך קצר וממוקד – הפרטים נשלחים לאחר ההרשמה." },
      { question: "אני לא טוב במספרים – זה יעבוד גם בשבילי?", answer: "בדיוק בשביל זה בנינו את השיטה." },
      { question: "מה מקבלים אחרי הסדנה?", answer: "תבניות, רשימת פעולות וליווי חומרי." },
      { question: "האם אני חייב להשתתף בלייב או שיש הקלטה?", answer: "יש הרשמה ללייב; פרטי הקלטה יוצגו בהודעת הקבלה." },
    ],
  },
  contact_split_footer: {
    badge: "יצירת קשר",
    headline: "להרשמה השאירו פרטים ונחזור אליכם",
    social: [
      { network: "tiktok", href: "https://www.tiktok.com" },
      { network: "linkedin", href: "https://www.linkedin.com" },
      { network: "facebook", href: "https://www.facebook.com" },
      { network: "whatsapp", href: "https://wa.me/972547361477" },
      { network: "instagram", href: "https://www.instagram.com" },
      { network: "youtube", href: "https://www.youtube.com" },
    ],
    email: "liran@lirstudio.co.il",
    phone: "054-736-1477",
    submitLabel: "אני בפנים – תשריין לי מקום",
    footerCredit: "אפיון, עיצוב ופיתוח: lir",
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
