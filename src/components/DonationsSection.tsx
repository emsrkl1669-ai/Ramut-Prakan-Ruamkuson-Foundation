import React, { useState } from 'react';
import { Check, Copy, HeartHandshake, Landmark, QrCode } from 'lucide-react';
import { User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FOUNDATION_INFO } from '../data/foundationData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  DonationChannel,
  DonationPurpose,
  DonationRecord,
} from '../types/foundation';
import { formatBaht } from '../utils/fileHelpers';

interface DonationsSectionProps {
  donations: DonationRecord[];
  totalDonated: number;
  currentUser: User | null;
  onRequireAuth: () => void;
}

const PURPOSES: DonationPurpose[] = [
  'รถพยาบาล',
  'อุปกรณ์การแพทย์',
  'ช่วยเหลือผู้ประสบภัย',
  'ทุนฝึกอบรมกู้ชีพ',
];

const CHANNELS: DonationChannel[] = [
  'QR PromptPay',
  'โอนผ่านธนาคาร',
  'บริจาคที่มูลนิธิ',
];

const PRESET_AMOUNTS = [500, 1000, 3000, 5000, 10000];

export const DonationsSection: React.FC<DonationsSectionProps> = ({
  donations,
  totalDonated,
  currentUser,
  onRequireAuth,
}) => {
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('1000');
  const [purpose, setPurpose] = useState<DonationPurpose>('รถพยาบาล');
  const [channel, setChannel] = useState<DonationChannel>('QR PromptPay');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  const progressPercent = Math.min(
    100,
    Math.round((totalDonated / FOUNDATION_INFO.donationGoal) * 100)
  );

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText('215-0-88916-9');
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } catch {
      // ignore clipboard errors in restricted frames
    }
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0 || numericAmount > 10000000) {
      setErrorMsg('กรุณาระบุจำนวนเงินบริจาคที่ถูกต้อง');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    const displayName =
      donorName.trim() || currentUser.displayName || 'ผู้มีจิตศรัทธาไม่ประสงค์ออกนาม';
    const todayLabel = new Date().toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    try {
      await addDoc(collection(db, 'donationsPublic'), {
        donorDisplayName: displayName.slice(0, 120),
        amount: numericAmount,
        purpose,
        channel,
        note: note.trim().slice(0, 300),
        dateLabel: todayLabel,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'donationsPublic'));

      setSuccessMsg(
        `ขออนุโมทนาบุญ ${displayName} สำหรับยอดบริจาค ${formatBaht(numericAmount)} บาท (${purpose}) บันทึกลงระบบเรียบร้อยแล้ว`
      );
      setDonorName('');
      setNote('');
    } catch (err) {
      setErrorMsg('ไม่สามารถบันทึกข้อมูลการบริจาคได้ กรุณาลองใหม่อีกครั้ง');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold text-[#C81E2B] mb-1">
          ร่วมสมทบทุนสาธารณกุศลอย่างโปร่งใส
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          6. บอร์ดการรับบริจาคและระบบรับบริจาคออนไลน์
        </h1>
      </div>

      {/* Donation Progress Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              เป้าหมายกองทุนประจำปี
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {formatBaht(FOUNDATION_INFO.donationGoal)}{' '}
              <span className="text-base font-sans font-normal text-slate-500">บาท</span>
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              ยอดรับบริจาคปัจจุบัน (รับแล้ว)
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-[#1D4294] font-mono tabular-nums">
              {formatBaht(totalDonated)}{' '}
              <span className="text-base font-sans font-normal text-slate-500">บาท</span>
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-xs font-semibold text-slate-500 mb-1">ความคืบหน้า</p>
            <p className="text-3xl font-bold text-[#C81E2B] font-mono tabular-nums">
              {progressPercent}%
            </p>
          </div>
        </div>

        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1D4294] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
          <span>วัตถุประสงค์หลัก:</span>
          {PURPOSES.map((p) => (
            <span key={p} className="font-medium text-slate-800">
              • {p}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Donation Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <HeartHandshake className="w-5 h-5 text-[#C81E2B]" />
            <h2 className="text-lg font-bold text-slate-900">
              บันทึกแจ้งความประสงค์และยืนยันการบริจาคออนไลน์
            </h2>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-900">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmitDonation} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                เลือกวัตถุประสงค์การบริจาค
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {PURPOSES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPurpose(item)}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-colors ${
                      purpose === item
                        ? 'border-[#1D4294] bg-[#1D4294]/5 text-[#1D4294] font-semibold'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                จำนวนเงินบริจาค (บาท)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    className={`px-3.5 py-2 rounded-lg border text-sm font-mono tabular-nums transition-colors ${
                      Number(amount) === val
                        ? 'border-[#C81E2B] bg-[#C81E2B] text-white font-semibold'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {formatBaht(val)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="10000000"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                placeholder="ระบุจำนวนเงิน (บาท)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อผู้บริจาค (สำหรับแสดงบนบอร์ด)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="เช่น นายสมชาย ใจดี หรือ บริษัท..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ช่องทางการบริจาค
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as DonationChannel)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1D4294]"
                >
                  {CHANNELS.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ข้อความร่วมอนุโมทนา / หมายเหตุ (ถ้ามี)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ขอให้ทีมกู้ชีพปลอดภัยในทุกภารกิจ"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 bg-[#C81E2B] hover:bg-[#A61722] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 min-h-[44px]"
            >
              {submitting
                ? 'กำลังบันทึกรายการ...'
                : currentUser
                  ? 'ยืนยันการบริจาคและอัปเดตยอด'
                  : 'เข้าสู่ระบบด้วย Google เพื่อยืนยันการบริจาค'}
            </button>
          </form>
        </div>

        {/* Right: Channels (QR PromptPay & Bank Transfer) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <QrCode className="w-5 h-5 text-[#1D4294]" />
              <span>ช่องทาง QR Code พร้อมเพย์ (e-Donation)</span>
            </div>
            <div className="flex items-center gap-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
              {/* Crisp deterministic SVG QR Pattern */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shrink-0">
                <svg
                  width="104"
                  height="104"
                  viewBox="0 0 21 21"
                  aria-label="QR Code พร้อมเพย์ มูลนิธิร่วมกุศลสมุทรปราการ"
                  className="text-slate-900"
                >
                  <rect width="21" height="21" fill="white" />
                  <path
                    fill="currentColor"
                    d="M1,1 h7 v7 h-7 z M2,2 v5 h5 v-5 z M3,3 h3 v3 h-3 z M13,1 h7 v7 h-7 z M14,2 v5 h5 v-5 z M15,3 h3 v3 h-3 z M1,13 h7 v7 h-7 z M2,14 v5 h5 v-5 z M3,15 h3 v3 h-3 z M9,2 h2 v2 h-2 z M9,6 h2 v2 h-2 z M10,9 h3 v2 h-3 z M9,13 h2 v3 h-2 z M13,10 h2 v2 h-2 z M16,10 h4 v2 h-4 z M13,14 h3 v2 h-3 z M17,13 h3 v3 h-3 z M13,17 h2 v3 h-2 z M16,18 h4 v2 h-4 z"
                  />
                </svg>
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <p className="font-bold text-[#1D4294]">PromptPay มูลนิธิ</p>
                <p className="font-mono font-semibold text-slate-900 tabular-nums">
                  099-4-00016-69-1
                </p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  ชื่อบัญชี: มูลนิธิร่วมกุศลสมุทรปราการ (ลดหย่อนภาษีได้อัตโนมัติ)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Landmark className="w-5 h-5 text-[#1D4294]" />
              <span>โอนผ่านบัญชีธนาคาร</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-semibold text-slate-900">
                ธนาคารกรุงไทย · สาขาสมุทรปราการ
              </p>
              <p className="text-slate-700 text-xs">
                ชื่อบัญชี: มูลนิธิร่วมกุศลสมุทรปราการ
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-lg font-mono font-bold text-[#1D4294] tabular-nums">
                  215-0-88916-9
                </span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:border-[#1D4294]"
                >
                  {copiedAccount ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      คัดลอกแล้ว
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      คัดลอกเลขบัญชี
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Donor Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">รายการผู้บริจาคล่าสุด</h2>
          <span className="text-xs text-slate-500 tabular-nums">
            แสดง {donations.length} รายการล่าสุด
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-5">ชื่อผู้บริจาค</th>
                <th className="py-3 px-4">วัตถุประสงค์</th>
                <th className="py-3 px-4">ช่องทาง</th>
                <th className="py-3 px-4">วันที่</th>
                <th className="py-3 px-5 text-right">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {donations.map((don) => (
                <tr key={don.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    {don.donorDisplayName}
                    {don.note && (
                      <p className="text-xs font-normal text-slate-500 mt-0.5">
                        {don.note}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{don.purpose}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">{don.channel}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs font-mono tabular-nums">
                    {don.dateLabel}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-bold text-[#1D4294] tabular-nums">
                    {formatBaht(don.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
