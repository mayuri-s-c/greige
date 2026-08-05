import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const steps = [
  { key: 'businessName', prompt: 'What is your business / mill name?' },
  { key: 'businessType', prompt: 'What type of business are you?' },
  { key: 'contactPhone', prompt: 'Best contact phone number?' },
  { key: 'operatingHours', prompt: 'What are your operating hours?' },
  { key: 'productCategories', prompt: 'Categories you offer? (comma-separated)', list: true },
  { key: 'fabricTypesOffered', prompt: 'Fabric types offered? (comma-separated)', list: true },
  { key: 'moq', prompt: 'What is your minimum order quantity (MOQ)?' },
];

export default function SupplierOnboardingPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');
  const markOnboarded = useAuthStore((s) => s.markOnboarded);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const navigate = useNavigate();
  const step = steps[index];

  async function next() {
    const value = step.list
      ? input.split(',').map((s) => s.trim()).filter(Boolean)
      : input.trim();
    const nextAnswers = { ...answers, [step.key]: value };
    setAnswers(nextAnswers);
    setInput('');

    if (index < steps.length - 1) {
      setIndex(index + 1);
      return;
    }

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
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Warp onboarding</p>
      <h1 className="mt-2 font-display text-4xl">Set up your mill profile</h1>
      <div className="mt-8 border border-line bg-stone/40 p-5">
        <p className="text-lg">{step.prompt}</p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mt-5 w-full border border-line bg-linen px-3 py-2"
        />
        <button
          type="button"
          onClick={next}
          disabled={!input.trim()}
          className="mt-4 w-full bg-indigo py-3 text-linen disabled:opacity-50"
        >
          {index === steps.length - 1 ? 'Open Mill Console' : 'Continue'}
        </button>
        <p className="mt-3 text-xs text-ink-soft">
          Step {index + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}
