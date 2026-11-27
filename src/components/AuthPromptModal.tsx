import React from 'react';
import { LogIn, X } from 'lucide-react';
import { FOUNDATION_LOGO } from '../data/foundationData';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignIn: () => void;
  authError: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  onConfirmSignIn,
  authError,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={FOUNDATION_LOGO}
              alt="โลโก้มูลนิธิร่วมกุศลสมุทรปราการ"
              className="w-10 h-10 object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ยืนยันตัวตนด้วยบัญชี Google
              </h3>
              <p className="text-xs text-slate-500">
                มูลนิธิร่วมกุศลสมุทรปราการ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          เพื่อความปลอดภัยของข้อมูลและช่วยให้คุณติดตามสถานะการบริจาค การจองคิวฝังเข็ม
          การอบรม CPR หรือการแจ้งเหตุฉุกเฉินได้ตลอดเวลา กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google
        </p>

        {authError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
            {authError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg"
          >
            ไว้ภายหลัง
          </button>
          <button
            type="button"
            onClick={onConfirmSignIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D4294] hover:bg-[#163375] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <LogIn className="w-4 h-4" />
            เข้าสู่ระบบด้วย Google
          </button>
        </div>
      </div>
    </div>
  );
};
