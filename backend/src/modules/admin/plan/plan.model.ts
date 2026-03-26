import { Schema, model } from "mongoose";

const PlanSchema = new Schema(
     {
          name: {
               type: String,
               required: true,
               unique: true,
               trim: true
          },

          price: {
               type: Number,
               required: true,
               min: 0
          },

          billingCycle: {
               type: String,
               enum: ['monthly', 'yearly'],
               default: 'monthly'
          },

          intervalCount: {
               type: Number,
               default: 1
          },

          durationInDays: {
               type: Number,
               required: true,
               min: 1
          },

          description: {
               type: String,
               required: true
          },

          features: {
               type: [
                    {
                         name: { type: String, required: true },
                         description: { type: String },
                         enabled: { type: Boolean, default: true }
                    }
               ],
               default: []
          },

          access: {
               mentorBooking: { type: Boolean, default: false },
               premiumProblems: { type: Boolean, default: false },
               aiHints: { type: Boolean, default: false }
          },

          stripeProductId: {
               type: String,
               required: true
          },

          stripePriceId: {
               type: String,
               required: true
          },

          isActive: {
               type: Boolean,
               default: true
          },

          isArchived: {
               type: Boolean,
               default: false
          }
     },
     { timestamps: true }
);

PlanSchema.index({ name: 1 });
PlanSchema.index({ isActive: 1 });
PlanSchema.index({ isArchived: 1 });
PlanSchema.index({ stripeProductId: 1 });
PlanSchema.index({ stripePriceId: 1 });

export const Plan = model("Plan", PlanSchema);