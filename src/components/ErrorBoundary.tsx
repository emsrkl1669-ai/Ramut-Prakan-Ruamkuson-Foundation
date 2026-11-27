import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              ไม่สามารถแสดงผลบางส่วนได้ชั่วคราว
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              ระบบตรวจพบข้อผิดพลาดในการเชื่อมต่อข้อมูล กรุณารีเฟรชหน้าเว็บเพื่อดำเนินการต่อ
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#1D4294] text-white text-sm font-semibold rounded-lg hover:bg-[#163375] transition-colors whitespace-nowrap"
            >
              โหลดหน้าใหม่
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
