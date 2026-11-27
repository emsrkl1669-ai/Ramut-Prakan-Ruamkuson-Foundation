import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Edit3,
  FileText,
  ImagePlus,
  MapPin,
  Plus,
  Users,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import {
  BOOTSTRAP_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  ActivityCategory,
  ActivityPost,
  ActivitySubTab,
  AnnualEventItem,
} from '../types/foundation';
import {
  compressImageFileToDataUrl,
  readPdfFileToDataUrl,
} from '../utils/fileHelpers';

interface ActivitiesCalendarSectionProps {
  subTab: ActivitySubTab;
  onChangeSubTab: (tab: ActivitySubTab) => void;
  activities: ActivityPost[];
  annualEvents: AnnualEventItem[];
  onSelectActivity: (activity: ActivityPost) => void;
  currentUser: User | null;
  onRequireAuth: () => void;
}

const CATEGORIES: Array<'ทั้งหมด' | ActivityCategory> = [
  'ทั้งหมด',
  'ช่วยเหลือผู้ประสบภัย',
  'ตรวจสุขภาพฟรี',
  'บริจาคโลหิต',
  'กิจกรรมชุมชน',
  'ฝึกอบรมกู้ชีพ',
  'ข่าวประชาสัมพันธ์',
];

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const ActivitiesCalendarSection: React.FC<ActivitiesCalendarSectionProps> = ({
  subTab,
  onChangeSubTab,
  activities,
  annualEvents,
  onSelectActivity,
  currentUser,
  onRequireAuth,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ทั้งหมด');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  // Event Add/Edit modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AnnualEventItem | null>(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtMonth, setEvtMonth] = useState(1);
  const [evtDateLabel, setEvtDateLabel] = useState('');
  const [evtCategory, setEvtCategory] = useState('กิจกรรมชุมชน');
  const [evtLocation, setEvtLocation] = useState('สำนักงานใหญ่มูลนิธิร่วมกุศลสมุทรปราการ');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtImageUrl, setEvtImageUrl] = useState('');
  const [evtPdfName, setEvtPdfName] = useState('');
  const [evtPdfDataUrl, setEvtPdfDataUrl] = useState('');
  const [evtSaving, setEvtSaving] = useState(false);
  const [evtError, setEvtError] = useState('');

  // Activity post modal (Admin)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<ActivityCategory>('กิจกรรมชุมชน');
  const [postDateLabel, setPostDateLabel] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postParticipants, setPostParticipants] = useState('50');
  const [postSummary, setPostSummary] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postSaving, setPostSaving] = useState(false);
  const [postError, setPostError] = useState('');

  const isAdminUser =
    Boolean(currentUser?.emailVerified) &&
    currentUser?.email === BOOTSTRAP_ADMIN_EMAIL;

  const filteredActivities = useMemo(() => {
    if (categoryFilter === 'ทั้งหมด') return activities;
    return activities.filter((a) => a.category === categoryFilter);
  }, [activities, categoryFilter]);

  const sortedEvents = useMemo(() => {
    const base =
      selectedMonth === 'all'
        ? annualEvents
        : annualEvents.filter((e) => e.monthIndex === selectedMonth);
    return [...base].sort((a, b) => a.monthIndex - b.monthIndex);
  }, [annualEvents, selectedMonth]);

  const openAddEventModal = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    setEditingEvent(null);
    setEvtTitle('');
    setEvtMonth(1);
    setEvtDateLabel('');
    setEvtCategory('กิจกรรมชุมชน');
    setEvtLocation('สำนักงานใหญ่มูลนิธิร่วมกุศลสมุทรปราการ');
    setEvtDesc('');
    setEvtImageUrl('');
    setEvtPdfName('');
    setEvtPdfDataUrl('');
    setEvtError('');
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (evt: AnnualEventItem) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    setEditingEvent(evt);
    setEvtTitle(evt.title);
    setEvtMonth(evt.monthIndex);
    setEvtDateLabel(evt.dateLabel);
    setEvtCategory(evt.category);
    setEvtLocation(evt.location);
    setEvtDesc(evt.description);
    setEvtImageUrl(evt.imageUrl);
    setEvtPdfName(evt.pdfName);
    setEvtPdfDataUrl(evt.pdfDataUrl);
    setEvtError('');
    setIsEventModalOpen(true);
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    errSetter: (err: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      errSetter('');
      const compressed = await compressImageFileToDataUrl(file);
      setter(compressed);
    } catch (err) {
      errSetter(err instanceof Error ? err.message : 'ไม่สามารถอัปโหลดรูปภาพได้');
    }
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setEvtError('');
      const res = await readPdfFileToDataUrl(file);
      setEvtPdfName(res.name);
      setEvtPdfDataUrl(res.dataUrl);
    } catch (err) {
      setEvtError(err instanceof Error ? err.message : 'ไม่สามารถอัปโหลดไฟล์ PDF ได้');
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (evtTitle.trim().length < 2 || evtDateLabel.trim().length < 2 || evtDesc.trim().length < 2) {
      setEvtError('กรุณากรอกชื่อกิจกรรม วันที่จัดงาน และรายละเอียดให้ครบถ้วน');
      return;
    }

    setEvtSaving(true);
    setEvtError('');
    const monthLabel = THAI_MONTHS[evtMonth - 1] || 'มกราคม';
    try {
      if (editingEvent && editingEvent.isFromFirestore) {
        const ref = doc(db, 'annualEvents', editingEvent.id);
        await updateDoc(ref, {
          title: evtTitle.trim().slice(0, 200),
          monthIndex: Number(evtMonth),
          monthLabel,
          dateLabel: evtDateLabel.trim().slice(0, 80),
          category: evtCategory.trim().slice(0, 80),
          description: evtDesc.trim().slice(0, 2000),
          location: evtLocation.trim().slice(0, 200),
          imageUrl: evtImageUrl.slice(0, 350000),
          pdfName: evtPdfName.slice(0, 180),
          pdfDataUrl: evtPdfDataUrl.slice(0, 350000),
          updatedAt: serverTimestamp(),
        }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `annualEvents/${editingEvent.id}`));
      } else {
        await addDoc(collection(db, 'annualEvents'), {
          title: evtTitle.trim().slice(0, 200),
          monthIndex: Number(evtMonth),
          monthLabel,
          dateLabel: evtDateLabel.trim().slice(0, 80),
          category: evtCategory.trim().slice(0, 80),
          description: evtDesc.trim().slice(0, 2000),
          location: evtLocation.trim().slice(0, 200),
          imageUrl: evtImageUrl.slice(0, 350000),
          pdfName: evtPdfName.slice(0, 180),
          pdfDataUrl: evtPdfDataUrl.slice(0, 350000),
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'annualEvents'));
      }
      setIsEventModalOpen(false);
    } catch (err) {
      setEvtError('บันทึกไม่สำเร็จ: ตรวจสอบสิทธิ์การใช้งานหรือขนาดไฟล์แนบ');
      console.error(err);
    } finally {
      setEvtSaving(false);
    }
  };

  const handleCreateActivityPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!isAdminUser) {
      setPostError('เฉพาะผู้ดูแลระบบมูลนิธิเท่านั้นที่สามารถเผยแพร่ข่าวกิจกรรมบนบอร์ดสาธารณะได้');
      return;
    }
    if (postTitle.trim().length < 2 || postSummary.trim().length < 2) {
      setPostError('กรุณากรอกหัวข้อและสรุปรายละเอียดกิจกรรม');
      return;
    }
    setPostSaving(true);
    setPostError('');
    try {
      await addDoc(collection(db, 'activities'), {
        title: postTitle.trim().slice(0, 200),
        category: postCategory,
        summary: postSummary.trim().slice(0, 500),
        description: (postDescription.trim() || postSummary.trim()).slice(0, 4000),
        dateLabel: (postDateLabel.trim() || 'พฤศจิกายน 2569').slice(0, 80),
        location: (postLocation.trim() || 'จังหวัดสมุทรปราการ').slice(0, 200),
        participantsCount: Math.max(0, Number(postParticipants) || 0),
        imageUrl: postImageUrl.slice(0, 350000),
        authorName: currentUser.displayName || 'ฝ่ายสื่อสารองค์กร มูลนิธิร่วมกุศลสมุทรปราการ',
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'activities'));
      setIsPostModalOpen(false);
      setPostTitle('');
      setPostSummary('');
      setPostDescription('');
      setPostImageUrl('');
    } catch (err) {
      setPostError('ไม่สามารถบันทึกกิจกรรมได้');
      console.error(err);
    } finally {
      setPostSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold text-[#1D4294] mb-1">
            ข่าวสาร ภารกิจสาธารณกุศล และกำหนดการ
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            บอร์ดกิจกรรมมูลนิธิและปฏิทินงานประจำปี
          </h1>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => onChangeSubTab('timeline')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              subTab === 'timeline'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. บอร์ดกิจกรรมมูลนิธิ
          </button>
          <button
            type="button"
            onClick={() => onChangeSubTab('calendar')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              subTab === 'calendar'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5. บอร์ดงานประจำปี (Calendar)
          </button>
        </div>
      </div>

      {/* TAB 4: Facebook Timeline Style Activities Board */}
      {subTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sticky Category Filter */}
          <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3">
                หมวดหมู่กิจกรรม
              </h2>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      categoryFilter === cat
                        ? 'bg-[#1D4294] text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {isAdminUser && (
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1D4294] hover:bg-[#163375] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  โพสต์กิจกรรมใหม่
                </button>
              </div>
            )}
          </aside>

          {/* Timeline Feed */}
          <div className="lg:col-span-9 space-y-6">
            {filteredActivities.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >
                <div className="p-5 sm:p-6 pb-4">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {post.authorName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-[#1D4294]">
                          {post.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{post.dateLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.location}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {post.summary}
                  </p>
                </div>

                {post.imageUrl && (
                  <div className="bg-slate-100 max-h-[420px] overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5 tabular-nums font-medium">
                      <Users className="w-4 h-4 text-[#1D4294]" />
                      ผู้เข้าร่วม {post.participantsCount} คน
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate max-w-[220px]">{post.location}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectActivity(post)}
                    className="px-4 py-2 bg-white border border-slate-300 hover:border-[#1D4294] text-slate-900 hover:text-[#1D4294] text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Annual Calendar Event Board */}
      {subTab === 'calendar' && (
        <div className="space-y-6">
          {/* Calendar Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedMonth('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedMonth === 'all'
                    ? 'bg-[#1D4294] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ทุกเดือน
              </button>
              {[1, 3, 7, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedMonth === m
                      ? 'bg-[#1D4294] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {THAI_MONTHS[m - 1]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={openAddEventModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D4294] hover:bg-[#163375] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              เพิ่มกิจกรรมประจำปี
            </button>
          </div>

          {/* Summary Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                ตารางปฏิทินกิจกรรมประจำปี มูลนิธิร่วมกุศลสมุทรปราการ
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">
                ทั้งหมด {sortedEvents.length} กิจกรรม
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-5 w-32">เดือน</th>
                    <th className="py-3 px-4">รายการกิจกรรม / กำหนดการ</th>
                    <th className="py-3 px-4">สถานที่</th>
                    <th className="py-3 px-4">เอกสาร PDF</th>
                    <th className="py-3 px-5 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {sortedEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/70">
                      <td className="py-4 px-5 align-top font-bold text-[#1D4294] whitespace-nowrap">
                        {evt.monthLabel}
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-start gap-3">
                          {evt.imageUrl && (
                            <img
                              src={evt.imageUrl}
                              alt={evt.title}
                              className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0 hidden sm:block"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{evt.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {evt.dateLabel} · {evt.category}
                            </p>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {evt.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top text-slate-700 text-xs sm:text-sm">
                        {evt.location}
                      </td>
                      <td className="py-4 px-4 align-top">
                        {evt.pdfDataUrl ? (
                          <a
                            href={evt.pdfDataUrl}
                            download={evt.pdfName || 'event-document.pdf'}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C81E2B] hover:underline"
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span className="truncate max-w-[150px]">{evt.pdfName}</span>
                          </a>
                        ) : evt.pdfName ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <FileText className="w-4 h-4 shrink-0 text-slate-400" />
                            <span className="truncate max-w-[150px]">{evt.pdfName}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">ไม่มีไฟล์แนบ</span>
                        )}
                      </td>
                      <td className="py-4 px-5 align-top text-right">
                        <button
                          type="button"
                          onClick={() => openEditEventModal(evt)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 hover:border-[#1D4294] text-slate-700 hover:text-[#1D4294] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Annual Event */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingEvent ? 'แก้ไขกิจกรรมประจำปี' : 'เพิ่มกิจกรรมประจำปี'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {evtError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                {evtError}
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อกิจกรรม *
                </label>
                <input
                  type="text"
                  required
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                  placeholder="เช่น พิธีทำบุญประจำปีและมอบทุนการศึกษา"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เดือน *
                  </label>
                  <select
                    value={evtMonth}
                    onChange={(e) => setEvtMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1D4294]"
                  >
                    {THAI_MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่จัดกิจกรรม *
                  </label>
                  <input
                    type="text"
                    required
                    value={evtDateLabel}
                    onChange={(e) => setEvtDateLabel(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                    placeholder="เช่น 15 มกราคม 2570"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมวดหมู่
                  </label>
                  <input
                    type="text"
                    value={evtCategory}
                    onChange={(e) => setEvtCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานที่จัดงาน
                  </label>
                  <input
                    type="text"
                    value={evtLocation}
                    onChange={(e) => setEvtLocation(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดกิจกรรม *
                </label>
                <textarea
                  rows={3}
                  required
                  value={evtDesc}
                  onChange={(e) => setEvtDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    แนบรูปภาพกิจกรรม
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 hover:border-[#1D4294] cursor-pointer">
                    <ImagePlus className="w-4 h-4 text-[#1D4294]" />
                    <span className="truncate">
                      {evtImageUrl ? 'เปลี่ยนรูปภาพที่แนบ' : 'เลือกรูปภาพ (JPG/PNG)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, setEvtImageUrl, setEvtError)}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    แนบไฟล์เอกสาร PDF (ไม่เกิน 220 KB)
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 hover:border-[#C81E2B] cursor-pointer">
                    <FileText className="w-4 h-4 text-[#C81E2B]" />
                    <span className="truncate">
                      {evtPdfName || 'เลือกไฟล์ PDF'}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handlePdfFileChange}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={evtSaving}
                  className="px-5 py-2 bg-[#1D4294] hover:bg-[#163375] text-white text-sm font-semibold rounded-lg disabled:opacity-60"
                >
                  {evtSaving ? 'กำลังบันทึก...' : 'บันทึกกิจกรรม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Create Activity Post */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                เผยแพร่กิจกรรมใหม่บนบอร์ดมูลนิธิ
              </h3>
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {postError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                {postError}
              </div>
            )}
            <form onSubmit={handleCreateActivityPost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หัวข้อกิจกรรม *
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมวดหมู่
                  </label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'ทั้งหมด').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่จัดกิจกรรม
                  </label>
                  <input
                    type="text"
                    value={postDateLabel}
                    onChange={(e) => setPostDateLabel(e.target.value)}
                    placeholder="เช่น 28 พฤศจิกายน 2569"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานที่
                  </label>
                  <input
                    type="text"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    placeholder="อ.เมือง จ.สมุทรปราการ"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    จำนวนผู้เข้าร่วม (คน)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={postParticipants}
                    onChange={(e) => setPostParticipants(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สรุปกิจกรรม *
                </label>
                <textarea
                  rows={2}
                  required
                  value={postSummary}
                  onChange={(e) => setPostSummary(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดฉบับเต็ม
                </label>
                <textarea
                  rows={3}
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  แนบรูปภาพประกอบ
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e, setPostImageUrl, setPostError)}
                  className="text-xs text-slate-600"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={postSaving}
                  className="px-5 py-2 bg-[#1D4294] text-white text-sm font-semibold rounded-lg"
                >
                  {postSaving ? 'กำลังเผยแพร่...' : 'เผยแพร่กิจกรรม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
