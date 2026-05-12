import { ReactNode } from "react";

export interface Tool {
  description: ReactNode;
  id: number;
  name: string;
  slug: string;
  short_description: string;
  category: string;
  pricing_model: string;
  budget_level: string;
  rating: number;
  active_users_count: number;
  supported_os: string[];
  website_link: string;
  affiliate_link?: string;
  is_sponsored: boolean;
  launched_year: number;
  // Rich display fields (added in migration 004)
  rank_in_category: number;
  tags: string[];
  pros: string[];
  cons: string[];
  for_you_text: string;
  logo_bg: string;
  logo_letter: string;
  price_display: string;
  users_display: string;
  last_updated_label: string;
}
