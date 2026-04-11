export type PageTheme = {
  primary?: string;
  background?: string;
  heading?: string;
  body?: string;
  /** לוגו מותאם לעמוד (Hero + פוטר); דורס את ברירת המחדל של המערכת כשמוגדר */
  siteLogoUrl?: string;
  /** כבת אנימציות אוטומטיות (מרקיז, ספירת מספרים); גלריה/המלצות כקרוסלה ידנית */
  noSectionAnimations?: boolean;
};

export type LandingPageRow = {
  id: string;
  user_id: string;
  template_id: string | null;
  slug: string;
  title: string;
  status: "draft" | "published";
  published_at: string | null;
  theme: PageTheme;
  created_at: string;
  updated_at: string;
};

export type PageSectionRow = {
  id: string;
  landing_page_id: string;
  section_key: string;
  sort_order: number;
  content: Record<string, unknown>;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

export type TemplateRow = {
  id: string;
  slug: string;
  name_he: string;
  tier: number;
  preview_image_url: string | null;
  default_section_keys: string[];
  created_at: string;
};
