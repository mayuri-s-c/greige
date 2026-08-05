import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { useWarpStore } from '../store/warpStore';
import WarpIcon, { MicIcon } from './WarpIcon';
import FormattedText from './FormattedText';
import { CloseIcon, SendIcon } from './Icons';

const prompts = [
  { label: 'Summer cotton', query: 'Soft cotton under 200 GSM for summer shirts' },
  { label: 'Linen vs blend', query: 'Compare linen vs cotton-linen blend for resort' },
  { label: 'Navy workwear', query: 'What fabrics suit navy workwear trousers?' },
];

function messageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function WarpLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
      className="max-w-[92%] bg-stone px-3.5 py-3"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-9 w-9 items-center justify-center text-indigo">
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo/15" />
          <motion.span
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex h-8 w-8 items-center justify-center border border-indigo/25 bg-linen"
          >
            <WarpIcon className="h-4 w-4" />
          </motion.span>
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">
            Warp is thinking
          </p>
          <p className="mt-1 text-sm text-ink-soft">Reading the mill floor catalog…</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 pl-1">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-indigo"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: dot * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

const bubbleVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

const suggestionListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const suggestionItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function WarpPanel() {
  const open = useWarpStore((s) => s.open);
  const draft = useWarpStore((s) => s.draft);
  const openWarp = useWarpStore((s) => s.openWarp);
  const closeWarp = useWarpStore((s) => s.closeWarp);
  const clearDraft = useWarpStore((s) => s.clearDraft);
  const sessionEpoch = useWarpStore((s) => s.sessionEpoch);

  const welcomeMessage = {
    id: 'welcome',
    role: 'assistant',
    text: 'I am Warp — GREIGE’s AI sourcing assistant. Ask me anything about fabrics: GSM, weave, colorway, MOQ, or what to buy for a program.',
  };

  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionKey, setSuggestionKey] = useState(0);
  const listRef = useRef(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );

  useEffect(() => {
    setInput('');
    setListening(false);
    setMessages([welcomeMessage]);
    setBusy(false);
    setSuggestions([]);
    setSuggestionKey(0);
  }, [sessionEpoch]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (open && draft) {
      setInput(draft);
      clearDraft();
    }
  }, [open, draft, clearDraft]);

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [open]);

  useEffect(() => {
    if (!listening) return undefined;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setListening(false);
      return undefined;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    return () => recognition.stop();
  }, [listening]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, suggestions, suggestionKey]);

  async function send(message) {
    if (!message.trim() || busy) return;

    const userMessage = { id: messageId(), role: 'user', text: message.trim() };
    setMessages((m) => [...m, userMessage]);
    setInput('');
    setBusy(true);
    setSuggestions([]);

    try {
      const { data } = await api.post('/ai/chat', { message: message.trim(), mode: 'chat' });
      setMessages((m) => [
        ...m,
        {
          id: messageId(),
          role: 'assistant',
          text: data.reply || 'No response from Warp.',
        },
      ]);
      setSuggestions(data.products || []);
      setSuggestionKey((k) => k + 1);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: messageId(),
          role: 'assistant',
          text: 'Warp is briefly unavailable. Greige Floor search and filters still work fully.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const panel = (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => openWarp()}
          aria-label="Ask Warp AI assistant"
          title="Ask Warp — AI fabric assistant"
          className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 bg-indigo px-4 py-3 text-sm font-medium text-linen shadow-sm lg:inline-flex"
        >
          <WarpIcon className="h-4 w-4" />
          Ask Warp
          <span className="bg-linen/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            AI
          </span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close Warp overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-ink/35 backdrop-blur-[2px]"
              onClick={closeWarp}
            />
            <motion.aside
              initial={isMobile ? { y: '100%', opacity: 0.98 } : { x: 440, opacity: 0 }}
              animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
              exit={isMobile ? { y: '100%', opacity: 0.98 } : { x: 440, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-0 z-[60] flex h-[100dvh] max-h-[100dvh] w-full flex-col bg-linen md:inset-y-auto md:bottom-0 md:right-0 md:left-auto md:top-auto md:h-[min(720px,100dvh)] md:max-w-md md:border-l md:border-line"
            >
              <div className="relative overflow-hidden border-b border-line px-5 py-4">
                <div
                  className="absolute inset-0 opacity-90"
                  style={{
                    background: 'linear-gradient(120deg, #0f766e, #134e4a 55%, #0f172a)',
                  }}
                />
                <div className="relative flex items-start justify-between text-linen">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center border border-linen/25 bg-linen/10">
                      <WarpIcon className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display text-3xl leading-none">Warp</p>
                        <span className="bg-linen/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-linen">
                          AI
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-linen/70">
                        Ask anything — fabrics, GSM, weave, colorways, MOQ
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={closeWarp} className="inline-flex items-center gap-1.5 text-sm text-linen/80">
                    <CloseIcon className="h-4 w-4" />
                    Close
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto border-b border-line px-4 py-2 scroll-thin">
                <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                  Try
                </span>
                {prompts.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    disabled={busy}
                    title={p.query}
                    onClick={() => send(p.query)}
                    className="shrink-0 border border-line bg-white/50 px-2 py-1 text-[11px] font-medium text-ink-soft transition hover:border-indigo hover:text-indigo disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 scroll-thin">
                <AnimatePresence initial={false} mode="popLayout">
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      layout
                      variants={bubbleVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={`max-w-[92%] px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === 'user' ? 'ml-auto bg-indigo text-linen' : 'bg-stone text-ink'
                      }`}
                    >
                      {m.role === 'assistant' ? (
                        <FormattedText text={m.text} className="text-ink" />
                      ) : (
                        <span className="whitespace-pre-wrap">{m.text}</span>
                      )}
                    </motion.div>
                  ))}

                  {busy && <WarpLoader key="warp-loader" />}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {!busy && suggestions.length > 0 && (
                    <motion.div
                      key={`suggestions-${suggestionKey}`}
                      variants={suggestionListVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-2 border-t border-line pt-3"
                    >
                      <motion.div variants={suggestionItemVariants}>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                          Matched cloths
                        </p>
                      </motion.div>
                      {suggestions.map((p) => (
                        <motion.div key={p._id} variants={suggestionItemVariants}>
                          <Link
                            to={`/products/${p._id}`}
                            onClick={closeWarp}
                            className="block border border-line bg-white/50 px-3 py-2.5 transition hover:border-indigo"
                          >
                            <span className="font-medium">{p.name}</span>
                            <span className="mt-0.5 block text-xs text-ink-soft">
                              {p.category} · GSM {p.specifications?.gsm ?? '—'} · ₹{p.price}/{p.unit}
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <form
                className="shrink-0 border-t border-line bg-linen p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
              >
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      busy ? 'Warp is responding…' : 'Ask Warp anything — GSM, weave, colorway, MOQ…'
                    }
                    disabled={busy}
                    className="input-field flex-1 rounded-none disabled:opacity-60"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setListening(true)}
                    aria-label={listening ? 'Listening' : 'Voice input'}
                    title={listening ? 'Listening…' : 'Voice input'}
                    className={`inline-flex items-center justify-center gap-1.5 border px-3 text-sm disabled:opacity-50 ${
                      listening ? 'border-rust text-rust' : 'border-line text-ink-soft hover:border-indigo hover:text-ink'
                    }`}
                  >
                    {listening ? (
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <span className="absolute inset-0 animate-ping rounded-full bg-rust/30" />
                        <MicIcon className="relative h-4 w-4" />
                      </span>
                    ) : (
                      <MicIcon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{listening ? 'Listening' : 'Voice'}</span>
                  </button>
                  <button type="submit" disabled={busy || !input.trim()} className="btn-primary inline-flex min-w-[72px] items-center justify-center gap-1.5 disabled:opacity-50">
                    {busy ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-linen/30 border-t-linen" />
                    ) : (
                      <>
                        <SendIcon className="h-4 w-4" />
                        Send
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );

  return createPortal(panel, document.body);
}
