import React from 'react';
import { Calendar, MapPin, Users, X } from 'lucide-react';
import { ActivityPost } from '../types/foundation';

interface ActivityDetailModalProps {
  activity: ActivityPost | null;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
}) => {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#1D4294]">{activity.category}</p>
            <h3 className="text-lg font-bold text-slate-900">{activity.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activity.imageUrl && (
          <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 pb-4 border-b border-slate-100">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1D4294]" />
              {activity.dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C81E2B]" />
              {activity.location}
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums font-semibold text-slate-800">
              <Users className="w-4 h-4 text-[#1D4294]" />
              ผู้เข้าร่วม {activity.participantsCount} คน
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
            {activity.description}
          </p>

          <p className="text-xs text-slate-500 pt-2">
            เผยแพร่โดย: {activity.authorName}
          </p>
        </div>
      </div>
    </div>
  );
};
