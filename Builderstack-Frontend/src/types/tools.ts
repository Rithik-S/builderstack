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
}