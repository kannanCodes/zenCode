import { PlanRepository } from "./plan.repository";
import { CreatePlanInput } from "./types/create-plan.input";
import { UpdatePlanInput } from "./types/update-plan.input";
import { AppError } from "../../../shared/utils/AppError";
import { STATUS_CODES } from "../../../shared/constants/status";

export class PlanService {

     private _planrepo = new PlanRepository();

     async createPlan(data: CreatePlanInput) {

          const existingPlan = await this._planrepo.findById(data.name);

          if (existingPlan) {
               throw new AppError(
                    'Plan with this name already exists',
                    STATUS_CODES.CONFLICT
               );
          }

          return this._planrepo.create(data);
     }

     async updatePlan(planId: string, data: UpdatePlanInput) {

          const plan = await this._planrepo.updateById(planId,data);

          if (!plan){
               throw new AppError(
                    'Plan not found',
                    STATUS_CODES.NOT_FOUND
               );
          }

          return plan;
     }

     async getPlansForAdmin(){
          return this._planrepo.listAll();
     }

     async getActivePlans(){
          return this._planrepo.listActive();
     }
}