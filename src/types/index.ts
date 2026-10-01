export type SectionId =
  | 'hero'
  | 'about'
  | 'skills'
  | 'services'
  | 'projects'
  | 'experience'
  | 'education'
  | 'certificates'
  | 'resume'
  | 'reviews'
  | 'contact'
  | 'footer';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  category:
  | "Mobile Development"
  | "Web Development"
  | "Mobile & Web"
  | "UI/UX Design"
  | "Creative";
  image: string;
  tags: string[];
  githubUrl: string;
  demoUrl: string;
  featured: boolean;
  metrics?: string;
}

export interface SkillItem {
  name: string;
  level: number;
  iconName: string;
  description: string;
  highlight?: boolean;
}

export interface SkillCategory {
  title: string;
  categoryKey: 'frontend' | 'backend' | 'programming' | 'tools';
  skills: SkillItem[];
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  deliverables: string[];
  badge: string;
}

export interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  company: string;
  location: string;
  description: string[];
  techStack: string[];
  isCurrent?: boolean;
}

export interface EducationItem {
  id: string;
  period: string;
  degree: string;
  institution: string;
  grade: string;
  highlights: string[];
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  credentialUrl: string;
  image: string;
  skills: string[];
}

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface RobotState {
  section: SectionId;
  isWaving: boolean;
  isHappy: boolean;
  isBlinking: boolean;
  waveCount: number;
  celebrationCount: number;
}
