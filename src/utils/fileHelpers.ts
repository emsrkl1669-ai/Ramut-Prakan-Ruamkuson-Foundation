export async function compressImageFileToDataUrl(
  file: File,
  maxBytes = 240000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ไฟล์รูปภาพไม่ถูกต้อง'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 960;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('ไม่สามารถประมวลผลรูปภาพได้'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let quality = 0.82;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > maxBytes && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (dataUrl.length > maxBytes) {
          reject(new Error('ขนาดรูปภาพหลังบีบอัดยังเกินขีดจำกัด กรุณาเลือกไฟล์ที่เล็กลง'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function readPdfFileToDataUrl(
  file: File,
  maxRawBytes = 220000
): Promise<{ name: string; dataUrl: string }> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('กรุณาเลือกไฟล์นามสกุล .pdf เท่านั้น');
  }
  if (file.size > maxRawBytes) {
    throw new Error('ไฟล์ PDF ต้องมีขนาดไม่เกิน 220 KB เพื่อรองรับการบันทึกบนระบบคลาวด์');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ PDF ได้'));
    reader.onload = () => {
      const dataUrl = String(reader.result);
      if (dataUrl.length > 340000) {
        reject(new Error('ข้อมูลไฟล์ PDF มีขนาดใหญ่เกินขีดจำกัด'));
        return;
      }
      resolve({ name: file.name.slice(0, 160), dataUrl });
    };
    reader.readAsDataURL(file);
  });
}

export function formatBaht(value: number): string {
  return new Intl.NumberFormat('th-TH').format(value);
}
