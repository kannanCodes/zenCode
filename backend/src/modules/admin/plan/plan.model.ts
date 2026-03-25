import { Schema, model } from "mongoose";

const PlanSchema = new Schema(
     {
          name: {
               type: String,
               required: true,
               unique: true
          },

          price: {
               type: Number,
               required: true
          },

          durationInDays: {
               type: Number,
               required: true
          },

          features: {
               type: [String],
               default: []
          },
          
          isActive: {
               type: Boolean,
               default: true
          }
     },
     { timestamps: true }
);

PlanSchema.index({ isActive: 1 });

export const Plan = model("Plan", PlanSchema);