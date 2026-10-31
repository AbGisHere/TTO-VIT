export type SectionBlockType = 'text' | 'bullets' | 'image' | 'two-images' | 'text-with-image';

export interface ContentBlock {
  id: string;
  type: SectionBlockType;
  title?: string; // Optional figure subtitle (blank by default)
  content?: string; // Text or html
  bulletPoints?: string[]; // Array of bullet items
  imageUrl?: string; // Main image
  secondaryImageUrl?: string; // For two-images layout
  imageCaption?: string; // Optional caption (blank by default)
  imageFit?: 'width' | 'height' | 'contain' | 'cover'; // default 'width' (fit to width)
  imageZoom?: number; // default 100 (percentage zoom)
  placeholderHeight?: number; // Optional placeholder container height in px (0 or undefined = auto)
}

export interface BriefSection {
  id: string;
  title: string;
  headerBgColor?: string; // default "#52d1dc"
  headerTextColor?: string; // default "#000000"
  columnSpan: 1 | 2; // 1 = half column, 2 = full width
  columnPosition?: 'left' | 'right'; // Which column for half-width sections
  page?: number;
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

export interface BriefWatermark {
  enabled: boolean;
  text: string; // newlines split the stamp onto multiple lines
  color: string;
}

export interface TechnologyBriefData {
  id?: string;
  techId: string;
  title: string;
  titleBannerBgColor?: string;
  summary?: string; // short public description shown to signed-out visitors
  domains: string[];
  applications: string[];
  trlLevel: number;
  patentStatus: string;
  patentApplicationNo?: string;
  priorityDate?: string;
  leadInventor: string;
  inventorDesignation: string;
  coInventors?: string[];
  sections: BriefSection[];
  contactInfo: ContactInfo;
  createdAt?: any;
  updatedAt?: any;
  createdByEmail?: string;
  pdfUrl?: string;
  watermark?: BriefWatermark;
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
