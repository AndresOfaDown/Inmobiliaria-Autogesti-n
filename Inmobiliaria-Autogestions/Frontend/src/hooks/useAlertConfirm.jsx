import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import '../components/AlertConfirmModal.css';

const ICON_MAP = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  question: HelpCircle
};

export const useAlertConfirm = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm'
    status: 'info', // 'success' | 'error' | 'warning' | 'info' | 'question'
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirm: null,
    onCancel: null
  });

  const showAlert = useCallback(({ title, message, status = 'info', confirmText = 'Entendido', onConfirm = null }) => {
    setModalState({
      isOpen: true,
      type: 'alert',
      status,
      title,
      message,
      confirmText,
      cancelText: '',
      onConfirm: () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: null
    });
  }, []);

  const showConfirm = useCallback(({ title, message, status = 'question', confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel = null }) => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      status,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
        if (onCancel) onCancel();
      }
    });
  }, []);

  const closeAlertConfirm = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const ModalComponent = modalState.isOpen
    ? createPortal(
        <div className="ac-modal-overlay" onClick={modalState.type === 'alert' ? modalState.onConfirm : undefined}>
          <div className="ac-modal-card" onClick={e => e.stopPropagation()}>
            {/* Icon */}
            {(() => {
              const IconComp = ICON_MAP[modalState.status] || Info;
              return (
                <div className={`ac-modal-icon-wrapper ac-modal-icon-wrapper--${modalState.status}`}>
                  <IconComp size={36} strokeWidth={2.2} />
                </div>
              );
            })()}

            {/* Title & Message */}
            <h3 className="ac-modal-title">{modalState.title}</h3>
            <p className="ac-modal-message">{modalState.message}</p>

            {/* Actions */}
            <div className="ac-modal-actions">
              {modalState.type === 'confirm' && (
                <button 
                  className="ac-btn ac-btn--cancel" 
                  onClick={modalState.onCancel}
                >
                  {modalState.cancelText}
                </button>
              )}
              <button 
                className={`ac-btn ac-btn--${
                  modalState.status === 'success' ? 'success' :
                  modalState.status === 'error' ? 'error' :
                  modalState.status === 'question' ? 'primary' : 'primary'
                }`}
                onClick={modalState.onConfirm}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return {
    showAlert,
    showConfirm,
    closeAlertConfirm,
    ModalComponent
  };
};

export default useAlertConfirm;
