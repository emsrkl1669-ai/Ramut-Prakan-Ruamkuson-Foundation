import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { ActivitiesCalendarSection } from './components/ActivitiesCalendarSection';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { AuthPromptModal } from './components/AuthPromptModal';
import { ContactMapSection } from './components/ContactMapSection';
import { DonationsSection } from './components/DonationsSection';
import { Header } from './components/Header';
import { HomeSection } from './components/HomeSection';
import { OrganizationSection } from './components/OrganizationSection';
import { ServicesAndExecutiveSection } from './components/ServicesAndExecutiveSection';
import {
  DEFAULT_ACTIVITIES,
  DEFAULT_ANNUAL_EVENTS,
  DEFAULT_DONATIONS,
  FOUNDATION_INFO,
  FOUNDATION_LOGO,
} from './data/foundationData';
import {
  auth,
  BOOTSTRAP_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import {
  ActivityPost,
  ActivitySubTab,
  AcupunctureBookingRecord,
  AnnualEventItem,
  CprRegistrationRecord,
  DonationRecord,
  EmergencyReportRecord,
  InternalDocRecord,
  MainTab,
  OrgSubTab,
  ServiceSubTab,
  VolunteerApplicationRecord,
} from './types/foundation';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [orgSubTab, setOrgSubTab] = useState<OrgSubTab>('executives');
  const [activitySubTab, setActivitySubTab] = useState<ActivitySubTab>('timeline');
  const [serviceSubTab, setServiceSubTab] = useState<ServiceSubTab>('emergency');

  const [selectedActivity, setSelectedActivity] = useState<ActivityPost | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');

  // Google Maps Demo Key Quota State
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  // Public Firestore Collections
  const [fsActivities, setFsActivities] = useState<ActivityPost[]>([]);
  const [fsEvents, setFsEvents] = useState<AnnualEventItem[]>([]);
  const [fsDonations, setFsDonations] = useState<DonationRecord[]>([]);

  // Authenticated User/Admin Collections
  const [emergencyReports, setEmergencyReports] = useState<EmergencyReportRecord[]>([]);
  const [volunteerApps, setVolunteerApps] = useState<VolunteerApplicationRecord[]>([]);
  const [cprRegistrations, setCprRegistrations] = useState<CprRegistrationRecord[]>([]);
  const [acupunctureBookings, setAcupunctureBookings] = useState<
    AcupunctureBookingRecord[]
  >([]);
  const [internalDocs, setInternalDocs] = useState<InternalDocRecord[]>([]);

  // Listen for Google Maps quota exceeded event
  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Public Firestore Subscriptions (No PII)
  useEffect(() => {
    const unsubAct = onSnapshot(
      query(collection(db, 'activities'), orderBy('createdAt', 'desc')),
      (snap) => {
        const items: ActivityPost[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: String(data.title || ''),
            category: data.category,
            summary: String(data.summary || ''),
            description: String(data.description || ''),
            dateLabel: String(data.dateLabel || ''),
            location: String(data.location || ''),
            participantsCount: Number(data.participantsCount || 0),
            imageUrl: String(data.imageUrl || ''),
            authorName: String(data.authorName || ''),
            isFromFirestore: true,
          };
        });
        setFsActivities(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'activities')
    );

    const unsubEvt = onSnapshot(
      query(collection(db, 'annualEvents'), orderBy('monthIndex', 'asc')),
      (snap) => {
        const items: AnnualEventItem[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: String(data.title || ''),
            monthIndex: Number(data.monthIndex || 1),
            monthLabel: String(data.monthLabel || ''),
            dateLabel: String(data.dateLabel || ''),
            category: String(data.category || ''),
            description: String(data.description || ''),
            location: String(data.location || ''),
            imageUrl: String(data.imageUrl || ''),
            pdfName: String(data.pdfName || ''),
            pdfDataUrl: String(data.pdfDataUrl || ''),
            userId: String(data.userId || ''),
            isFromFirestore: true,
          };
        });
        setFsEvents(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'annualEvents')
    );

    const unsubDon = onSnapshot(
      query(collection(db, 'donationsPublic'), orderBy('createdAt', 'desc')),
      (snap) => {
        const items: DonationRecord[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            donorDisplayName: String(data.donorDisplayName || ''),
            amount: Number(data.amount || 0),
            purpose: data.purpose,
            channel: data.channel,
            note: String(data.note || ''),
            dateLabel: String(data.dateLabel || ''),
            isFromFirestore: true,
          };
        });
        setFsDonations(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'donationsPublic')
    );

    return () => {
      unsubAct();
      unsubEvt();
      unsubDon();
    };
  }, []);

  // Protected Subscriptions (Only when authenticated and email verified)
  useEffect(() => {
    if (!authReady || !currentUser || !currentUser.emailVerified) {
      setEmergencyReports([]);
      setVolunteerApps([]);
      setCprRegistrations([]);
      setAcupunctureBookings([]);
      setInternalDocs([]);
      return;
    }

    const isAdmin = currentUser.email === BOOTSTRAP_ADMIN_EMAIL;

    const emgQuery = isAdmin
      ? query(collection(db, 'emergencyReports'), orderBy('createdAt', 'desc'))
      : query(
          collection(db, 'emergencyReports'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

    const volQuery = isAdmin
      ? query(collection(db, 'volunteerApplications'), orderBy('createdAt', 'desc'))
      : query(
          collection(db, 'volunteerApplications'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

    const cprQuery = isAdmin
      ? query(collection(db, 'cprRegistrations'), orderBy('createdAt', 'desc'))
      : query(
          collection(db, 'cprRegistrations'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

    const tcmQuery = isAdmin
      ? query(collection(db, 'acupunctureBookings'), orderBy('createdAt', 'desc'))
      : query(
          collection(db, 'acupunctureBookings'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

    const unsubEmg = onSnapshot(
      emgQuery,
      (snap) => {
        setEmergencyReports(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<EmergencyReportRecord, 'id'>),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'emergencyReports')
    );

    const unsubVol = onSnapshot(
      volQuery,
      (snap) => {
        setVolunteerApps(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<VolunteerApplicationRecord, 'id'>),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'volunteerApplications')
    );

    const unsubCpr = onSnapshot(
      cprQuery,
      (snap) => {
        setCprRegistrations(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<CprRegistrationRecord, 'id'>),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'cprRegistrations')
    );

    const unsubTcm = onSnapshot(
      tcmQuery,
      (snap) => {
        setAcupunctureBookings(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<AcupunctureBookingRecord, 'id'>),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'acupunctureBookings')
    );

    let unsubDocs = () => {};
    if (isAdmin) {
      unsubDocs = onSnapshot(
        query(collection(db, 'internalDocs'), orderBy('createdAt', 'desc')),
        (snap) => {
          setInternalDocs(
            snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<InternalDocRecord, 'id'>),
            }))
          );
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'internalDocs')
      );
    }

    return () => {
      unsubEmg();
      unsubVol();
      unsubCpr();
      unsubTcm();
      unsubDocs();
    };
  }, [authReady, currentUser]);

  const combinedActivities = useMemo(
    () => [...fsActivities, ...DEFAULT_ACTIVITIES],
    [fsActivities]
  );

  const combinedEvents = useMemo(
    () => [...fsEvents, ...DEFAULT_ANNUAL_EVENTS],
    [fsEvents]
  );

  const combinedDonations = useMemo(
    () => [...fsDonations, ...DEFAULT_DONATIONS],
    [fsDonations]
  );

  const totalDonated = useMemo(() => {
    const fsSum = fsDonations.reduce((acc, item) => acc + (item.amount || 0), 0);
    return FOUNDATION_INFO.baselineDonationAmount + fsSum;
  }, [fsDonations]);

  const handleNavigate = (tab: MainTab, sub?: string) => {
    setActiveTab(tab);
    if (tab === 'organization' && sub) {
      setOrgSubTab(sub as OrgSubTab);
    } else if (tab === 'activities' && sub) {
      setActivitySubTab(sub as ActivitySubTab);
    } else if (tab === 'services' && sub) {
      setServiceSubTab(sub as ServiceSubTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError('');
      await signInWithPopup(auth, googleProvider);
      setAuthModalOpen(false);
    } catch (err) {
      console.error('Sign in failed:', err);
      setAuthError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] text-slate-900">
      {/* Google Maps Demo Key Quota Warning Banner (Section 8 Case A) */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Header activeTab={activeTab} onNavigate={handleNavigate} />

      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeSection
            onNavigate={handleNavigate}
            onSelectActivity={(act) => setSelectedActivity(act)}
            featuredActivities={combinedActivities}
            totalDonated={totalDonated}
          />
        )}

        {activeTab === 'organization' && (
          <OrganizationSection
            subTab={orgSubTab}
            onChangeSubTab={setOrgSubTab}
          />
        )}

        {activeTab === 'activities' && (
          <ActivitiesCalendarSection
            subTab={activitySubTab}
            onChangeSubTab={setActivitySubTab}
            activities={combinedActivities}
            annualEvents={combinedEvents}
            onSelectActivity={(act) => setSelectedActivity(act)}
            currentUser={currentUser}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'donations' && (
          <DonationsSection
            donations={combinedDonations}
            totalDonated={totalDonated}
            currentUser={currentUser}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'services' && (
          <ServicesAndExecutiveSection
            subTab={serviceSubTab}
            onChangeSubTab={setServiceSubTab}
            currentUser={currentUser}
            onSignIn={() => setAuthModalOpen(true)}
            onSignOut={handleSignOut}
            emergencyReports={emergencyReports}
            volunteerApps={volunteerApps}
            cprRegistrations={cprRegistrations}
            acupunctureBookings={acupunctureBookings}
            internalDocs={internalDocs}
          />
        )}

        {activeTab === 'contact' && (
          <ContactMapSection
            currentUser={currentUser}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={FOUNDATION_LOGO}
                alt={FOUNDATION_INFO.name}
                className="w-10 h-10 object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-base font-bold text-white">
                  {FOUNDATION_INFO.name}
                </p>
                <p className="text-xs text-slate-400">
                  {FOUNDATION_INFO.chineseTitle} · จังหวัดสมุทรปราการ
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {FOUNDATION_INFO.address}
            </p>
            <p className="text-xs font-mono text-slate-300">
              สายด่วนกู้ชีพ {FOUNDATION_INFO.hotline} · โทรศัพท์{' '}
              {FOUNDATION_INFO.hqPhone} · มือถือ {FOUNDATION_INFO.mobilePhone}
            </p>
          </div>

          <div className="md:col-span-4 space-y-2">
            <p className="text-xs font-semibold text-white mb-2">เมนูบริการหลัก</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleNavigate('organization', 'executives')}
                className="text-left hover:text-white transition-colors"
              >
                ผังคณะผู้บริหาร / ที่ปรึกษา
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('organization', 'staff')}
                className="text-left hover:text-white transition-colors"
              >
                ผังพนักงานทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('organization', 'ems')}
                className="text-left hover:text-white transition-colors"
              >
                ผังพนักงานกู้ชีพ A/B/C
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('activities', 'timeline')}
                className="text-left hover:text-white transition-colors"
              >
                บอร์ดกิจกรรมมูลนิธิ
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('activities', 'calendar')}
                className="text-left hover:text-white transition-colors"
              >
                บอร์ดงานประจำปี
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('donations')}
                className="text-left hover:text-white transition-colors"
              >
                บอร์ดการรับบริจาค
              </button>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <p className="text-xs font-semibold text-white">ศูนย์บริการและผู้บริหาร</p>
            <div className="flex flex-col gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleNavigate('services', 'emergency')}
                className="text-left hover:text-white transition-colors"
              >
                แจ้งเหตุฉุกเฉินออนไลน์
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('services', 'acupuncture')}
                className="text-left hover:text-white transition-colors"
              >
                จองคิวฝังเข็ม (แพทย์แผนจีน)
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('services', 'executive')}
                className="text-left hover:text-white transition-colors"
              >
                แดชบอร์ดผู้บริหารและเอกสารภายใน
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('contact')}
                className="text-left hover:text-white transition-colors"
              >
                แผนที่และการติดต่อประสานงาน
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          © พ.ศ. 2569 {FOUNDATION_INFO.name} · เพื่อสาธารณกุศลและการกู้ชีพกู้ภัยจังหวัดสมุทรปราการ
        </div>
      </footer>

      {/* Modals */}
      <ActivityDetailModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onConfirmSignIn={handleGoogleSignIn}
        authError={authError}
      />
    </div>
  );
}
