export interface ContentLink { path: string; label: string }
export interface Decision { question: string; answer: string; links: ContentLink[] }
export interface ContentSection { heading: string; paragraphs: string[]; links?: ContentLink[] }
export interface ContentPage {
  path: string;
  kind: "hub" | "workflow";
  title: string;
  heading: string;
  description: string;
  intro: string;
  audience: string;
  intent: string;
  hub: "study-assignment" | "documents" | "writing" | "reference";
  primaryHub?: string;
  uniqueValue: string;
  decisionHeading: string;
  decisions: Decision[];
  sections: ContentSection[];
  example: { input: string; output: string };
  limitations: string[];
  related: ContentLink[];
}
export const toolLink = (slug: string, label: string): ContentLink => ({ path: `/tools/${slug}/`, label });
export const workflowLink = (slug: string, label: string): ContentLink => ({ path: `/workflows/${slug}/`, label });
