import React, { useState } from 'react';
import {
  Activity,
  Ambulance,
  BarChart3,
  BellRing,
  FileText,
  LogIn,
  LogOut,
  PhoneCall,
  ShieldAlert,
  Stethoscope,
  Upload,
  Users,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  AMBULANCE_FLEET,
  FOUNDATION_INFO,
  MONTHLY_RESCUE_STATS,
  TCM_IMAGE,
} from '../data/foundationData';
import {
  BOOTSTRAP_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  AcupunctureBookingRecord,
  CprRegistrationRecord,
  EmergencyReportRecord,
  InternalDocRecord,
  ServiceSubTab,
  VolunteerApplicationRecord,
} from '../types/foundation';
import { readPdfFileToDataUrl } from '../utils/fileHelpers';

interface ServicesAndExecutiveSectionProps {
  subTab: ServiceSubTab;
  onChangeSubTab: (tab: ServiceSubTab) => void;
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  emergencyReports: EmergencyReportRecord[];
  volunteerApps: VolunteerApplicationRecord[];
  cprRegistrations: CprRegistrationRecord[];
  acupunctureBookings: AcupunctureBookingRecord[];
  internalDocs: InternalDocRecord[];
}

export const ServicesAndExecutiveSection: React.FC<
  ServicesAndExecutiveSectionProps
