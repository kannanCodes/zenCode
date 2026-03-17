import { Submission } from "./submission.model";

export class SubmissionRepository {

     async create(data: any) {
          return Submission.create(data);
     }

     async findById(id: string) {
          return Submission.findById(id);
     }

     async update(id: string, data: any) {
          return Submission.findByIdAndUpdate(id, data, { new: true });
     }

     async listByUser(userId: string) {
          return Submission.find({ userId }).sort({ createdAt: -1 });
     }
}