import { Schema, model, Types } from "mongoose";
import { SubmissionStatus } from "./submission.enum";

const TestResultSchema = new Schema(
  {
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    error: String,
  },
  { _id: false }
);

const SubmissionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    problemId: {
      type: Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    sourceCode: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
      default: SubmissionStatus.PENDING,
    },

    stdout: String,
    stderr: String,
    compile_output: String,

    time: String,
    memory: Number,

    testResults: [TestResultSchema],
  },
  { timestamps: true }
);

SubmissionSchema.index({ userId: 1, problemId: 1 });

export const Submission = model("Submission", SubmissionSchema);