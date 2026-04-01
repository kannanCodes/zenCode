import { Plan } from "./plan.model";
import { CreatePlanInput } from "./types/create-plan.input";
import { UpdatePlanInput } from "./types/update-plan.input";

export class PlanRepository {
     async create(data: CreatePlanInput) {
          return Plan.create(data);
     }

     async findByName(name: string) {
          return Plan.findOne({ name, isArchived: false });
     }

     async findById(id: string) {
          return Plan.findOne({ _id: id, isArchived: false });
     }

     async updateById(id: string, data: UpdatePlanInput) {
          return Plan.findOneAndUpdate({ _id: id, isArchived: false }, data, { new: true });
     }

     async listActive() {
          return Plan.find({ isActive: true, isArchived: false }).sort({ price: 1 });
     }

     async listAll() {
          return Plan.find({ isArchived: false }).sort({ createdAt: -1 });
     }

     async findByStripePriceId(priceId: string) {
          return Plan.findOne({ stripePriceId: priceId, isArchived: false });
     }
}