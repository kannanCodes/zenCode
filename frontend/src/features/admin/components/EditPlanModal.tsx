import { useState, } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { planService, type Plan, type UpdatePlanInput } from '../services/plan.service';
import { showSuccess, showError } from '../../../shared/utils/toast.util';

const updatePlanSchema = z.object({
  name: z.string().min(3, 'Plan name must be at least 3 characters'),
  price: z.number().min(0, 'Price must be non-negative'),
  billingCycle: z.enum(['monthly', 'yearly']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type FormData = z.infer<typeof updatePlanSchema>;

interface EditPlanModalProps {
  plan: Plan;
  onClose: () => void;
  onSave: () => void;
}

const EditPlanModal = ({ plan, onClose, onSave }: EditPlanModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [features, setFeatures] = useState(plan.access);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: {
      name: plan.name,
      price: plan.price,
      billingCycle: plan.billingCycle,
      description: plan.description,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const updateData: UpdatePlanInput = {
        ...data,
        access: features,
      };

      await planService.updatePlan(plan._id, updateData);
      showSuccess('Plan updated successfully');
      onSave();
    } catch (error) {
      showError('Failed to update plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeatureToggle = (feature: keyof typeof features) => {
    setFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0f0f0f] border-b border-[#2a2d3a] p-6 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Edit Plan Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Plan Name */}
          <div>
            <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
              Plan Name
            </label>
            <input
              {...register('name')}
              type="text"
              className={`w-full rounded-lg bg-[#1a1a1a] border ${
                errors.name ? 'border-red-500' : 'border-[#2a2d3a]'
              } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4`}
            />
            {errors.name && (
              <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>
            )}
          </div>

          {/* Price & Billing Cycle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                Price (INR)
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                placeholder="₹ 899"
                className={`w-full rounded-lg bg-[#1a1a1a] border ${
                  errors.price ? 'border-red-500' : 'border-[#2a2d3a]'
                } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4`}
              />
              {errors.price && (
                <span className="text-red-500 text-sm mt-1">{errors.price.message}</span>
              )}
            </div>

            <div>
              <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                Billing Cycle
              </label>
              <select
                {...register('billingCycle')}
                className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4"
                disabled
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="flex items-center gap-1.5 mt-1.5">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
                </svg>
                <span className="text-gray-500 text-xs">Locked (requires Stripe price ID change)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className={`w-full rounded-lg bg-[#1a1a1a] border ${
                errors.description ? 'border-red-500' : 'border-[#2a2d3a]'
              } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all p-4`}
            />
            {errors.description && (
              <span className="text-red-500 text-sm mt-1">{errors.description.message}</span>
            )}
          </div>

          {/* Feature Configuration */}
          <div>
            <label className="text-white text-sm font-medium uppercase tracking-wide block mb-3">
              Feature Configuration
            </label>
            <div className="bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Access to Premium Problems</div>
                  <div className="text-gray-500 text-xs">Full library of 2000+ curated algorithmic challenges</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('premiumProblems')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    features.premiumProblems ? 'bg-[var(--color-primary)]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      features.premiumProblems ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">AI Hints for Premium Problems</div>
                  <div className="text-gray-500 text-xs">Intelligent contextual hints powered by GPT-4 models</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('aiHints')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    features.aiHints ? 'bg-[var(--color-primary)]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      features.aiHints ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#2a2d3a]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-[#2a2d3a] text-white hover:bg-[#1a1a1a] transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-11 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlanModal;