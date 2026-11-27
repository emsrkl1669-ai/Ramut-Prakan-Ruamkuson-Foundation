import React, { useMemo, useState } from 'react';
import {
  Ambulance,
  Mail,
  Phone,
  Radio,
  Search,
  UserCheck,
  Clock,
} from 'lucide-react';
import {
  EMS_RESPONDERS,
  EXECUTIVES,
  STAFF_DIRECTORY,
} from '../data/foundationData';
import { ExecutiveMember, OrgSubTab } from '../types/foundation';

interface OrganizationSectionProps {
  subTab: OrgSubTab;
  onChangeSubTab: (tab: OrgSubTab) => void;
}

const DEPARTMENTS: Array<'ทั้งหมด' | 'ฝ่ายบริหาร' | 'ฝ่ายธุรการ' | 'ฝ่ายสื่อสารองค์กร' | 'ฝ่ายปฏิบัติการ'> = [
  'ทั้งหมด',
  'ฝ่ายบริหาร',
  'ฝ่ายธุรการ',
  'ฝ่ายสื่อสารองค์กร',
  'ฝ่ายปฏิบัติการ',
];

export const OrganizationSection: React.FC<OrganizationSectionProps> = ({
  subTab,
  onChangeSubTab,
}) => {
  const [selectedExec, setSelectedExec] = useState<ExecutiveMember>(EXECUTIVES[0]);

  // Staff search filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ทั้งหมด');
  const [positionFilter, setPositionFilter] = useState<string>('ทั้งหมด');

  const president = EXECUTIVES.find((e) => e.tier === 'president')!;
  const vices = EXECUTIVES.filter((e) => e.tier === 'vice');
  const officers = EXECUTIVES.filter((e) => e.tier === 'officer');
  const advisors = EXECUTIVES.filter((e) => e.tier === 'advisor');

  const uniquePositions = useMemo(() => {
    const set = new Set(STAFF_DIRECTORY.map((s) => s.subUnit));
    return ['ทั้งหมด', ...Array.from(set)];
  }, []);

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return STAFF_DIRECTORY.filter((staff) => {
      const matchesDept = deptFilter === 'ทั้งหมด' || staff.department === deptFilter;
      const matchesPos = positionFilter === 'ทั้งหมด' || staff.subUnit === positionFilter;
      const matchesSearch =
        !q ||
        staff.name.toLowerCase().includes(q) ||
        staff.department.toLowerCase().includes(q) ||
        staff.position.toLowerCase().includes(q) ||
        staff.subUnit.toLowerCase().includes(q);
      return matchesDept && matchesPos && matchesSearch;
    });
  }, [searchQuery, deptFilter, positionFilter]);

  const emsHead = EMS_RESPONDERS.find((r) => r.role === 'หัวหน้าฝ่ายกู้ชีพ')!;
  const emsUnits: Array<'ชุดกู้ชีพ A' | 'ชุดกู้ชีพ B' | 'ชุดกู้ชีพ C'> = [
    'ชุดกู้ชีพ A',
    'ชุดกู้ชีพ B',
    'ชุดกู้ชีพ C',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Section Header & Sub-navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold text-[#1D4294] mb-1">
            โครงสร้างการบริหารและบุคลากร
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            ทำเนียบคณะผู้บริหาร พนักงาน และชุดปฏิบัติการกู้ชีพ
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => onChangeSubTab('executives')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              subTab === 'executives'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. ผังคณะผู้บริหาร / ที่ปรึกษา
          </button>
          <button
            type="button"
            onClick={() => onChangeSubTab('staff')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              subTab === 'staff'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. ผังพนักงานทั้งหมด
          </button>
          <button
            type="button"
            onClick={() => onChangeSubTab('ems')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              subTab === 'ems'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. ผังพนักงานกู้ชีพ
          </button>
        </div>
      </div>

      {/* TAB 1: Organizational Chart (Executives & Advisors) */}
      {subTab === 'executives' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Org Chart Tree */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                ผังคณะผู้บริหาร / ที่ปรึกษามูลนิธิ (Organizational Chart)
              </h2>
              <span className="text-xs text-slate-500">
                คลิกที่รายชื่อเพื่อดูประวัติและช่องทางติดต่อ
              </span>
            </div>

            {/* Level 1: President */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setSelectedExec(president)}
                className={`w-full max-w-xs p-4 rounded-xl border text-left transition-colors ${
                  selectedExec.id === president.id
                    ? 'border-[#1D4294] bg-[#1D4294]/5'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1D4294] text-white font-bold flex items-center justify-center shrink-0">
                    {president.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1D4294]">
                      {president.role}
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {president.name}
                    </p>
                  </div>
                </div>
              </button>
              <div className="w-px h-6 bg-slate-300" aria-hidden="true" />
            </div>

            {/* Horizontal Connector */}
            <div className="border-t border-slate-300 pt-6 space-y-6">
              {/* Level 2: Vice Presidents */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-3">
                  รองประธานมูลนิธิ
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vices.map((exec) => (
                    <button
                      key={exec.id}
                      type="button"
                      onClick={() => setSelectedExec(exec)}
                      className={`p-4 rounded-xl border text-left transition-colors ${
                        selectedExec.id === exec.id
                          ? 'border-[#1D4294] bg-[#1D4294]/5'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center shrink-0">
                          {exec.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D4294]">
                            {exec.role}
                          </p>
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {exec.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Level 3: Secretary & Treasurer */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-3">
                  เลขานุการและเหรัญญิก
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {officers.map((exec) => (
                    <button
                      key={exec.id}
                      type="button"
                      onClick={() => setSelectedExec(exec)}
                      className={`p-4 rounded-xl border text-left transition-colors ${
                        selectedExec.id === exec.id
                          ? 'border-[#1D4294] bg-[#1D4294]/5'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-slate-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                          {exec.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D4294]">
                            {exec.role}
                          </p>
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {exec.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Level 4: Advisory Board */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-3">
                  คณะที่ปรึกษามูลนิธิ
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {advisors.map((exec) => (
                    <button
                      key={exec.id}
                      type="button"
                      onClick={() => setSelectedExec(exec)}
                      className={`p-3.5 rounded-xl border text-left transition-colors ${
                        selectedExec.id === exec.id
                          ? 'border-[#1D4294] bg-[#1D4294]/5'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                          {exec.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-[#C81E2B] truncate">
                            {exec.role}
                          </p>
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {exec.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Executive Detail Panel */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 sticky top-20">
            <div className="flex items-center gap-4 pb-5 border-b border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-[#1D4294] text-white text-xl font-bold flex items-center justify-center shrink-0">
                {selectedExec.initials}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#C81E2B]">
                  {selectedExec.role}
                </p>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedExec.name}
                </h3>
              </div>
            </div>

            <div className="py-5 space-y-5">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-1.5">
                  ประวัติและบทบาทหน้าที่
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedExec.bio}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-2">
                  ประวัติการทำงาน
                </h4>
                <ul className="space-y-2">
                  {selectedExec.experience.map((exp, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-700 flex items-start gap-2"
                    >
                      <span className="text-[#1D4294] font-mono text-xs mt-1">
                        0{idx + 1}.
                      </span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-500">
                  ช่องทางติดต่อประสานงาน
                </h4>
                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-[#1D4294] shrink-0" />
                  <span className="font-mono tabular-nums">{selectedExec.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Mail className="w-4 h-4 text-[#1D4294] shrink-0" />
                  <span className="truncate">{selectedExec.email}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: All Staff Directory with Search by Name, Dept, Position */}
      {subTab === 'staff' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label
                htmlFor="staff-search"
                className="block text-xs font-semibold text-slate-600 mb-1.5"
              >
                ค้นหาจากชื่อ แผนก หรือตำแหน่ง
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="staff-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="พิมพ์ชื่อพนักงาน, ฝ่าย, หรือตำแหน่ง..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label
                htmlFor="dept-filter"
                className="block text-xs font-semibold text-slate-600 mb-1.5"
              >
                ค้นหาตามแผนก (ฝ่าย)
              </label>
              <select
                id="dept-filter"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1D4294]"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="pos-filter"
                className="block text-xs font-semibold text-slate-600 mb-1.5"
              >
                ค้นหาตามสายงาน/ตำแหน่ง
              </label>
              <select
                id="pos-filter"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1D4294]"
              >
                {uniquePositions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Grouped or Listed */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                รายชื่อเจ้าหน้าที่ประจำฝ่าย
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">
                พบข้อมูล {filteredStaff.length} รายการ
              </span>
            </div>

            {filteredStaff.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-slate-600 mb-3">
                  ไม่พบรายชื่อพนักงานที่ตรงกับเงื่อนไขการค้นหา
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDeptFilter('ทั้งหมด');
                    setPositionFilter('ทั้งหมด');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#1D4294] border border-[#1D4294] rounded-lg hover:bg-[#1D4294]/5"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-5">ชื่อ-นามสกุล</th>
                      <th className="py-3 px-4">ฝ่าย</th>
                      <th className="py-3 px-4">งาน / หน่วยงาน</th>
                      <th className="py-3 px-4">ตำแหน่ง</th>
                      <th className="py-3 px-4 text-right">เบอร์ติดต่อภายใน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                              {staff.initials}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {staff.name}
                              </p>
                              <p className="text-xs text-slate-500">{staff.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#1D4294]">
                          {staff.department}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{staff.subUnit}</td>
                        <td className="py-3.5 px-4 text-slate-700">{staff.position}</td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                          ต่อ {staff.extPhone}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EMS Rescue Personnel Chart */}
      {subTab === 'ems' && (
        <div className="space-y-8">
          {/* EMS Head Card */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#C81E2B] text-white text-lg font-bold flex items-center justify-center shrink-0">
                  {emsHead.initials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#C81E2B]">
                    {emsHead.role}
                  </p>
                  <h2 className="text-lg font-bold text-slate-900">{emsHead.name}</h2>
                  <p className="text-xs text-slate-500">{emsHead.certification}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{emsHead.shift}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Ambulance className="w-3.5 h-3.5 text-[#1D4294] shrink-0" />
                  <span className="font-mono truncate">{emsHead.ambulanceId}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#C81E2B] shrink-0" />
                  <span className="font-mono truncate">{emsHead.radioCallsign}</span>
                </div>
              </div>
            </div>
            <div className="w-px h-7 bg-slate-300" aria-hidden="true" />
          </div>

          {/* Units A, B, C */}
          <div className="border-t border-slate-300 pt-7 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {emsUnits.map((unitName) => {
              const members = EMS_RESPONDERS.filter((m) => m.unit === unitName);
              const lead = members[0];
              return (
                <div
                  key={unitName}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col"
                >
                  <div className="bg-slate-900 text-white px-5 py-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-base font-bold">{unitName}</h3>
                      <span className="text-xs font-mono text-slate-300">
                        {lead?.ambulanceId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{lead?.shift}</p>
                  </div>

                  <div className="divide-y divide-slate-100 flex-1">
                    {members.map((member) => (
                      <div key={member.id} className="p-5 space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-full text-sm font-bold flex items-center justify-center shrink-0 ${
                              member.role === 'หัวหน้าชุด'
                                ? 'bg-[#1D4294] text-white'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {member.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-[#1D4294]">
                                {member.role}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {member.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {member.certification}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 text-[#C81E2B] shrink-0" />
                            <span className="font-mono font-semibold text-slate-800">
                              {member.radioCallsign}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-[#1D4294] shrink-0" />
                            <span className="truncate">ปฏิบัติหน้าที่</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
