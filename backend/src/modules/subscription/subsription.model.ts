import { Schema, model, Types } from "mongoose";

const SubscriptionSchema = new Schema(
     {
          userId: {
               type: Types.ObjectId,
               ref: "User",
               required: true,
               index: true,
          },

          planId: {
               type: Types.ObjectId,
               ref: "Plan",
               required: true,
          },

          stripeCustomerId: {
               type: String,
               required: true,
          },

          stripeSubscriptionId: {
               type: String,
               required: true,
               unique: true, 
          },

          status: {
               type: String,
               enum: ["active", "cancelled", "expired"],
               default: "active",
          },

          startDate: {
               type: Date,
               required: true,
          },

          endDate: {
               type: Date,
               required: true,
          },
     },
     { timestamps: true }
);


SubscriptionSchema.index({ userId: 1, status: 1 });

export const Subscription = model("Subscription", SubscriptionSchema);