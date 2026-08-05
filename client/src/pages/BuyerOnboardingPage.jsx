import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

const steps = [
  {
    key: 'businessType',
    prompt: 'What type of business are you sourcing for?',
    placeholder: 'e.g. Apparel brand, garment exporter',
  },
  {
    key: 'industry',
    prompt: 'Which industry best fits you?',
    placeholder: 'e.g. Fashion, home, workwear',
  },
  {
    key: 'categoriesOfInterest',
    prompt: 'Product categories of interest? (comma-separated)',
    placeholder: 'Cotton, Linen, Blends',
    list: true,
  },
  {
    key: 'preferredFabricTypes',
    prompt: 'Preferred fabric types? (comma-separated)',
    placeholder: 'Poplin, Jersey, Twill',
    list: true,
  },
  {
    key: 'typicalOrderQuantity',
    prompt: 'Typical order quantity?',
    placeholder: '500-2000 meters',
  },
  {
    key: 'budgetRange',
    prompt: 'Budget range per meter?',
    placeholder: '₹150-600 / meter',
  },
];

export default function BuyerOnboardingPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const markOnboarded = useAuthStore((s) => s.markOnboarded);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const navigate = useNavigate();

  const step = steps[index];

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    setListening(true);
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

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

    await api.put('/profiles/buyer', { ...nextAnswers, completeOnboarding: true });
    markOnboarded();
    await refreshMe();
    navigate('/');
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Warp onboarding</p>
      <h1 className="mt-2 font-display text-4xl">Tell me how you source</h1>
      <div className="mt-8 border border-line bg-stone/40 p-5">
        <p className="text-sm text-ink-soft">Warp</p>
        <p className="mt-2 text-lg">{step.prompt}</p>
        <div className="mt-5 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={step.placeholder}
            className="flex-1 border border-line bg-linen px-3 py-2"
          />
          <button type="button" onClick={startVoice} className="border border-line px-3 text-sm">
            {listening ? 'Listening…' : 'Voice'}
          </button>
        </div>
        <button
          type="button"
          onClick={next}
          disabled={!input.trim()}
          className="mt-4 w-full bg-indigo py-3 text-linen disabled:opacity-50"
        >
          {index === steps.length - 1 ? 'Enter Greige Floor' : 'Continue'}
        </button>
        <p className="mt-3 text-xs text-ink-soft">
          Step {index + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}
