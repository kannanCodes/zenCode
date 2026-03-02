export interface CreateMentorInput {
     fullName: string;
     email: string;
     expertise: string[];
     experienceLevel: 'junior' | 'mid' | 'senior';
}