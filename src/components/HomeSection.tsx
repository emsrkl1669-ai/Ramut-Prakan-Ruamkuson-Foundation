import React from 'react';
import {
  Activity,
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  PhoneCall,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react';
import {
  FOUNDATION_INFO,
  HERO_IMAGE,
  PR_NEWS_ITEMS,
} from '../data/foundationData';
import { ActivityPost, MainTab } from '../types/foundation';
import { formatBaht } from '../utils/fileHelpers';

interface HomeSectionProps {
  onNavigate: (tab: MainTab, sub?: string) => void;
  onSelectActivity: (activity: ActivityPost) => void;
  featuredActivities: ActivityPost[];
  totalDonated: number;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onNavigate,
  onSelectActivity,
  featuredActivities,
  totalDonated,
}) => {
  const leadActivity = featuredActivities[0];
  const donationPct = Math.min(
    100,
    Math.round((totalDonated / FOUNDATION_INFO.donationGoal) * 100)
  );

  return (
    <div className="space-y-14 pb-16">
      {/* Operational Utility Ribbon (Emergency Hotline & Hours) */}
      <div className="bg-[#11244E] text-white border-b border-[#1D4294]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-200">
            <span className="font-medium text-white">
              ศูนย์ประสานงานกู้ชีพ-กู้ภัย จังหวัดสมุทรปราการ
            </span>
            <span aria-hidden="true" className="text-slate-400">
              ·
            </span>
            <span>ปฏิบัติการตลอด 24 ชั่วโมง</span>
            <span aria-hidden="true" className="text-slate-400">
              ·
            </span>
            <span className="font-mono tabular-nums">
              สายด่วน {FOUNDATION_INFO.hotline} / {FOUNDATION_INFO.hqPhone}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('services', 'emergency')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#C81E2B] hover:bg-[#A61722] text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              ติดต่อฉุกเฉิน / แจ้งเหตุออนไลน์
            </button>
          </div>
        </div>
      </div>

      {/* Main Hero Banner Split */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Narrative & Latest PR News */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-6 sm:p-9">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <span className="font-semibold text-[#1D4294]">
                  องค์กรสาธารณกุศลจังหวัดสมุทรปราการ
                </span>
                <span aria-hidden="true">·</span>
                <span>{FOUNDATION_INFO.chineseTitle}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-slate-900 leading-[1.2] tracking-tight mb-4">
                เคียงข้างทุกชีวิต ด้วยพลังแห่งการให้และการกู้ชีพทันท่วงที
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 max-w-xl">
                {FOUNDATION_INFO.name} ให้บริการช่วยเหลือผู้ประสบภัย อุบัติเหตุฉุกเฉิน
                การแพทย์แผนจีน ฝึกอบรม CPR และงานสงเคราะห์ชุมชนอย่างโปร่งใสตลอด 24 ชั่วโมง
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => onNavigate('services', 'emergency')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C81E2B] hover:bg-[#A61722] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[44px]"
                >
                  <ShieldAlert className="w-4 h-4" />
                  แจ้งเหตุฉุกเฉินออนไลน์
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (leadActivity) onSelectActivity(leadActivity);
                    else onNavigate('activities');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:border-[#1D4294] text-slate-800 hover:text-[#1D4294] bg-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[44px]"
                >
                  ดูรายละเอียดกิจกรรมล่าสุด
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Latest PR News embedded cleanly */}
            <div className="border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  ข่าวประชาสัมพันธ์ล่าสุด
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('activities', 'timeline')}
                  className="text-xs font-semibold text-[#1D4294] hover:underline whitespace-nowrap"
                >
                  ดูทั้งหมด
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {PR_NEWS_ITEMS.map((news) => (
                  <button
                    key={news.id}
                    type="button"
                    onClick={() => onNavigate('activities', 'timeline')}
                    className="w-full text-left py-2.5 first:pt-0 last:pb-0 group"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                      <span className="font-mono tabular-nums">{news.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#1D4294] font-medium">{news.category}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 group-hover:text-[#1D4294] transition-colors line-clamp-1">
                      {news.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Hero Documentary Photography */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 min-h-[340px] lg:min-h-full">
            <img
              src={HERO_IMAGE}
              alt="ทีมกู้ชีพมูลนิธิร่วมกุศลสมุทรปราการออกปฏิบัติการช่วยเหลือประชาชน"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
              <div className="flex items-center gap-2 text-xs text-slate-200 mb-2">
                <span>ภารกิจภาคสนาม</span>
                <span aria-hidden="true">·</span>
                <span>ชุดกู้ชีพ A / B / C</span>
                <span aria-hidden="true">·</span>
                <span>สมุทรปราการ</span>
              </div>
              <p className="text-lg sm:text-xl font-bold leading-snug mb-3 max-w-lg">
                {leadActivity
                  ? leadActivity.title
                  : 'ปฏิบัติการกู้ชีพฉุกเฉินและช่วยเหลือผู้ประสบภัยตลอด 24 ชั่วโมง'}
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    leadActivity ? onSelectActivity(leadActivity) : onNavigate('activities')
                  }
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white underline underline-offset-4 hover:text-slate-200 whitespace-nowrap"
                >
                  ดูรายละเอียดกิจกรรม
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Operational Impact Strip */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500 mb-1">ยอดรับบริจาคโครงการปัจจุบัน</p>
            <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatBaht(totalDonated)} <span className="text-sm font-sans font-normal text-slate-500">บาท</span>
            </p>
            <p className="text-xs text-[#1D4294] font-medium mt-1 tabular-nums">
              {donationPct}% ของเป้าหมาย {formatBaht(FOUNDATION_INFO.donationGoal)} บาท
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500 mb-1">ชุดปฏิบัติการกู้ชีพฉุกเฉิน</p>
            <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              3 <span className="text-sm font-sans font-normal text-slate-500">ชุด (A / B / C)</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              ประจำการครอบคลุมทุกอำเภอ 24 ชม.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500 mb-1">เคสช่วยเหลือประชาชนเดือนล่าสุด</p>
            <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              486 <span className="text-sm font-sans font-normal text-slate-500">ราย</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              กู้ชีพฉุกเฉิน 174 เคส · สงเคราะห์ 360 ราย
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500 mb-1">เจ้าหน้าที่และอาสาสมัครภาคสนาม</p>
            <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              180+ <span className="text-sm font-sans font-normal text-slate-500">นาย</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              ผ่านการรับรองมาตรฐานการช่วยชีวิต
            </p>
          </div>
        </div>
      </section>

      {/* Featured Activities Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-[#1D4294] mb-1">
              ภารกิจเพื่อสังคมและชุมชน
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              กิจกรรมเด่นของมูลนิธิ
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('activities', 'timeline')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4294] hover:underline whitespace-nowrap"
          >
            เข้าสู่บอร์ดกิจกรรมทั้งหมด
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredActivities.slice(0, 3).map((item) => (
            <article
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-[#1D4294]">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.dateLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">ผู้เข้าร่วม {item.participantsCount} คน</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate max-w-[180px]">
                  {item.location}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectActivity(item)}
                  className="text-sm font-semibold text-[#1D4294] hover:underline whitespace-nowrap"
                >
                  ดูรายละเอียด
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Civic Services Directory Grid (Quick Access to all 7 Modules & Special Functions) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#1D4294] mb-1">
            ระบบบริการสารสนเทศครบวงจร
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            บริการประชาชนและโครงสร้างมูลนิธิ
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('organization', 'executives')}
            className="text-left bg-white border border-slate-200 hover:border-[#1D4294] rounded-xl p-6 transition-colors group"
          >
            <Users className="w-6 h-6 text-[#1D4294] mb-3" />
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1D4294] mb-1">
              ผังผู้บริหาร พนักงาน และชุดกู้ชีพ
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ผังองค์กรคณะผู้บริหาร ที่ปรึกษา ระบบค้นหาพนักงานแยกตามฝ่าย และตารางเวรชุดกู้ชีพ A / B / C
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('activities', 'calendar')}
            className="text-left bg-white border border-slate-200 hover:border-[#1D4294] rounded-xl p-6 transition-colors group"
          >
            <CalendarDays className="w-6 h-6 text-[#1D4294] mb-3" />
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1D4294] mb-1">
              ปฏิทินกิจกรรมงานประจำปี
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              กำหนดการงานวันเด็ก อบรมกู้ชีพ ทำบุญประจำปี พร้อมระบบเพิ่ม แก้ไข แนบรูปภาพและเอกสาร PDF
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('donations')}
            className="text-left bg-white border border-slate-200 hover:border-[#C81E2B] rounded-xl p-6 transition-colors group"
          >
            <HeartHandshake className="w-6 h-6 text-[#C81E2B] mb-3" />
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#C81E2B] mb-1">
              ระบบรับบริจาคออนไลน์โปร่งใส
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              บริจาคผ่าน QR PromptPay หรือโอนเข้าบัญชีมูลนิธิ พร้อมแสดงยอดบริจาคและรายชื่อผู้บริจาคแบบเรียลไทม์
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('services', 'cpr')}
            className="text-left bg-white border border-slate-200 hover:border-[#1D4294] rounded-xl p-6 transition-colors group"
          >
            <Activity className="w-6 h-6 text-[#1D4294] mb-3" />
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1D4294] mb-1">
              ลงทะเบียนอบรม CPR และสมัครอาสาสมัคร
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              สมัครเข้าร่วมอบรมการช่วยชีวิตขั้นพื้นฐานฟรี หรือสมัครเป็นอาสาสมัครกู้ชีพ-กู้ภัยประจำจังหวัด
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('services', 'acupuncture')}
            className="text-left bg-white border border-slate-200 hover:border-[#1D4294] rounded-xl p-6 transition-colors group"
          >
            <Stethoscope className="w-6 h-6 text-[#1D4294] mb-3" />
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1D4294] mb-1">
              จองคิวคลินิกฝังเข็ม (แพทย์แผนจีน)
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              นัดหมายวันและเวลาเข้ารับบริการฝังเข็มและตรวจสุขภาพแพทย์แผนจีนล่วงหน้า พร้อมรับบัตรคิวออนไลน์
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('services', 'executive')}
            className="text-left bg-white border border-slate-200 hover:border-[#1D4294] rounded-xl p-6 transition-colors group"
          >
            <ShieldAlert className="w-6 h-6 text-[#1D4294] mb-3" />
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1D4294] mb-1">
              แดชบอร์ดผู้บริหารและศูนย์เจ้าหน้าที่
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              สรุปสถิติผู้ป่วย กู้ชีพ กู้ภัย สถานะรถพยาบาล เอกสารภายใน และการแจ้งเตือนผ่าน LINE Notify
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};
