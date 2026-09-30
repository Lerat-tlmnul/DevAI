export type IntelligenceMode = 'rapide' | 'normal' | 'max';
export type DifficultyLevel = 'facile' | 'moyen' | 'difficile';

export type Subject = 
  | 'Général'
  | 'Mathématiques'
  | 'Français'
  | 'Physique-Chimie'
  | 'SVT'
  | 'Histoire-Géo'
  | 'Anglais'
  | 'Philosophie';

export interface HomeworkMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  subject?: Subject;
  difficulty?: DifficultyLevel;
  intelligence?: IntelligenceMode;
  timestamp: number;
}

export interface HomeworkSession {
  id: string;
  title: string;
  subject: Subject;
  difficulty: DifficultyLevel;
  intelligence: IntelligenceMode;
  date: string;
  messages: HomeworkMessage[];
}
