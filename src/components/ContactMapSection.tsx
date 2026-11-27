import React, { useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import {
  Facebook,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Send,
  Smartphone,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FOUNDATION_INFO, SERVICE_CENTERS } from '../data/foundationData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

declare const __GMP_API_KEY__: string | undefined;

const MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ||
  (typeof __GMP_API_KEY__ !== 'undefined' ? __GMP_API_KEY__ : '') ||
  '';

interface ServiceMarkerProps {
  centerItem: (typeof SERVICE_CENTERS)[number];
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}

const ServiceLocationMarker: React.FC<ServiceMarkerProps> = ({
  centerItem,
  isSelected,
  onSelect,
  onClose,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={centerItem.position}
        onClick={onSelect}
        title={centerItem.name}
      >
        <Pin
          background={centerItem.type === 'hq' ? '#C81E2B' : '#1D4294'}
          borderColor="#FFFFFF"
          glyphColor="#FFFFFF"
          scale={centerItem.type === 'hq' ? 1.2 : 1.0}
        />
      </AdvancedMarker>
      {isSelected && marker && (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={onClose}>
          <div className="p-1 text-slate-900 space-y-1">
            <p className="text-xs font-bold leading-snug">{centerItem.name}</p>
            <p className="text-[11px] text-slate-600">{centerItem.address}</p>
            <p className="text-[11px] font-mono text-[#1D4294] font-semibold">
              โทร: {centerItem.phone}
            </p>
            <p className="text-[11px] text-slate-500">{centerItem.hours}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

interface ContactMapSectionProps {
  currentUser: User | null;
  onRequireAuth: () => void;
}

export const ContactMapSection: React.FC<ContactMapSectionProps> = ({
  currentUser,
  onRequireAuth,
}) => {
  const [selectedCenterId, setSelectedCenterId] = useState<string>('hq');
  const [senderName, setSenderName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = () => {
    setSenderName('');
    setPhone('');
    setEmail('');
    setSubject('');
    setMessage('');
    setStatusMsg('');
    setErrorMsg('');
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (
      senderName.trim().length < 2 ||
      phone.trim().length < 8 ||
      subject.trim().length < 2 ||
      message.trim().length < 2
    ) {
      setErrorMsg('กรุณากรอกข้อมูลติดต่อและรายละเอียดให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      await addDoc(collection(db, 'contactMessages'), {
        senderName: senderName.trim().slice(0, 120),
        phone: phone.trim().slice(0, 30),
        email: (email.trim() || currentUser.email || '').slice(0, 160),
        subject: subject.trim().slice(0, 200),
        message: message.trim().slice(0, 2000),
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'contactMessages'));

      setStatusMsg('ส่งข้อความติดต่อประสานงานถึงมูลนิธิเรียบร้อยแล้ว');
      setSenderName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error(err);
      setErrorMsg('ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold text-[#1D4294] mb-1">
          สำนักงานใหญ่และศูนย์ประสานงานจังหวัดสมุทรปราการ
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          7. ข้อมูลการติดต่อประสานงานและแผนที่ Google Maps
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info + Google Maps */}
        <div className="lg:col-span-7 space-y-6">
          {/* HQ Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              สำนักงานใหญ่ {FOUNDATION_INFO.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C81E2B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500">ที่อยู่</p>
                  <p className="text-slate-800 leading-relaxed">
                    {FOUNDATION_INFO.address}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#1D4294] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">โทรศัพท์</p>
                    <p className="font-mono font-semibold text-slate-900 tabular-nums">
                      {FOUNDATION_INFO.hqPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-[#1D4294] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">มือถือ</p>
                    <p className="font-mono font-semibold text-slate-900 tabular-nums">
                      {FOUNDATION_INFO.mobilePhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#1D4294] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Email</p>
                    <p className="text-slate-900">{FOUNDATION_INFO.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <a
                href={FOUNDATION_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-[#1D4294] rounded-lg text-xs font-semibold text-slate-700 hover:text-[#1D4294]"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </a>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Line Official: {FOUNDATION_INFO.lineOfficialId}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                <Globe className="w-4 h-4 text-[#1D4294]" />
                {FOUNDATION_INFO.websiteUrl}
              </span>
            </div>
          </div>

          {/* Interactive Google Maps */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900">
                แผนที่สำนักงานใหญ่และจุดบริการประชาชน (Google Maps)
              </h3>
              <span className="text-xs text-slate-500">
                คลิกหมุดบนแผนที่เพื่อดูรายละเอียดจุดประสานงาน
              </span>
            </div>

            <div className="w-full h-[380px] relative bg-slate-100">
              {MAPS_API_KEY ? (
                <APIProvider
                  apiKey={MAPS_API_KEY}
                  language="th"
                  region="TH"
                  libraries={['marker']}
                >
                  <GoogleMap
                    mapId="DEMO_MAP_ID"
                    defaultCenter={FOUNDATION_INFO.hqCoordinates}
                    defaultZoom={12}
                    gestureHandling="greedy"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    {SERVICE_CENTERS.map((item) => (
                      <ServiceLocationMarker
                        key={item.id}
                        centerItem={item}
                        isSelected={selectedCenterId === item.id}
                        onSelect={() => setSelectedCenterId(item.id)}
                        onClose={() => setSelectedCenterId('')}
                      />
                    ))}
                  </GoogleMap>
                </APIProvider>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <MapPin className="w-8 h-8 text-[#C81E2B]" />
                  <p className="text-sm font-bold text-slate-900">
                    {FOUNDATION_INFO.name} (พิกัด 13.5991° N, 100.5968° E)
                  </p>
                  <p className="text-xs text-slate-600 max-w-md">
                    {FOUNDATION_INFO.address}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${FOUNDATION_INFO.hqCoordinates.lat},${FOUNDATION_INFO.hqCoordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#1D4294] text-white text-xs font-semibold rounded-lg"
                  >
                    เปิดนำทางใน Google Maps
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SERVICE_CENTERS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedCenterId(sc.id)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-colors ${
                    selectedCenterId === sc.id
                      ? 'border-[#1D4294] bg-white font-semibold text-[#1D4294]'
                      : 'border-slate-200 bg-white/60 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <p className="truncate">{sc.name}</p>
                  <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                    {sc.phone}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">ฟอร์มติดต่อประสานงาน</h2>
            <p className="text-xs text-slate-500 mt-1">
              สอบถามข้อมูลการบริจาค การขอรับความช่วยเหลือ หรือประสานงานโครงการ
            </p>
          </div>

          {statusMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
              {statusMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-900">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmitContact} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ติดต่อ *
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                placeholder="ชื่อ-นามสกุล หรือหน่วยงาน"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ *
                </label>
                <input
                  type="tel"
                  required
                  minLength={8}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                  placeholder="08x-xxx-xxxx"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentUser?.email || 'name@example.com'}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หัวข้อ *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                placeholder="เรื่องที่ต้องการติดต่อ"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียด *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4294]"
                placeholder="กรอกรายละเอียดข้อความ..."
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1D4294] hover:bg-[#163375] text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                {submitting
                  ? 'กำลังส่ง...'
                  : currentUser
                    ? 'ส่งข้อความ'
                    : 'เข้าสู่ระบบและส่งข้อความ'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                ล้างข้อมูล
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
