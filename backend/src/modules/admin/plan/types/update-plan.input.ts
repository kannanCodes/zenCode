export interface UpdatePlanInput {
     name?: string;
     price?: number;
     durationInDays?: number;
     features?: string[];
     isActive?: boolean;
}