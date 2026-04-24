import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FeedbackType = 'success' | 'error' | 'info' | 'confirm';

interface FeedbackState {
  isOpen: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface FeedbackContextType {
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  confirmAction: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
  closeFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedback, setFeedback] = useState<FeedbackState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const closeFeedback = useCallback(() => {
    setFeedback(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showSuccess = useCallback((title: string, message: string = '') => {
    setFeedback({ isOpen: true, type: 'success', title, message });
    setTimeout(closeFeedback, 3000); // Auto-close success after 3 seconds
  }, [closeFeedback]);

  const showError = useCallback((title: string, message: string = '') => {
    setFeedback({ isOpen: true, type: 'error', title, message });
    // Erros não fecham automaticamente para o usuário poder ler
  }, []);

  const showInfo = useCallback((title: string, message: string = '') => {
    setFeedback({ isOpen: true, type: 'info', title, message });
    setTimeout(closeFeedback, 4000);
  }, [closeFeedback]);

  const confirmAction = useCallback((title: string, message: string, onConfirm: () => void, confirmText: string = 'Confirmar') => {
    setFeedback({ isOpen: true, type: 'confirm', title, message, onConfirm, confirmText });
  }, []);

  return (
    <FeedbackContext.Provider value={{ showSuccess, showError, showInfo, confirmAction, closeFeedback }}>
      {children}
      
      <AnimatePresence>
        {feedback.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => feedback.type !== 'confirm' && closeFeedback()}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden"
            >
              {feedback.type !== 'confirm' && (
                <button 
                  onClick={closeFeedback}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div className="p-8 text-center flex flex-col items-center">
                {feedback.type === 'success' && (
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                )}
                {feedback.type === 'error' && (
                  <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                )}
                {feedback.type === 'info' && (
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                    <Info className="w-10 h-10" />
                  </div>
                )}
                {feedback.type === 'confirm' && (
                  <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
                    <Trash2 className="w-10 h-10" />
                  </div>
                )}

                <h3 className="text-xl font-black text-slate-900 mb-2">{feedback.title}</h3>
                {feedback.message && (
                  <p className="text-sm font-medium text-slate-500 mb-6">{feedback.message}</p>
                )}

                {feedback.type === 'confirm' ? (
                  <div className="w-full flex gap-3 mt-4">
                    <button 
                      onClick={closeFeedback}
                      className="flex-1 py-3 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => {
                        if (feedback.onConfirm) feedback.onConfirm();
                        closeFeedback();
                      }}
                      className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-500/20 transition-all"
                    >
                      {feedback.confirmText || 'Confirmar'}
                    </button>
                  </div>
                ) : (
                  feedback.type === 'error' && (
                    <button 
                      onClick={closeFeedback}
                      className="w-full py-3 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all mt-4"
                    >
                      Entendi
                    </button>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used within FeedbackProvider');
  return context;
}
