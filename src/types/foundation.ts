export type MainTab =
  | 'home'
  | 'organization'
  | 'activities'
  | 'donations'
  | 'services'
  | 'contact';

export type OrgSubTab = 'executives' | 'staff' | 'ems';
export type ActivitySubTab = 'timeline' | 'calendar';
export type ServiceSubTab =
  | 'emergency'
  | 'volunteer'
  | 'cpr'
  | 'acupuncture'
  | 'executive';

export interface ExecutiveMember {
  id: string;
  name: string;
  role: string;
  tier: 'president' | 'vice' | 'officer' | 'advisor';
  bio: string;
  experience: string[];
  phone: string;
  email: string;
  initials: string;
}

export interface StaffMember {
  id: string;
  name: string;
  department: 'ฝ่ายบริหาร' | 'ฝ่ายธุรการ' | 'ฝ่ายสื่อสารองค์กร' | 'ฝ่ายปฏิบัติการ';
  subUnit: string;
  position: string;
  extPhone: string;
  email: string;
  initials: string;
}

export interface EmsResponder {
  id: string;
  name: string;
  role: 'หัวหน้าฝ่ายกู้ชีพ' | 'หัวหน้าชุด' | 'เจ้าหน้าที่ EMT' | 'เจ้าหน้าที่พยาบาล';
  unit: 'อำนวยการ' | 'ชุดกู้ชีพ A' | 'ชุดกู้ชีพ B' | 'ชุดกู้ชีพ C';
  shift: string;
  ambulanceId: string;
  radioCallsign: string;
  certification: string;
  initials: string;
}

export type ActivityCategory =
  | 'ช่วยเหลือผู้ประสบภัย'
  | 'ตรวจสุขภาพฟรี'
  | 'บริจาคโลหิต'
  | 'กิจกรรมชุมชน'
  | 'ฝึกอบรมกู้ชีพ'
  | 'ข่าวประชาสัมพันธ์';

export interface ActivityPost {
  id: string;
  title: string;
  category: ActivityCategory;
  summary: string;
  description: string;
  dateLabel: string;
  location: string;
  participantsCount: number;
  imageUrl: string;
  authorName: string;
  isFromFirestore?: boolean;
}

export interface AnnualEventItem {
  id: string;
  title: string;
  monthIndex: number;
  monthLabel: string;
  dateLabel: string;
  category: string;
  description: string;
  location: string;
  imageUrl: string;
  pdfName: string;
  pdfDataUrl: string;
  userId?: string;
  isFromFirestore?: boolean;
}

export type DonationPurpose =
  | 'รถพยาบาล'
  | 'อุปกรณ์การแพทย์'
  | 'ช่วยเหลือผู้ประสบภัย'
  | 'ทุนฝึกอบรมกู้ชีพ';

export type DonationChannel = 'QR PromptPay' | 'โอนผ่านธนาคาร' | 'บริจาคที่มูลนิธิ';

export interface DonationRecord {
  id: string;
  donorDisplayName: string;
  amount: number;
  purpose: DonationPurpose;
  channel: DonationChannel;
  note: string;
  dateLabel: string;
  isFromFirestore?: boolean;
}

export interface EmergencyReportRecord {
  id: string;
  reporterName: string;
  reporterPhone: string;
  incidentType: string;
  locationText: string;
  severity: 'วิกฤต' | 'เร่งด่วน' | 'ทั่วไป';
  details: string;
  lineNotifySent: boolean;
  status: 'รอรับเรื่อง' | 'กำลังจัดชุดกู้ชีพ' | 'เสร็จสิ้น';
  userId: string;
  createdAtLabel?: string;
}

export interface VolunteerApplicationRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  division: string;
  experience: string;
  availability: string;
  status: 'รอพิจารณา' | 'อนุมัติแล้ว';
  userId: string;
}

export interface CprRegistrationRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  organization: string;
  sessionDate: string;
  status: 'ลงทะเบียนสำเร็จ' | 'ยกเลิก';
  userId: string;
}

export interface AcupunctureBookingRecord {
  id: string;
  patientName: string;
  phone: string;
  preferredDate: string;
  timeSlot: string;
  symptoms: string;
  queueNumber: string;
  status: 'จองคิวแล้ว' | 'เข้ารับบริการแล้ว' | 'ยกเลิก';
  userId: string;
}

export interface InternalDocRecord {
  id: string;
  title: string;
  department: string;
  docCode: string;
  fileName: string;
  fileDataUrl: string;
  uploadedBy: string;
  userId: string;
}