> = ({
  subTab,
  onChangeSubTab,
  currentUser,
  onSignIn,
  onSignOut,
  emergencyReports,
  volunteerApps,
  cprRegistrations,
  acupunctureBookings,
  internalDocs,
}) => {
  const isAdmin =
    Boolean(currentUser?.emailVerified) &&
    currentUser?.email === BOOTSTRAP_ADMIN_EMAIL;

  // 1. Emergency Report Form State
  const [emgReporter, setEmgReporter] = useState('');
  const [emgPhone, setEmgPhone] = useState('');
  const [emgType, setEmgType] = useState('อุบัติเหตุจราจร');
  const [emgSeverity, setEmgSeverity] = useState<'วิกฤต' | 'เร่งด่วน' | 'ทั่วไป'>(
    'เร่งด่วน'
  );
  const [emgLocation, setEmgLocation] = useState('');
  const [emgDetails, setEmgDetails] = useState('');
  const [emgLineNotify, setEmgLineNotify] = useState(true);
  const [emgStatusMsg, setEmgStatusMsg] = useState('');
  const [emgSubmitting, setEmgSubmitting] = useState(false);

  // 2. Volunteer Application State
  const [volName, setVolName] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volDivision, setVolDivision] = useState('ฝ่ายปฏิบัติการ (กู้ชีพ/กู้ภัย)');
  const [volAvailability, setVolAvailability] = useState('วันเสาร์ - อาทิตย์');
  const [volExperience, setVolExperience] = useState('');
  const [volStatusMsg, setVolStatusMsg] = useState('');
  const [volSubmitting, setVolSubmitting] = useState(false);

  // 3. CPR Training State
  const [cprName, setCprName] = useState('');
  const [cprPhone, setCprPhone] = useState('');
  const [cprEmail, setCprEmail] = useState('');
  const [cprOrg, setCprOrg] = useState('');
  const [cprSession, setCprSession] = useState('รุ่นที่ 1/2570 · เสาร์ที่ 17 ม.ค. 2570');
  const [cprStatusMsg, setCprStatusMsg] = useState('');
  const [cprSubmitting, setCprSubmitting] = useState(false);

  // 4. Acupuncture Booking State
  const [tcmName, setTcmName] = useState('');
  const [tcmPhone, setTcmPhone] = useState('');
  const [tcmDate, setTcmDate] = useState('2026-12-02');
  const [tcmSlot, setTcmSlot] = useState('รอบเช้า 09:00 - 11:30 น.');
  const [tcmSymptoms, setTcmSymptoms] = useState('');
  const [tcmStatusMsg, setTcmStatusMsg] = useState('');
  const [tcmSubmitting, setTcmSubmitting] = useState(false);

  // 5. Internal Docs Upload State (Admin)
  const [docTitle, setDocTitle] = useState('');
  const [docDept, setDocDept] = useState('ฝ่ายบริหาร');
  const [docCode, setDocCode] = useState('DOC-2569-01');
  const [docFileName, setDocFileName] = useState('');
  const [docDataUrl, setDocDataUrl] = useState('');
  const [docStatusMsg, setDocStatusMsg] = useState('');
  const [docSubmitting, setDocSubmitting] = useState(false);

  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onSignIn();
      return;
    }
    setEmgSubmitting(true);
    setEmgStatusMsg('');
    try {
      await addDoc(collection(db, 'emergencyReports'), {
        reporterName: emgReporter.trim().slice(0, 120),
        reporterPhone: emgPhone.trim().slice(0, 30),
        incidentType: emgType,
        locationText: emgLocation.trim().slice(0, 300),
        severity: emgSeverity,
        details: emgDetails.trim().slice(0, 1500),
        lineNotifySent: emgLineNotify,
        status: 'รอรับเรื่อง',
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'emergencyReports'));

      setEmgStatusMsg(
        emgLineNotify
          ? 'ส่งรายงานเหตุฉุกเฉินเข้าศูนย์สั่งการและแจ้งเตือน LINE Notify ผู้บริหารเรียบร้อยแล้ว'
          : 'ส่งรายงานเหตุฉุกเฉินเข้าศูนย์สั่งการเรียบร้อยแล้ว'
      );
      setEmgReporter('');
      setEmgPhone('');
      setEmgLocation('');
      setEmgDetails('');
    } catch (err) {
      console.error(err);
      setEmgStatusMsg('ไม่สามารถส่งรายงานได้ กรุณาตรวจสอบข้อมูลและลองใหม่');
    } finally {
      setEmgSubmitting(false);
    }
  };

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onSignIn();
      return;
    }
    setVolSubmitting(true);
    setVolStatusMsg('');
    try {
      await addDoc(collection(db, 'volunteerApplications'), {
        fullName: volName.trim().slice(0, 120),
        phone: volPhone.trim().slice(0, 30),
        email: (volEmail.trim() || currentUser.email || '').slice(0, 160),
        division: volDivision,
        experience: volExperience.trim().slice(0, 1000),
        availability: volAvailability,
        status: 'รอพิจารณา',
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, 'volunteerApplications')
      );
      setVolStatusMsg('ส่งใบสมัครอาสาสมัครเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับภายใน 3 วันทำการ');
      setVolName('');
      setVolPhone('');
      setVolExperience('');
    } catch (err) {
      console.error(err);
      setVolStatusMsg('ไม่สามารถส่งใบสมัครได้ กรุณาตรวจสอบข้อมูล');
    } finally {
      setVolSubmitting(false);
    }
  };

  const handleCprSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onSignIn();
      return;
    }
    setCprSubmitting(true);
    setCprStatusMsg('');
    try {
      await addDoc(collection(db, 'cprRegistrations'), {
        fullName: cprName.trim().slice(0, 120),
        phone: cprPhone.trim().slice(0, 30),
        email: (cprEmail.trim() || currentUser.email || '').slice(0, 160),
        organization: (cprOrg.trim() || 'บุคคลทั่วไป').slice(0, 160),
        sessionDate: cprSession,
        status: 'ลงทะเบียนสำเร็จ',
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      }).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, 'cprRegistrations')
      );
      setCprStatusMsg(`ลงทะเบียนอบรม CPR (${cprSession}) สำเร็จแล้ว`);
      setCprName('');
      setCprPhone('');
      setCprOrg('');
    } catch (err) {
      console.error(err);
      setCprStatusMsg('ไม่สามารถลงทะเบียนได้ กรุณาตรวจสอบข้อมูล');
    } finally {
      setCprSubmitting(false);
    }
  };

  const handleAcupunctureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onSignIn();
      return;
    }
    setTcmSubmitting(true);
    setTcmStatusMsg('');
    const queueCode = `TCM-${String(100 + acupunctureBookings.length + 1)}`;
    try {
      await addDoc(collection(db, 'acupunctureBookings'), {
        patientName: tcmName.trim().slice(0, 120),
        phone: tcmPhone.trim().slice(0, 30),
        preferredDate: tcmDate,
        timeSlot: tcmSlot,
        symptoms: tcmSymptoms.trim().slice(0, 1000),
        queueNumber: queueCode,
        status: 'จองคิวแล้ว',
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, 'acupunctureBookings')
      );
      setTcmStatusMsg(
        `จองคิวคลินิกฝังเข็มสำเร็จ หมายเลขคิวของคุณคือ ${queueCode} (${tcmDate})`
      );
      setTcmName('');
      setTcmPhone('');
      setTcmSymptoms('');
    } catch (err) {
      console.error(err);
      setTcmStatusMsg('ไม่สามารถจองคิวได้ กรุณาตรวจสอบข้อมูล');
    } finally {
      setTcmSubmitting(false);
    }
  };

  const handleInternalDocFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await readPdfFileToDataUrl(file);
      setDocFileName(res.name);
      setDocDataUrl(res.dataUrl);
      setDocStatusMsg('');
    } catch (err) {
      setDocStatusMsg(err instanceof Error ? err.message : 'ไฟล์ไม่ถูกต้อง');
    }
  };

  const handleUploadInternalDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isAdmin) return;
    setDocSubmitting(true);
    setDocStatusMsg('');
    try {
      await addDoc(collection(db, 'internalDocs'), {
        title: docTitle.trim().slice(0, 200),
        department: docDept,
        docCode: docCode.trim().slice(0, 60),
        fileName: (docFileName || `${docCode}.pdf`).slice(0, 180),
        fileDataUrl: docDataUrl.slice(0, 350000),
        uploadedBy: currentUser.displayName || currentUser.email || 'ผู้บริหาร',
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'internalDocs'));
      setDocStatusMsg('บันทึกเอกสารภายในเข้าสู่ระบบเรียบร้อยแล้ว');
      setDocTitle('');
      setDocFileName('');
      setDocDataUrl('');
    } catch (err) {
      console.error(err);
      setDocStatusMsg('ไม่สามารถอัปโหลดเอกสารได้');
    } finally {
      setDocSubmitting(false);
    }
  };

  const handleAdminUpdateEmergency = async (
    reportId: string,
    newStatus: 'กำลังจัดชุดกู้ชีพ' | 'เสร็จสิ้น'
  ) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'emergencyReports', reportId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      }).catch((err) =>
        handleFirestoreError(err, OperationType.UPDATE, `emergencyReports/${reportId}`)
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Service Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold text-[#1D4294] mb-1">
            ระบบบริการประชาชนและศูนย์ปฏิบัติการมูลนิธิ
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            แจ้งเหตุฉุกเฉิน อาสาสมัคร อบรม CPR ฝังเข็ม และแดชบอร์ดผู้บริหาร
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          {[
            { id: 'emergency', label: 'แจ้งเหตุฉุกเฉิน' },
            { id: 'volunteer', label: 'สมัครอาสาสมัคร' },
            { id: 'cpr', label: 'อบรม CPR' },
            { id: 'acupuncture', label: 'จองคิวฝังเข็ม' },
            { id: 'executive', label: 'ผู้บริหาร / เจ้าหน้าที่' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeSubTab(tab.id as ServiceSubTab)}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                subTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Online Emergency Report */}
      {subTab === 'emergency' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-[#C81E2B]" />
                <h2 className="text-lg font-bold text-slate-900">
                  แบบฟอร์มแจ้งเหตุฉุกเฉินออนไลน์
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-[#C81E2B]">
                สายด่วน {FOUNDATION_INFO.hotline}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-900 leading-relaxed">
              หากเป็นเหตุฉุกเฉินวิกฤตหรือผู้ป่วยหมดสติ กรุณาโทร{' '}
              <strong className="font-mono">{FOUNDATION_INFO.hotline}</strong> หรือ{' '}
              <strong className="font-mono">{FOUNDATION_INFO.hqPhone}</strong>{' '}
              ควบคู่กับการแจ้งข้อมูลผ่านแบบฟอร์มนี้เพื่อให้ชุดกู้ชีพเข้าพื้นที่ได้เร็วที่สุด
            </div>

            {emgStatusMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
                {emgStatusMsg}
              </div>
            )}

            <form onSubmit={handleEmergencySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อผู้แจ้งเหตุ *
                  </label>
                  <input
                    type="text"
                    required
                    value={emgReporter}
                    onChange={(e) => setEmgReporter(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    placeholder="ชื่อ-นามสกุล"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อกลับ *
                  </label>
                  <input
                    type="tel"
                    required
                    minLength={8}
                    value={emgPhone}
                    onChange={(e) => setEmgPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                    placeholder="08x-xxx-xxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ประเภทเหตุการณ์
                  </label>
                  <select
                    value={emgType}
                    onChange={(e) => setEmgType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="อุบัติเหตุจราจร">อุบัติเหตุจราจร</option>
                    <option value="เจ็บป่วยฉุกเฉิน / หมดสติ">เจ็บป่วยฉุกเฉิน / หมดสติ</option>
                    <option value="เหตุอัคคีภัย / สารเคมี">เหตุอัคคีภัย / สารเคมี</option>
                    <option value="ขอความช่วยเหลือเคลื่อนย้ายผู้ป่วย">
                      ขอความช่วยเหลือเคลื่อนย้ายผู้ป่วย
                    </option>
                    <option value="ภัยพิบัติ / น้ำท่วม">ภัยพิบัติ / น้ำท่วม</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ระดับความเร่งด่วน
                  </label>
                  <select
                    value={emgSeverity}
                    onChange={(e) =>
                      setEmgSeverity(e.target.value as 'วิกฤต' | 'เร่งด่วน' | 'ทั่วไป')
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="วิกฤต">วิกฤต (ต้องการ ALS ด่วน)</option>
                    <option value="เร่งด่วน">เร่งด่วน</option>
                    <option value="ทั่วไป">ทั่วไป</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สถานที่เกิดเหตุ / จุดสังเกตชัดเจน *
                </label>
                <input
                  type="text"
                  required
                  value={emgLocation}
                  onChange={(e) => setEmgLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  placeholder="เช่น ถ.สุขุมวิท หน้าตลาดปากน้ำ ต.ปากน้ำ อ.เมือง จ.สมุทรปราการ"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดอาการหรือสถานการณ์ *
                </label>
                <textarea
                  rows={3}
                  required
                  value={emgDetails}
                  onChange={(e) => setEmgDetails(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  placeholder="ระบุจำนวนผู้บาดเจ็บ อาการเบื้องต้น หรือสิ่งกีดขวาง"
                />
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emgLineNotify}
                  onChange={(e) => setEmgLineNotify(e.target.checked)}
                  className="rounded border-slate-300 text-[#1D4294]"
                />
                <span>ส่งแจ้งเตือนด่วนไปยัง LINE Notify ศูนย์บัญชาการผู้บริหารทันที</span>
              </label>

              <button
                type="submit"
                disabled={emgSubmitting}
                className="w-full py-3 bg-[#C81E2B] hover:bg-[#A61722] text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
              >
                {emgSubmitting
                  ? 'กำลังส่งข้อมูลเหตุฉุกเฉิน...'
                  : currentUser
                    ? 'ส่งแจ้งเหตุฉุกเฉินทันที'
                    : 'เข้าสู่ระบบด้วย Google เพื่อส่งแจ้งเหตุ'}
              </button>
            </form>
          </div>

          {/* Right: Submitted Emergency Logs & Hotline */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <PhoneCall className="w-4 h-4 text-[#F87171]" />
                <span>ศูนย์วิทยุสื่อสารร่วมกุศลสมุทรปราการ</span>
              </div>
              <p className="text-3xl font-mono font-bold tabular-nums">
                {FOUNDATION_INFO.hqPhone}
              </p>
              <p className="text-xs text-slate-300">
                ความถี่วิทยุหลัก VHF 168.775 MHz · ประจำการชุดกู้ชีพ A / B / C ตลอด 24 ชั่วโมง
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                รายการแจ้งเหตุของคุณล่าสุด
              </h3>
              {!currentUser ? (
                <p className="text-xs text-slate-500">
                  กรุณาเข้าสู่ระบบด้วย Google เพื่อติดตามสถานะการรับแจ้งเหตุของคุณแบบเรียลไทม์
                </p>
              ) : emergencyReports.length === 0 ? (
                <p className="text-xs text-slate-500">ยังไม่มีประวัติการแจ้งเหตุ</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {emergencyReports.slice(0, 5).map((r) => (
                    <div key={r.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{r.incidentType}</span>
                        <span className="font-semibold text-[#1D4294]">{r.status}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {r.locationText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Volunteer Application */}
      {subTab === 'volunteer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Users className="w-5 h-5 text-[#1D4294]" />
              <h2 className="text-lg font-bold text-slate-900">
                ระบบสมัครอาสาสมัครมูลนิธิร่วมกุศลสมุทรปราการ
              </h2>
            </div>

            {volStatusMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
                {volStatusMsg}
              </div>
            )}

            <form onSubmit={handleVolunteerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={volName}
                    onChange={(e) => setVolName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    type="tel"
                    required
                    minLength={8}
                    value={volPhone}
                    onChange={(e) => setVolPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมลติดต่อ
                  </label>
                  <input
                    type="email"
                    value={volEmail}
                    onChange={(e) => setVolEmail(e.target.value)}
                    placeholder={currentUser?.email || 'name@example.com'}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สายงานที่สนใจเข้าร่วม
                  </label>
                  <select
                    value={volDivision}
                    onChange={(e) => setVolDivision(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ฝ่ายปฏิบัติการ (กู้ชีพ/กู้ภัย)">
                      ฝ่ายปฏิบัติการ (กู้ชีพ/กู้ภัย)
                    </option>
                    <option value="งานบรรเทาสาธารณภัยและแจกสิ่งของ">
                      งานบรรเทาสาธารณภัยและแจกสิ่งของ
                    </option>
                    <option value="ฝ่ายสื่อสารองค์กรและประชาสัมพันธ์">
                      ฝ่ายสื่อสารองค์กรและประชาสัมพันธ์
                    </option>
                    <option value="อาสาสมัครคลินิกแพทย์แผนจีนและตรวจสุขภาพ">
                      อาสาสมัครคลินิกแพทย์แผนจีนและตรวจสุขภาพ
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ช่วงเวลาที่สะดวกปฏิบัติงานอาสา
                </label>
                <select
                  value={volAvailability}
                  onChange={(e) => setVolAvailability(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="วันเสาร์ - อาทิตย์">วันเสาร์ - อาทิตย์</option>
                  <option value="ผลัดกลางคืน (19:00 - 07:00 น.)">
                    ผลัดกลางคืน (19:00 - 07:00 น.)
                  </option>
                  <option value="เฉพาะวันจัดกิจกรรมพิเศษ">เฉพาะวันจัดกิจกรรมพิเศษ</option>
                  <option value="ปฏิบัติงานได้ทุกวัน">ปฏิบัติงานได้ทุกวัน</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประสบการณ์ / ทักษะเพิ่มเติม (เช่น ใบขับขี่, ผ่านการอบรม EMT/CPR)
                </label>
                <textarea
                  rows={3}
                  value={volExperience}
                  onChange={(e) => setVolExperience(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={volSubmitting}
                className="w-full py-3 bg-[#1D4294] hover:bg-[#163375] text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
              >
                {volSubmitting
                  ? 'กำลังบันทึกใบสมัคร...'
                  : currentUser
                    ? 'ส่งใบสมัครอาสาสมัคร'
                    : 'เข้าสู่ระบบด้วย Google เพื่อส่งใบสมัคร'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              สถานะการสมัครอาสาสมัครของคุณ
            </h3>
            {!currentUser ? (
              <p className="text-xs text-slate-500">
                เข้าสู่ระบบด้วย Google เพื่อตรวจสอบสถานะใบสมัครอาสาสมัครของคุณ
              </p>
            ) : volunteerApps.length === 0 ? (
              <p className="text-xs text-slate-500">ยังไม่มีรายการสมัครอาสาสมัคร</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {volunteerApps.map((v) => (
                  <div key={v.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{v.fullName}</span>
                      <span className="font-semibold text-[#1D4294]">{v.status}</span>
                    </div>
                    <p className="text-xs text-slate-600">{v.division}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. CPR Training Registration */}
      {subTab === 'cpr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Activity className="w-5 h-5 text-[#C81E2B]" />
              <h2 className="text-lg font-bold text-slate-900">
                ระบบลงทะเบียนอบรม CPR และการใช้เครื่อง AED (ฟรี ไม่มีค่าใช้จ่าย)
              </h2>
            </div>

            {cprStatusMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
                {cprStatusMsg}
              </div>
            )}

            <form onSubmit={handleCprSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุลผู้เข้าอบรม *
                  </label>
                  <input
                    type="text"
                    required
                    value={cprName}
                    onChange={(e) => setCprName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    type="tel"
                    required
                    minLength={8}
                    value={cprPhone}
                    onChange={(e) => setCprPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมลสำหรับรับเกียรติบัตร
                  </label>
                  <input
                    type="email"
                    value={cprEmail}
                    onChange={(e) => setCprEmail(e.target.value)}
                    placeholder={currentUser?.email || 'name@example.com'}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หน่วยงาน / สถานศึกษา / ชุมชน
                  </label>
                  <input
                    type="text"
                    value={cprOrg}
                    onChange={(e) => setCprOrg(e.target.value)}
                    placeholder="บุคคลทั่วไป หรือ ชื่อองค์กร"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลือกรอบการอบรม
                </label>
                <select
                  value={cprSession}
                  onChange={(e) => setCprSession(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="รุ่นที่ 1/2570 · เสาร์ที่ 17 ม.ค. 2570">
                    รุ่นที่ 1/2570 · เสาร์ที่ 17 ม.ค. 2570 (09:00 - 15:00 น.)
                  </option>
                  <option value="รุ่นที่ 2/2570 · เสาร์ที่ 21 ก.พ. 2570">
                    รุ่นที่ 2/2570 · เสาร์ที่ 21 ก.พ. 2570 (09:00 - 15:00 น.)
                  </option>
                  <option value="รุ่นที่ 3/2570 · เสาร์ที่ 18 มี.ค. 2570">
                    รุ่นที่ 3/2570 · เสาร์ที่ 18 มี.ค. 2570 (09:00 - 15:00 น.)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={cprSubmitting}
                className="w-full py-3 bg-[#1D4294] hover:bg-[#163375] text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
              >
                {cprSubmitting
                  ? 'กำลังลงทะเบียน...'
                  : currentUser
                    ? 'ยืนยันลงทะเบียนอบรม CPR'
                    : 'เข้าสู่ระบบด้วย Google เพื่อลงทะเบียน'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              ประวัติการลงทะเบียนอบรม CPR ของคุณ
            </h3>
            {!currentUser ? (
              <p className="text-xs text-slate-500">
                เข้าสู่ระบบด้วย Google เพื่อดูบัตรยืนยันสิทธิ์การอบรมของคุณ
              </p>
            ) : cprRegistrations.length === 0 ? (
              <p className="text-xs text-slate-500">ยังไม่มีรายการลงทะเบียนอบรม</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {cprRegistrations.map((c) => (
                  <div key={c.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{c.fullName}</span>
                      <span className="font-semibold text-emerald-700">{c.status}</span>
                    </div>
                    <p className="text-xs text-slate-600">{c.sessionDate}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Acupuncture Booking (Traditional Chinese Medicine) */}
      {subTab === 'acupuncture' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Stethoscope className="w-5 h-5 text-[#1D4294]" />
              <h2 className="text-lg font-bold text-slate-900">
                ระบบจองคิวฝังเข็ม (คลินิกแพทย์แผนจีน มูลนิธิร่วมกุศลสมุทรปราการ)
              </h2>
            </div>

            {tcmStatusMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
                {tcmStatusMsg}
              </div>
            )}

            <form onSubmit={handleAcupunctureSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุลผู้รับบริการ *
                  </label>
                  <input
                    type="text"
                    required
                    value={tcmName}
                    onChange={(e) => setTcmName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อ *
                  </label>
                  <input
                    type="tel"
                    required
                    minLength={8}
                    value={tcmPhone}
                    onChange={(e) => setTcmPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่ต้องการเข้ารับบริการ *
                  </label>
                  <input
                    type="date"
                    required
                    value={tcmDate}
                    onChange={(e) => setTcmDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ช่วงเวลาให้บริการ
                  </label>
                  <select
                    value={tcmSlot}
                    onChange={(e) => setTcmSlot(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="รอบเช้า 09:00 - 11:30 น.">
                      รอบเช้า 09:00 - 11:30 น.
                    </option>
                    <option value="รอบบ่าย 13:00 - 16:00 น.">
                      รอบบ่าย 13:00 - 16:00 น.
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อาการเบื้องต้น (เช่น ปวดคอบ่าไหล่ อัมพฤกษ์ ไมเกรน ออฟฟิศซินโดรม) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={tcmSymptoms}
                  onChange={(e) => setTcmSymptoms(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={tcmSubmitting}
                className="w-full py-3 bg-[#1D4294] hover:bg-[#163375] text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
              >
                {tcmSubmitting
                  ? 'กำลังออกบัตรคิว...'
                  : currentUser
                    ? 'ยืนยันจองคิวฝังเข็ม'
                    : 'เข้าสู่ระบบด้วย Google เพื่อจองคิว'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-slate-100">
                <img
                  src={TCM_IMAGE}
                  alt="ห้องตรวจคลินิกฝังเข็มแพทย์แผนจีน มูลนิธิร่วมกุศลสมุทรปราการ"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-5 space-y-2 text-xs text-slate-600">
                <p className="text-sm font-bold text-slate-900">
                  คลินิกฝังเข็มแพทย์แผนจีนเพื่อสาธารณกุศล
                </p>
                <p>เปิดบริการวันอังคาร - วันอาทิตย์ เวลา 09:00 - 16:00 น. (หยุดวันจันทร์)</p>
                <p>ตรวจวินิจฉัยและฝังเข็มโดยแพทย์แผนจีนใบประกอบวิชาชีพถูกต้อง</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">บัตรคิวฝังเข็มของคุณ</h3>
              {!currentUser ? (
                <p className="text-xs text-slate-500">
                  เข้าสู่ระบบด้วย Google เพื่อดูบัตรคิวนัดหมายของคุณ
                </p>
              ) : acupunctureBookings.length === 0 ? (
                <p className="text-xs text-slate-500">ยังไม่มีรายการจองคิว</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {acupunctureBookings.map((b) => (
                    <div key={b.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          คิว {b.queueNumber} · {b.patientName}
                        </p>
                        <p className="text-xs text-slate-600">
                          {b.preferredDate} · {b.timeSlot}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#1D4294]">
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Executive Dashboard, Staff Membership & Internal Docs */}
      {subTab === 'executive' && (
        <div className="space-y-8">
          {/* Staff / Executive Auth Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ระบบสมาชิกเจ้าหน้าที่และแดชบอร์ดผู้บริหาร
              </h2>
              {currentUser ? (
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  เข้าสู่ระบบในนาม:{' '}
                  <strong className="text-slate-900">
                    {currentUser.displayName || currentUser.email}
                  </strong>{' '}
                  ·{' '}
                  <span className="font-semibold text-[#1D4294]">
                    {isAdmin ? 'สิทธิ์ผู้บริหาร / เจ้าหน้าที่ศูนย์สั่งการ' : 'สมาชิกทั่วไป'}
                  </span>
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อเข้าถึงเอกสารภายในและเครื่องมือจัดการข้อมูล
                </p>
              )}
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold rounded-lg whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D4294] hover:bg-[#163375] text-white text-sm font-semibold rounded-lg whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบเจ้าหน้าที่ด้วย Google
              </button>
            )}
          </div>

          {/* Summary Stats: Patients, Rescue, Relief */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#1D4294]" />
                  <h3 className="text-base font-bold text-slate-900">
                    สรุปสถิติผู้ป่วย กู้ชีพ กู้ภัย (5 เดือนล่าสุด)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">หน่วย: ราย / เคส</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <th className="py-2.5 px-3">เดือน</th>
                      <th className="py-2.5 px-3 text-right">ผู้ป่วยกู้ชีพ</th>
                      <th className="py-2.5 px-3 text-right">เหตุกู้ภัย/อุบัติเหตุ</th>
                      <th className="py-2.5 px-3 text-right">งานบรรเทาทุกข์</th>
                      <th className="py-2.5 px-3 w-40">สัดส่วนภารกิจ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 tabular-nums">
                    {MONTHLY_RESCUE_STATS.map((row) => {
                      const total = row.patients + row.rescueCases + row.reliefAid;
                      const widthPct = Math.min(100, Math.round((total / 1150) * 100));
                      return (
                        <tr key={row.month}>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {row.month}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-[#1D4294] font-semibold">
                            {row.patients}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-[#C81E2B] font-semibold">
                            {row.rescueCases}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700">
                            {row.reliefAid}
                          </td>
                          <td className="py-3 px-3">
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1D4294] rounded-full"
                                style={{ width: `${widthPct}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ambulance Fleet Readiness & LINE Notify Status */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Ambulance className="w-5 h-5 text-[#C81E2B]" />
                  <h3 className="text-base font-bold text-slate-900">
                    สถานะความพร้อมรถพยาบาลและจุดบริการ
                  </h3>
                </div>
                <div className="space-y-3">
                  {AMBULANCE_FLEET.map((amb) => (
                    <div
                      key={amb.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">
                          {amb.unit} · {amb.vehicleCode}
                        </span>
                        <span className="font-mono text-[#1D4294] font-semibold">
                          {amb.radio}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{amb.zone}</p>
                      <p className="text-xs font-medium text-emerald-700">
                        สถานะ: {amb.readiness}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-[#1D4294]" />
                  <h3 className="text-base font-bold text-slate-900">
                    การเชื่อมต่อ LINE Notify แจ้งเตือนผู้บริหาร
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  เมื่อมีการแจ้งเหตุฉุกเฉินระดับวิกฤต หรือมียอดบริจาคสำคัญเข้าสู่ระบบ
                  ศูนย์สารสนเทศจะสรุปข้อมูลส่งเข้ากลุ่มบริหารมูลนิธิผ่าน LINE Official ({FOUNDATION_INFO.lineOfficialId}) โดยอัตโนมัติ
                </p>
              </div>
            </div>
          </div>

          {/* Executive Incident Dispatch Table (Admin View) */}
          {isAdmin && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  รายการแจ้งเหตุฉุกเฉินล่าสุด (สำหรับศูนย์สั่งการผู้บริหาร)
                </h3>
                <span className="text-xs text-slate-500 tabular-nums">
                  {emergencyReports.length} รายการ
                </span>
              </div>
              {emergencyReports.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  ยังไม่มีรายการแจ้งเหตุฉุกเฉินในระบบ
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                        <th className="py-3 px-5">ผู้แจ้ง / เบอร์โทร</th>
                        <th className="py-3 px-4">ประเภทเหตุ & ระดับ</th>
                        <th className="py-3 px-4">สถานที่</th>
                        <th className="py-3 px-4">สถานะ</th>
                        <th className="py-3 px-5 text-right">สั่งการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {emergencyReports.map((r) => (
                        <tr key={r.id}>
                          <td className="py-3 px-5">
                            <p className="font-semibold text-slate-900">{r.reporterName}</p>
                            <p className="text-xs font-mono text-slate-500">{r.reporterPhone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-900">{r.incidentType}</p>
                            <p className="text-xs text-[#C81E2B]">{r.severity}</p>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-700 max-w-xs">
                            {r.locationText}
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold text-[#1D4294]">
                            {r.status}
                          </td>
                          <td className="py-3 px-5 text-right space-x-2 whitespace-nowrap">
                            {r.status === 'รอรับเรื่อง' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAdminUpdateEmergency(r.id, 'กำลังจัดชุดกู้ชีพ')
                                }
                                className="px-2.5 py-1 text-xs font-semibold bg-[#1D4294] text-white rounded"
                              >
                                จ่ายชุดกู้ชีพ
                              </button>
                            )}
                            {r.status !== 'เสร็จสิ้น' && (
                              <button
                                type="button"
                                onClick={() => handleAdminUpdateEmergency(r.id, 'เสร็จสิ้น')}
                                className="px-2.5 py-1 text-xs font-semibold border border-slate-300 text-slate-700 rounded"
                              >
                                ปิดเคส
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Internal Documents Manager */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1D4294]" />
                <h3 className="text-base font-bold text-slate-900">
                  ระบบจัดการเอกสารภายในมูลนิธิ (สำหรับผู้บริหารและเจ้าหน้าที่)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                จำกัดสิทธิ์เฉพาะผู้ดูแลระบบที่ได้รับอนุมัติ
              </span>
            </div>

            {isAdmin ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <form
                  onSubmit={handleUploadInternalDoc}
                  className="lg:col-span-5 space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4"
                >
                  <h4 className="text-sm font-bold text-slate-900">
                    อัปโหลดเอกสารภายในใหม่
                  </h4>
                  {docStatusMsg && (
                    <p className="text-xs text-[#1D4294] font-medium">{docStatusMsg}</p>
                  )}
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="ชื่อเอกสาร (เช่น รายงานการประชุมคณะกรรมการ)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={docDept}
                      onChange={(e) => setDocDept(e.target.value)}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="ฝ่ายบริหาร">ฝ่ายบริหาร</option>
                      <option value="ฝ่ายธุรการ">ฝ่ายธุรการ</option>
                      <option value="ฝ่ายปฏิบัติการ">ฝ่ายปฏิบัติการ</option>
                      <option value="ฝ่ายสื่อสารองค์กร">ฝ่ายสื่อสารองค์กร</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={docCode}
                      onChange={(e) => setDocCode(e.target.value)}
                      placeholder="เลขที่เอกสาร"
                      className="px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <label className="flex items-center gap-2 px-3 py-2 bg-white border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 cursor-pointer">
                    <Upload className="w-4 h-4 text-[#1D4294]" />
                    <span className="truncate">
                      {docFileName || 'เลือกไฟล์ PDF (ไม่เกิน 220 KB)'}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleInternalDocFile}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={docSubmitting}
                    className="w-full py-2 bg-[#1D4294] text-white text-xs font-semibold rounded-lg"
                  >
                    {docSubmitting ? 'กำลังอัปโหลด...' : 'บันทึกเอกสารภายใน'}
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-2">
                  {internalDocs.length === 0 ? (
                    <p className="text-sm text-slate-500 p-4">
                      ยังไม่มีเอกสารภายในที่อัปโหลดในขณะนี้
                    </p>
                  ) : (
                    internalDocs.map((d) => (
                      <div
                        key={d.id}
                        className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{d.title}</p>
                          <p className="text-xs text-slate-500">
                            <span className="font-mono">{d.docCode}</span> · {d.department} ·
                            โดย {d.uploadedBy}
                          </p>
                        </div>
                        {d.fileDataUrl && (
                          <a
                            href={d.fileDataUrl}
                            download={d.fileName}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 rounded-lg whitespace-nowrap"
                          >
                            ดาวน์โหลด PDF
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                เอกสารภายในสงวนสิทธิ์สำหรับคณะผู้บริหารและเจ้าหน้าที่ที่ลงชื่อเข้าใช้ด้วยบัญชีผู้ดูแลระบบของมูลนิธิ (emsrkl1669@gmail.com)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
