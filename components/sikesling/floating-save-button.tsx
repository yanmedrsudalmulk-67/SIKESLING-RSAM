'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save } from 'lucide-react';

interface FloatingSaveButtonProps {
  onSave: () => Promise<void> | void;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  label?: string;
  title?: string;
}

export function FloatingSaveButton({
  onSave,
  hasUnsavedChanges = false,
  isSaving: externalIsSaving,
  label = 'Simpan Data',
  title = 'Simpan Data ke Aplikasi & Database Supabase',
}: FloatingSaveButtonProps) {
  const [jellyTick, setJellyTick] = useState<number>(0);
  const [internalSaving, setInternalSaving] = useState<boolean>(false);

  const isSaving = externalIsSaving !== undefined ? externalIsSaving : internalSaving;

  const handleClick = async () => {
    setJellyTick((t) => t + 1);
    setInternalSaving(true);
    try {
      await onSave();
    } finally {
      setInternalSaving(false);
    }
  };

  return (
    <div className="fixed bottom-24 lg:bottom-8 right-5 lg:right-8 z-40">
      <motion.button
        key={jellyTick}
        type="button"
        onClick={handleClick}
        disabled={isSaving}
        initial={{ scale: 1 }}
        animate={
          jellyTick > 0
            ? {
                scale: [1, 1.24, 0.84, 1.12, 0.95, 1.03, 1],
                rotate: [0, -3, 3, -1.5, 0],
              }
            : { scale: 1 }
        }
        whileHover={{
          scale: [1, 1.12, 0.93, 1.05, 0.98, 1],
          transition: { duration: 0.55, ease: 'easeInOut' },
        }}
        whileTap={{
          scale: 0.86,
          transition: { type: 'spring', stiffness: 600, damping: 12 },
        }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#002147] via-[#002E63] to-[#001835] text-white border-[1.5px] border-[#D2B48C] shadow-[0_10px_24px_rgba(0,33,71,0.34),inset_0_1px_2px_rgba(255,255,255,0.3)] cursor-pointer select-none"
        title={title}
      >
        {hasUnsavedChanges ? (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
        ) : null}
        <div className="w-6 h-6 rounded-full bg-[#D2B48C] text-[#002147] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
          <Save className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-extrabold tracking-wide text-white pr-1">
          {isSaving ? 'Menyimpan...' : label}
        </span>
      </motion.button>
    </div>
  );
}
