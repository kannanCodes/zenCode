export interface CreatePlanInput {
     name: string;
     price: number;
     durationInDays: number;
     features?: string[];
}