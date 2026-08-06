import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const steps = [
  { key: 'businessName', prompt: 'What is your business / mill name?' },
  { key: 'businessType', prompt: 'What type of business are you?' },
  { key: 'contactPhone', prompt: 'Best contact phone number?' },
  { key: 'operatingHours', prompt: 'What are your operating hours?' },
  {
    key: 'productCategories',
    prompt: 'Categories you offer? (comma-separated)',
    list: true,
    skippable: true,
    hint: 'Optional — you can add categories later in Mill profile.',
  },
  {
    key: 'fabricTypesOffered',
    prompt: 'Fabric types offered? (comma-separated)',
    list: true,
    skippable: true,
    hint: 'Optional — you can update fabric types anytime after setup.',
  },
  { key: 'moq', prompt: 'What is your minimum order quantity (MOQ)?' },
];

export default function SupplierOnboardingPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const markOnboarded = useAuthStore((s) => s.markOnboarded);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const navigate = useNavigate();
  const step = steps[index];

  async function advance(value) {
    const nextAnswers = { ...answers, [step.key]: value };
    setAnswers(nextAnswers);
    setInput('');

    if (index < steps.length - 1) {
      setIndex(index + 1);
      return;
    }

    setSaving(true);
    try {
      await api.put('/profiles/supplier', {
        ...nextAnswers,
        address: {
          line1: 'To be updated',
          city: '',
          state: '',
          country: 'India',
          postalCode: '',
        },
        completeOnboarding: true,
      });
      markOnboarded();
      await refreshMe();
      navigate('/supplier');
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    if (saving) return;
    const value = step.list
      ? input.split(',').map((s) => s.trim()).filter(Boolean)
      : input.trim();
    if (!step.skippable && !(Array.isArray(value) ? value.length : value)) return;
    await advance(value);
  }

  async function skip() {
    if (saving || !step.skippable) return;
    await advance(step.list ? [] : '');
  }

  const canContinue = step.skippable || Boolean(input.trim());

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Warp onboarding</p>
      <h1 className="mt-2 font-display text-4xl">Set up your mill profile</h1>
      <div className="mt-8 border border-line bg-stone/40 p-5">
        <p className="text-lg">{step.prompt}</p>
        {step.hint ? <p className="mt-2 text-sm text-ink-soft">{step.hint}</p> : null}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              next();
            }
          }}
          placeholder={step.skippable ? 'Optional — or skip for now' : undefined}
          className="input-field mt-5"
        />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={next}
            disabled={!canContinue || saving}
            className="btn-accent flex-1 py-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? 'Saving…'
              : index === steps.length - 1
                ? 'Open Mill Console'
                : 'Continue'}
          </button>
          {step.skippable ? (
            <button
              type="button"
              onClick={skip}
              disabled={saving}
              className="btn-secondary flex-1 py-3 disabled:opacity-50"
            >
              Skip for now
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          Step {index + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}
