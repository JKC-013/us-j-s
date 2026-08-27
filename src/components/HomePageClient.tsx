"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutEngine } from "./LayoutEngine";
import { Page, Media } from "@prisma/client";

type PageWithMedia = Page & { media: Media[] };

export function HomePageClient({ pages }: { pages: PageWithMedia[] }) {
  const [pagesState, setPagesState] = useState<PageWithMedia[]>(pages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchPage, setSearchPage] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchPage.trim()) return;
    
    const pageNum = parseInt(searchPage, 10);
    if (!isNaN(pageNum)) {
      if (pageNum >= 1 && pageNum <= pagesState.length) {
        setCurrentIndex(pageNum - 1);
        setSearchPage("");
      } else {
        alert(`Page number must be between 1 and ${pagesState.length}`);
      }
    } else {
      alert("Please enter a valid page number");
    }
  };

  if (pagesState.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center z-10 h-full text-center">
        <div className="mx-auto p-14 max-w-4xl">
          <motion.h1 
            className="font-title text-7xl md:text-9xl tracking-widest mb-8 text-slate-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            Us
          </motion.h1>

          <motion.p 
            className="font-body text-2xl md:text-4xl text-slate-700 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 2 }}
          >
            Nothing has been written yet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 4 }}
          >
            <Link href="/create" className="font-title text-2xl md:text-4xl text-slate-900 hover:text-slate-600 transition-colors duration-700 tracking-wider">
              Create First Page
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentPage = pagesState[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < pagesState.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleDeletePage = async () => {
    if (!currentPage || isDeleting) return;
    const confirmed = confirm("Delete this page and its uploaded media? This cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/pages/${currentPage.id}`, { method: "DELETE" });
      if (res.ok) {
        setPagesState((current) => {
          const updated = current.filter((page) => page.id !== currentPage.id);
          const nextIndex = Math.max(0, Math.min(currentIndex, updated.length - 1));
          setCurrentIndex(nextIndex);
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to delete page", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Absolute Header Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 p-8 flex justify-between items-center glass-header">
        <div className="flex items-center gap-6 font-title text-xl font-semibold text-slate-900">
          <button 
            onClick={handlePrev} 
            className={`transition-opacity duration-1000 ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:opacity-70'}`}
          >
            ←
          </button>
          
          <div className="flex items-center gap-4">
            <span className="tracking-widest whitespace-nowrap">
              Page {(currentIndex + 1).toString().padStart(2, '0')} / {pagesState.length.toString().padStart(2, '0')}
            </span>
            <form onSubmit={handleSearch} className="flex items-center relative">
              <input 
                type="text" 
                value={searchPage}
                onChange={(e) => setSearchPage(e.target.value)}
                placeholder="Go to..."
                className="w-24 px-3 py-1 pr-8 bg-transparent border border-slate-300 rounded-full text-sm font-body text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 transition-colors"
              />
              <button 
                type="submit" 
                className="absolute right-2 text-slate-500 hover:text-slate-900 transition-colors"
                aria-label="Search page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </form>
          </div>

          <button 
            onClick={handleNext}
            className={`transition-opacity duration-1000 ${currentIndex === pagesState.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:opacity-70'}`}
          >
            →
          </button>
        </div>
        
        <h1 className="font-title text-3xl tracking-widest absolute left-1/2 -translate-x-1/2 text-slate-900">
          Us
        </h1>

        <div className="flex items-center gap-6">
          <Link href="/create" className="font-title text-xl tracking-wider font-semibold text-slate-900 hover:text-slate-700 transition-opacity duration-1000">
            Create Page
          </Link>
          <button
            onClick={handleDeletePage}
            disabled={isDeleting}
            className="font-title text-base tracking-wider text-[rgba(17,17,17,0.8)] hover:text-black transition-opacity duration-200 disabled:opacity-40"
          >
            {isDeleting ? 'Deleting…' : 'Delete Page'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-10"
        >
          <LayoutEngine 
            text={currentPage.text || ""} 
            mediaList={currentPage.media} 
            layoutSeed={currentPage.layoutSeed || currentPage.id} 
          />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
