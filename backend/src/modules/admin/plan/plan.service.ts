import { PlanRepository } from "./plan.repository";
import { CreatePlanInput } from "./types/create-plan.input";
import { UpdatePlanInput } from "./types/update-plan.input";
import { AppError } from "../../../shared/utils/AppError";
import { STATUS_CODES } from "../../../shared/constants/status";

export class PlanService {
     private planRepo = new PlanRepository();

     async createPlan(data: CreatePlanInput) {
          const existingPlan = await this.planRepo.findByName(data.name);

          if (existingPlan) {
               throw new AppError(
                    'Plan with this name already exists',
                    STATUS_CODES.CONFLICT
               );
          }

          // Calculate durationInDays based on billing cycle and interval count
          const unitDays = data.billingCycle === 'monthly' ? 30 : 365;
          const durationInDays = unitDays * (data.intervalCount || 1);

          return this.planRepo.create({
               ...data,
               durationInDays
          } as any);
     }

     async updatePlan(planId: string, data: UpdatePlanInput) {
          const plan = await this.planRepo.findById(planId);

          if (!plan) {
               throw new AppError('Plan not found', STATUS_CODES.NOT_FOUND);
          }

          // Duplicate name check if name is being updated
          if (data.name && data.name !== plan.name) {
               const existingPlan = await this.planRepo.findByName(data.name);
               if (existingPlan) {
                    throw new AppError('Plan with this name already exists', STATUS_CODES.CONFLICT);
               }
          }

          // If billing cycle or intervalCount is updated, recalculate duration
          if (data.billingCycle || data.intervalCount) {
               const billingCycle = data.billingCycle || plan.billingCycle;
               const intervalCount = data.intervalCount !== undefined ? data.intervalCount : plan.intervalCount;
               const unitDays = billingCycle === 'monthly' ? 30 : 365;
               (data as any).durationInDays = unitDays * intervalCount;
          }

          const updatedPlan = await this.planRepo.updateById(planId, data);

          if (!updatedPlan) {
               throw new AppError('Failed to update plan', STATUS_CODES.INTERNAL_SERVER_ERROR);
          }

          return updatedPlan;
     }

     async getPlansForAdmin() {
          return this.planRepo.listAll();
     }

     async getActivePlans() {
          return this.planRepo.listActive();
     }

     async getPlanById(planId: string) {
          const plan = await this.planRepo.findById(planId);

          if (!plan) {
               throw new AppError('Plan not found', STATUS_CODES.NOT_FOUND);
          }

          return plan;
     }

     async togglePlanStatus(planId: string) {
          const plan = await this.planRepo.findById(planId);

          if (!plan) {
               throw new AppError('Plan not found', STATUS_CODES.NOT_FOUND);
          }

          const updatedPlan = await this.planRepo.updateById(planId, { isActive: !plan.isActive });

          if (!updatedPlan) {
               throw new AppError('Failed to toggle plan status', STATUS_CODES.INTERNAL_SERVER_ERROR);
          }

          return updatedPlan;
     }
}