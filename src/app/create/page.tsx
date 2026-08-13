"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Butterflies } from "@/components/Butterflies";

export default function CreatePage() {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };
  const [step, setStep] = useState(0);
  const [folderUrl, setFolderUrl] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto advance from ceremony text to form
  if (step === 0) {
    setTimeout(() => {
      setStep(1);
    }, 4000);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderUrl, text }),
      });
      
      if (res.ok) {
        // Wait a moment to feel ceremonial
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden text-slate-900">
      <Butterflies />

      <div className="relative z-10 w-full max-w-6xl px-4 py-10 sm:px-8">
        <button
          onClick={handleBack}
          aria-label="Back"
          className="absolute left-6 top-6 z-20 glass-back-btn hover:brightness-105"
        >
          ←
        </button>
        <div className="mx-auto w-full">
          <div className="glass-panel p-10 mx-auto rounded-[48px]">
            <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
                className="text-center text-slate-900"
              >
                <h2 className="font-title text-4xl md:text-6xl font-semibold tracking-[0.2em] uppercase leading-tight">
                  What memories should this page hold?
                </h2>
              </motion.div>
            )}

            {step === 1 && (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.5 }}
                className="flex flex-col w-full gap-10 text-center"
              >
                <div className="flex flex-col gap-4">
                  <label htmlFor="folderUrl" className="font-title text-xl tracking-wider font-semibold text-slate-900">
                    Choose a Google Drive folder
                  </label>
                  <input
                    id="folderUrl"
                    type="url"
                    required
                    value={folderUrl}
                    onChange={(e) => setFolderUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="rounded-3xl glass-input px-5 py-4 text-center font-body text-lg font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-colors"
                  />
                  <p className="text-sm font-medium text-slate-700">
                    Paste a shared Google Drive folder URL. Real media loads when the server has a Drive API key or service account configured.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <label htmlFor="text" className="font-title text-xl tracking-wider font-semibold text-slate-900">
                    Write your story
                  </label>
                  <textarea
                    id="text"
                    required
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    placeholder="June 14. We walked for hours..."
                    className="min-h-[220px] rounded-3xl glass-textarea p-4 text-center font-body text-lg font-medium text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-colors resize-none placeholder:text-slate-500 leading-loose"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`font-title text-2xl font-semibold tracking-[0.22em] mt-8 rounded-full glass-button transition-all duration-300 ${isSubmitting ? 'opacity-0' : 'opacity-100 hover:brightness-105'}`}
                >
                  Create Page
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
