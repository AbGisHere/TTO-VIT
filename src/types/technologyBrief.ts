export type SectionBlockType = 'text' | 'bullets' | 'image' | 'two-images' | 'text-with-image';

export interface ContentBlock {
  id: string;
  type: SectionBlockType;
  title?: string; // Optional sub-heading (e.g. "Synergistic Enhancement of Vitamin B12...")
  content?: string; // Text or markdown/html with bold tags
  bulletPoints?: string[]; // Array of bullet items
  imageUrl?: string; // Main image
  secondaryImageUrl?: string; // For two-images layout (e.g. chart + product photo)
  imageCaption?: string;
}

export interface BriefSection {
  id: string;
  title: string;
  headerBgColor?: string; // default "#52d1dc"
  headerTextColor?: string; // default "#000000"
  columnSpan: 1 | 2; // 1 = half width (left or right column), 2 = full width
  page?: 1 | 2 | 3;
  blocks: ContentBlock[];
}

export interface ContactInfo {
  name: string;
  title: string;
  department: string;
  institution: string;
  email: string;
  phoneOffice: string;
  phoneMobile: string;
  website: string;
}

export interface TechnologyBriefData {
  id?: string;
  techId: string; // e.g. "2024VITTTO73"
  title: string; // e.g. "Natural Vitamin B12 Fortification in Fermented Foods"
  titleBannerBgColor?: string; // default "#76cb3c" (institutional green)
  summary?: string; // short public description shown to signed-out visitors
  domains: string[]; // e.g. ["Food Biotechnology", "Fermentation Microbiology"]
  applications: string[]; // e.g. ["Staple Batter Enrichment", "Bakery Products"]
  trlLevel: number; // 1 - 9
  patentStatus: string; // e.g. "Patent Pending", "Granted", "Published"
  patentApplicationNo?: string;
  priorityDate?: string;
  leadInventor: string; // e.g. "Dr. Krishnan Venkataraman"
  inventorDesignation: string; // e.g. "Professor, Centre for Bio Separation Technology (CBST), VIT Vellore"
  coInventors?: string[];
  sections: BriefSection[];
  contactInfo: ContactInfo;
  createdAt?: any;
  updatedAt?: any;
  createdByEmail?: string;
  pdfUrl?: string;
  published: boolean;
}

export type UserRole = 'vit_student' | 'faculty' | 'outside_user' | 'tb_admin' | 'master_admin';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  domain: 'vitstudent' | 'vit' | 'outside';
}

export type SubmissionKind = 'idea' | 'problem_statement';

export interface Submission {
  id?: string;
  kind: SubmissionKind;
  title: string;
  domain: string;
  description: string;
  problemStatementId?: string; // set when the idea responds to a listed industry problem statement
  submittedByUid: string;
  submittedByEmail: string;
  submittedByName: string;
  createdAt: string;
}
