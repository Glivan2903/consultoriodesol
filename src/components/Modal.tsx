import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div 
        ref={modalRef}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative z-10 animate-in zoom-in-95 fade-in duration-300 border border-white/20"
      >
        <div className="flex items-center justify-between p-8 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
