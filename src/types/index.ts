/**
 * Shared TypeScript interfaces and types used across the codebase.
 */

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  metaTitle?: string;
  metaDescription?: string;
  seoContent?: string;
}

export interface Tool {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  categorySlug: string;
  icon: string;
  featured: boolean;
  keywords: string[];
  metaTitle?: string;
  metaDescription?: string;
  adEligible?: boolean;
}

export interface MatchResult {
  text: string;
  index: number;
  length: number;
  groups: string[];
}

export interface ImageStats {
  name: string;
  originalSize: number;
  compressedSize: number;
  originalWidth: number;
  originalHeight: number;
  compressedWidth: number;
  compressedHeight: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
