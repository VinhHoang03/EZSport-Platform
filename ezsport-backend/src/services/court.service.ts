import { openai } from '../configs/openai';
import Court from '../models/court.model';
import Booking from '../models/booking.model';
import { calculateDistance } from '../utils/distance.util';

interface CourtSuggestionParams {
  prompt: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  limit?: number;
}

interface CourtSuggestionResponse {
  suggestions: any[];
  aiExplanation: string;
  matchedCriteria: {
    sportType?: string;
    priceRange?: string;
    location?: string;
    features?: string[];
  };
  parsedSlot?: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    comboType?: 'week' | 'month';
  };
}

type Intent = 'greeting' | 'identity' | 'thanks' | 'search' | 'faq' | 'support' | 'unknown';

const SPORT_LABELS: Record<string, string> = {
  badminton: 'cầu lông',
  pickleball: 'pickleball',
};

const DISTRICT_LABELS: Record<string, string> = {
  'thanh khe': 'Thanh Khê',
  'hai chau': 'Hải Châu',
  'ngu hanh son': 'Ngũ Hành Sơn',
  'son tra': 'Sơn Trà',
  'lien chieu': 'Liên Chiểu',
  'cam le': 'Cẩm Lệ',
  'hoa vang': 'Hòa Vang',
  'hoa xuan': 'Hòa Xuân',
  'an khe': 'An Khê',
};

const normalizeText = (value: unknown): string =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

const detectIntent = (prompt: string): Intent => {
  const text = normalizeText(prompt).trim();

  if (/^(hi|hello|hey|chao|xin chao|alo)\b/.test(text)) return 'greeting';
  if (/(ban la ai|ai la gi|lam duoc gi|giup gi|huong dan|cach dung)/.test(text)) return 'identity';
  if (/(cam on|thanks|thank you|ok|oke|duoc roi)/.test(text)) return 'thanks';
  if (detectSportType(prompt) || detectDaNangDistrict(prompt) || parseTimeToMinutes(prompt) != null) return 'search';

  return 'unknown';
};

const detectSportType = (prompt: string): string | undefined => {
  const text = normalizeText(prompt);
  const aliases: Record<string, string[]> = {
    badminton: ['badminton', 'cau long'],
    pickleball: ['pickleball'],
  };

  return Object.entries(aliases).find(([, values]) =>
    values.some((value) => text.includes(value))
  )?.[0];
};

const detectDaNangDistrict = (prompt: string): string | undefined => {
  const text = normalizeText(prompt);
  const aliases: Record<string, string[]> = {
    'thanh khe': ['thanh khe'],
    'hai chau': ['hai chau'],
    'ngu hanh son': ['ngu hanh son', 'gu hanh son'],
    'son tra': ['son tra'],
    'lien chieu': ['lien chieu'],
    'cam le': ['cam le'],
    'hoa vang': ['hoa vang'],
    'hoa xuan': ['hoa xuan'],
    'an khe': ['an khe'],
  };

  return Object.entries(aliases).find(([, values]) =>
    values.some((value) => text.includes(value))
  )?.[0];
};

const detectDateText = (prompt: string): string | undefined => {
  const text = normalizeText(prompt);
  if (text.includes('ngay mai')) return 'ngày mai';
  if (text.includes('hom nay') || text.includes('toi nay')) return 'hôm nay';
  if (text.includes('cuoi tuan')) return 'cuối tuần';
  return undefined;
};

const parseTimeToMinutes = (prompt: string): number | undefined => {
  const text = normalizeText(prompt);
  const explicitTime = text.match(/\b([01]?\d|2[0-3])\s*(?:h|:)\s*([0-5]\d)?\b/);
  if (explicitTime) return Number(explicitTime[1]) * 60 + Number(explicitTime[2] || 0);

  const hourOnly = text.match(/^(?:luc\s*)?([01]?\d|2[0-3])$/);
  if (hourOnly) return Number(hourOnly[1]) * 60;

  return undefined;
};

const parseTimeRange = (prompt: string): { start?: number; end?: number } => {
  const text = normalizeText(prompt);
  const range = text.match(/\b([01]?\d|2[0-3])\s*(?:h|:)\s*([0-5]\d)?\s*(?:den|toi|-|~)\s*([01]?\d|2[0-3])\s*(?:h|:)?\s*([0-5]\d)?\b/);
  if (!range) return { start: parseTimeToMinutes(prompt) };

  const start = Number(range[1]) * 60 + Number(range[2] || 0);
  const end = Number(range[3]) * 60 + Number(range[4] || 0);
  return { start, end: end > start ? end : undefined };
};

const formatTime = (timeMinutes?: number): string | undefined => {
  if (timeMinutes == null) return undefined;
  return `${Math.floor(timeMinutes / 60)}h${String(timeMinutes % 60).padStart(2, '0')}`;
};

const clockToMinutes = (time?: string): number | undefined => {
  const match = String(time || '').match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return undefined;
  return Number(match[1]) * 60 + Number(match[2]);
};

const isOpenAt = (court: any, timeMinutes: number): boolean => {
  const venue = court.venue || {};
  const open = clockToMinutes(venue.openTime);
  const close = clockToMinutes(venue.closeTime);
  if (open == null || close == null) return true;
  return timeMinutes >= open && timeMinutes <= close;
};

const isOpenForRange = (court: any, startMinutes?: number, endMinutes?: number): boolean => {
  if (startMinutes == null) return true;
  if (endMinutes == null) return isOpenAt(court, startMinutes);

  const venue = court.venue || {};
  const open = clockToMinutes(venue.openTime);
  const close = clockToMinutes(venue.closeTime);
  if (open == null || close == null) return true;
  return startMinutes >= open && endMinutes <= close;
};

const courtMatchesSport = (court: any, sportType: string): boolean => {
  const sports = court.sportTypes || court.sportType || court.venue?.sportTypes || [];
  return (Array.isArray(sports) ? sports : [sports])
    .map(normalizeText)
    .includes(normalizeText(sportType));
};

const courtMatchesLocation = (court: any, location: string): boolean => {
  const venue = court.venue || {};
  const haystack = normalizeText([
    court.name,
    court.location,
    court.description,
    venue.name,
    venue.location,
    venue.description,
  ].filter(Boolean).join(' '));

  // If location is not found in any field, return false
  // BUT if court has no venue populated, we should be more lenient
  // to avoid filtering out all orphan courts
  if (!court.venue && haystack.trim().length === 0) {
    // Court has no venue and no text content - skip location check
    return true;
  }

  return haystack.includes(location);
};

const toPlainCourt = (court: any) => {
  if (!court.toObject) return court;
  
  const plainCourt = court.toObject();
  
  // Manually preserve venue data if it exists
  if (court.venue) {
    plainCourt.venue = court.venue.toObject ? court.venue.toObject() : court.venue;
  }
  
  return plainCourt;
};

const getCourtVenue = (court: any) => court.venue || {};

const getCourtLocation = (court: any) => {
  const venue = getCourtVenue(court);
  return venue.location || court.location || 'Đà Nẵng';
};

const buildCriteriaText = (sportType?: string, location?: string, time?: number, dateText?: string) => {
  const parts = [
    sportType ? `môn ${SPORT_LABELS[sportType] || sportType}` : undefined,
    location ? `khu vực ${DISTRICT_LABELS[location] || location}` : undefined,
    time != null ? `${dateText ? `${dateText} ` : ''}lúc ${formatTime(time)}` : undefined,
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : 'yêu cầu của bạn';
};

const buildNeedMoreInfoMessage = (sportType?: string, location?: string, time?: number, dateText?: string) => {
  const known = buildCriteriaText(sportType, location, time, dateText);

  if (time != null && !sportType && !location) {
    return `Bạn muốn đặt sân ${dateText ? `${dateText} ` : ''}lúc ${formatTime(time)}. Bạn cho tôi biết thêm môn thể thao và khu vực muốn chơi nhé, ví dụ: "cầu lông Thanh Khê ${formatTime(time)}".`;
  }

  if (location && !sportType) {
    return `Bạn muốn tìm sân ở ${DISTRICT_LABELS[location] || location}. Bạn muốn chơi môn nào: cầu lông hay pickleball?`;
  }

  return `Mình đã hiểu ${known}. Nếu muốn lọc chính xác hơn, bạn có thể thêm khu vực hoặc giờ chơi, ví dụ: "${sportType ? SPORT_LABELS[sportType] : 'cầu lông'} Thanh Khê 20h".`;
};

const buildNoMatchMessage = (sportType?: string, location?: string, time?: number, dateText?: string) =>
  `Hiện chưa có sân phù hợp với ${buildCriteriaText(sportType, location, time, dateText)} trong hệ thống. Bạn có thể thử khu vực gần đó hoặc bỏ bớt điều kiện thời gian/khu vực.`;

const buildSuggestionMessage = (courts: any[], sportType?: string, location?: string, time?: number, dateText?: string) => {
  const count = courts.length;
  const criteria = buildCriteriaText(sportType, location, time, dateText);
  const firstLocation = courts[0] ? getCourtLocation(courts[0]) : '';

  if (count === 1) {
    return `Mình tìm thấy 1 sân phù hợp với ${criteria}: ${courts[0].name} ở ${firstLocation}. Bạn có thể xem chi tiết hoặc đặt sân ngay bên dưới.`;
  }

  return `Mình tìm thấy ${count} sân phù hợp với ${criteria}. Mình đã ưu tiên các sân đúng môn, đúng khu vực và còn trong khung giờ mở cửa. Bạn xem các lựa chọn bên dưới nhé.`;
};

const applyDistance = (courts: any[], userLat?: number, userLng?: number, maxDistance?: number) => {
  if (!userLat || !userLng) return courts.map(toPlainCourt);

  return courts
    .map((court: any) => {
      const venue = getCourtVenue(court);
      const lat = venue.lat || court.lat;
      const lng = venue.lng || court.lng;
      return {
        ...toPlainCourt(court),
        distance: lat && lng ? calculateDistance(userLat, userLng, lat, lng) : 999,
      };
    })
    .filter((court: any) => maxDistance ? court.distance <= maxDistance : true)
    .sort((a: any, b: any) => a.distance - b.distance);
};

// Helper function to filter courts by booking availability
async function filterCourtsByBookingAvailability(
  courts: any[],
  dateText: string | null,
  startTime: number | null,
  endTime: number | null
): Promise<any[]> {
  // If no time specified, return all courts
  if (startTime === null) {
    console.log('[filterBooking] No time specified, returning all courts');
    return courts;
  }

  // Parse date from text (today, tomorrow, specific date, or YYYY-MM-DD format)
  let localDate = new Date();
  if (dateText) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
      const [y, m, d] = dateText.split('-').map(Number);
      localDate = new Date(y, m - 1, d);
    } else if (dateText.includes('mai')) {
      localDate.setDate(localDate.getDate() + 1);
    }
  }
  
  // Construct UTC Date at midnight (how bookings are stored in DB)
  const bookingDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
  const nextDay = new Date(bookingDate.getTime() + 86400000);

  // Check if target date is in the past, or target time is in the past today
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const isToday = 
    localDate.getFullYear() === now.getFullYear() &&
    localDate.getMonth() === now.getMonth() &&
    localDate.getDate() === now.getDate();
  const isPast = localDate < todayMidnight;
  
  if (isPast) {
    console.log('[filterBooking] Requested date is in the past, returning no courts');
    return [];
  }
  
  if (isToday && startTime !== null) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (startTime <= currentMinutes) {
      console.log('[filterBooking] Requested start time is in the past today, returning no courts');
      return [];
    }
  }

  console.log('[filterBooking] Checking bookings for date:', bookingDate.toISOString());
  console.log('[filterBooking] Requested time (in minutes):', startTime, '-', endTime);

  // Get all bookings (excluding unpaid MoMo bookings) for this date
  const bookings = await Booking.find({
    bookingDate: {
      $gte: bookingDate,
      $lt: nextDay,
    },
    $or: [
      { status: { $in: ['CONFIRMED', 'CHECKED_IN'] } },
      { status: 'PENDING', paymentMethod: { $ne: 'momo' } }
    ]
  });



  console.log('[filterBooking] Found', bookings.length, 'confirmed bookings on this date');

  // Filter out courts with conflicting bookings
  const availableCourts = courts.filter((court: any) => {
    const courtId = court._id.toString();
    const courtBookings = bookings.filter(
      (b: any) => b.courtId && b.courtId.toString() === courtId
    );

    if (courtBookings.length === 0) {
      console.log(`[filterBooking] Court ${court.name} (${courtId}): NO bookings, AVAILABLE`);
      return true; // No bookings, available
    }

    console.log(`[filterBooking] Court ${court.name} (${courtId}): ${courtBookings.length} booking(s) found`);

    // Convert requested time from minutes to decimal hours for comparison
    const requestedStartHours = startTime / 60;
    const requestedEndHours = endTime ? endTime / 60 : requestedStartHours + 1;

    console.log(`[filterBooking] Request converted: ${requestedStartHours}h - ${requestedEndHours}h`);

    const hasConflict = courtBookings.some((booking: any) => {
      const bookingStart = parseTimeToHours(booking.startTime);
      const bookingEnd = parseTimeToHours(booking.endTime);

      // Overlap check: (start1 < end2) && (end1 > start2)
      const overlap = requestedStartHours < bookingEnd && requestedEndHours > bookingStart;
      
      console.log(`[filterBooking]   - Booking ${booking._id}: ${booking.startTime}-${booking.endTime} (${bookingStart}h-${bookingEnd}h) vs request (${requestedStartHours}h-${requestedEndHours}h) => ${overlap ? 'CONFLICT' : 'OK'}`);

      return overlap;
    });

    if (hasConflict) {
      console.log(`[filterBooking] Court ${court.name}: EXCLUDED (has conflict)`);
    } else {
      console.log(`[filterBooking] Court ${court.name}: AVAILABLE (no conflict)`);
    }

    return !hasConflict; // Available if no conflict
  });

  console.log('[filterBooking] Filtered from', courts.length, 'to', availableCourts.length, 'available courts');
  
  return availableCourts;
}

// Helper to convert "HH:mm" to decimal hours
function parseTimeToHours(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
}

export class CourtService {
  static async suggestCourts(params: CourtSuggestionParams): Promise<CourtSuggestionResponse> {
    const { prompt, history, userLat, userLng, maxDistance = 10, limit = 5 } = params;

    const now = new Date();
    const currentDayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][now.getDay()];
    const currentDateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const currentDateDashStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let intent: Intent = 'unknown';
    let requestedSportType: string | undefined = undefined;
    let requestedLocation: string | undefined = undefined;
    let requestedTime: number | undefined = undefined;
    let requestedEndTime: number | undefined = undefined;
    let requestedDateText: string | undefined = undefined;
    let requestedComboType: 'week' | 'month' | undefined = undefined;
    let aiExplanation: string = '';
    let tomorrowFallbackActive = false;

    // Step 1: LLM Parsing of User Intent and Parameters
    try {
      const ezsportKnowledge = `
=== KIẾN THỨC VỀ EZSPORT ===

EZSport là nền tảng đặt sân thể thao trực tuyến tại Đà Nẵng, hỗ trợ các môn: cầu lông và pickleball.

QUY TRÌNH ĐẶT SÂN:
- Người dùng tìm sân qua AI chat hoặc trang bản đồ/danh sách sân.
- Chọn sân → chọn giờ → thanh toán → nhận mã check-in.
- Phương thức thanh toán: Tiền mặt (cash) hoặc PayOS (chuyển khoản ngân hàng online).

HỦY SÂN & CHÍNH SÁCH:
- Người dùng có thể hủy đặt sân trong trang "Lịch sử đặt sân" (My Bookings).
- Chỉ hủy được các booking ở trạng thái PENDING hoặc CONFIRMED (chưa check-in).
- Booking đã CHECKED_IN hoặc COMPLETED không thể hủy.

CHECK-IN:
- Sau khi đặt sân thành công, người dùng nhận được mã check-in (QR hoặc code).
- Chủ sân xác nhận check-in tại quầy lễ tân.
- Số lần check-in được ghi nhận trong hồ sơ người dùng.

COMBO:
- Combo tuần (week): đặt 2 buổi trong 1 tuần, được giảm giá.
- Combo tháng (month): đặt 4 buổi trong 1 tháng, được giảm giá nhiều hơn.
- Mức giảm giá combo do chủ sân cấu hình riêng cho từng sân.

PLAYMATE - TÌM NGƯỜI CHƠI CÙNG:
- Tính năng Playmate giúp người dùng tìm bạn chơi thể thao cùng.
- Đăng bài tìm đồng đội: chọn môn, ngày, giờ, số người cần thêm, địa điểm, mức độ kỹ năng.
- Người khác có thể xem và tham gia (join) các bài đăng playmate.
- Số lần tham gia playmate được ghi nhận trong hồ sơ.

ĐÁNH GIÁ NGƯỜI DÙNG:
- Sau khi chơi cùng qua Playmate, người dùng có thể đánh giá nhau (1-5 sao + nhận xét).
- Điểm đánh giá trung bình hiển thị trên hồ sơ cá nhân.

ĐÁNH GIÁ SÂN:
- Người dùng có thể đánh giá sân sau khi sử dụng.
- Điểm rating ảnh hưởng đến thứ tự hiển thị sân trong kết quả tìm kiếm.

DASHBOARD NGƯỜI DÙNG:
- Xem lịch sử đặt sân, số lần check-in, số lần tham gia playmate.
- Chỉnh sửa thông tin cá nhân, ảnh đại diện.

DASHBOARD CHỦ SÂN (OWNER):
- Quản lý sân, lịch đặt, doanh thu theo thời gian thực.
- Xác nhận/hủy booking, xem thống kê.

ADMIN:
- Quản lý toàn bộ người dùng, sân, voucher khuyến mãi.

=== HẾT KIẾN THỨC ===
`;

      const systemPrompt = `Bạn là trợ lý AI thân thiện của EZSport - nền tảng đặt sân thể thao tại Đà Nẵng.
Thời gian thực tế hiện tại của hệ thống là: ${currentTimeStr} ngày ${currentDayOfWeek} (${currentDateStr}).

${ezsportKnowledge}

Hãy phân tích câu nhập mới nhất của người dùng kết hợp với lịch sử trò chuyện được cung cấp để suy luận đầy đủ thông tin.
Hãy trả về một đối tượng JSON duy nhất (không có markdown, không có chữ thừa) với các trường sau:
{
  "intent": "greeting" | "identity" | "thanks" | "search" | "faq" | "support" | "unknown",
  "sportType": "badminton" | "pickleball" | null,
  "location": "Thanh Khê" | "Hải Châu" | "Ngũ Hành Sơn" | "Sơn Trà" | "Liên Chiểu" | "Cẩm Lệ" | "Hòa Vang" | "Hòa Xuân" | "An Khê" | null,
  "date": "YYYY-MM-DD" hoặc null,
  "startTime": "HH:mm" hoặc null,
  "endTime": "HH:mm" hoặc null,
  "comboType": "week" | "month" | null,
  "aiExplanation": "Câu trả lời tiếng Việt thân thiện, đầy đủ, chính xác dựa trên kiến thức EZSport ở trên."
}

PHÂN LOẠI INTENT:
- "greeting": Chào hỏi (xin chào, hello, hi, alo...)
- "identity": Hỏi về bản thân AI (bạn là ai, làm được gì, hướng dẫn...)
- "thanks": Cảm ơn, ổn rồi, được rồi...
- "search": Tìm/đặt sân thể thao (cần sportType hoặc location hoặc time)
- "faq": Câu hỏi về quy trình, chính sách, tính năng EZSport (hủy sân, combo, check-in, playmate, đánh giá, thanh toán, điểm tích lũy...)
- "support": Báo lỗi, khiếu nại, cần hỗ trợ kỹ thuật
- "unknown": Không xác định được

QUY TẮC QUAN TRỌNG:
1. Nếu intent là "faq" hoặc "support": Hãy điền "aiExplanation" với câu trả lời ĐẦY ĐỦ, CHÍNH XÁC dựa trên kiến thức EZSport ở trên. Đây là quan trọng nhất - người dùng cần được trả lời cụ thể.
2. Nếu intent là "search" nhưng KHÔNG có ngày chơi → chuyển thành "unknown" với aiExplanation yêu cầu bổ sung ngày.
3. sportType: cầu lông/badminton → "badminton", pickleball → "pickleball".
4. date: Tính chính xác từ ngày hiện tại ${currentDateStr}. Ngày mai → "${tomorrowDateStr}". Hôm nay/tối nay → "${currentDateDashStr}".
5. startTime/endTime: "chiều tối" → "17:00", "buổi sáng" → "08:00", "tối" → "19:00".
6. comboType: "combo tuần/1 tuần" → "week", "combo tháng/1 tháng" → "month", không đề cập → null.`;

      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ];

      if (history && history.length > 0) {
        const recentHistory = history.slice(-10);
        for (const msg of recentHistory) {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        }
      }

      messages.push({ role: 'user', content: prompt });

      const completion = await openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      console.log('[AI suggest parser] RAW LLM response content:', completion.choices[0].message.content);
      const parsed = JSON.parse(completion.choices[0].message.content || '{}');
      intent = parsed.intent || 'unknown';
      requestedSportType = parsed.sportType || undefined;
      
      const locationMap: Record<string, string> = {
        'Thanh Khê': 'thanh khe',
        'Hải Châu': 'hai chau',
        'Ngũ Hành Sơn': 'ngu hanh son',
        'Sơn Trà': 'son tra',
        'Liên Chiểu': 'lien chieu',
        'Cẩm Lệ': 'cam le',
        'Hòa Vang': 'hoa vang',
        'Hòa Xuân': 'hoa xuan',
        'An Khê': 'an khe'
      };

      if (parsed.location) {
        requestedLocation = locationMap[parsed.location] || normalizeText(parsed.location);
      }
      
      requestedDateText = parsed.date || parsed.dateText || undefined;
      aiExplanation = parsed.aiExplanation || '';
      requestedComboType = parsed.comboType || undefined;

      if (parsed.startTime) {
        const [h, m] = parsed.startTime.split(':').map(Number);
        requestedTime = h * 60 + (m || 0);
      }
      if (parsed.endTime) {
        const [h, m] = parsed.endTime.split(':').map(Number);
        requestedEndTime = h * 60 + (m || 0);
      } else if (requestedTime != null) {
        requestedEndTime = requestedTime + 60; // mặc định 1 tiếng
      }

      console.log('[AI suggest parser] parsed output:', { intent, requestedSportType, requestedLocation, requestedDateText, requestedTime, requestedEndTime, requestedComboType });
    } catch (err) {
      console.warn('[AI suggest parser] LLM parser failed, falling back to regex rules:', err);
      // Fallback
      requestedSportType = detectSportType(prompt);
      requestedLocation = detectDaNangDistrict(prompt);
      const requestedTimeRange = parseTimeRange(prompt);
      requestedTime = requestedTimeRange.start;
      requestedEndTime = requestedTimeRange.end;
      requestedDateText = detectDateText(prompt);
      intent = detectIntent(prompt);
    }

    // Direct regex reinforcement to guarantee comboType detection
    const lowerPrompt = normalizeText(prompt);
    if (lowerPrompt.includes('combo 1 thang') || lowerPrompt.includes('combo thang') || lowerPrompt.includes('monthly combo') || lowerPrompt.includes('dat thang')) {
      requestedComboType = 'month';
    } else if (lowerPrompt.includes('combo 1 tuan') || lowerPrompt.includes('combo tuan') || lowerPrompt.includes('weekly combo') || lowerPrompt.includes('dat tuan')) {
      requestedComboType = 'week';
    }

    try {
      // Programmatic check: Missing date for search intent
      if (intent === 'search' && !requestedDateText) {
        return {
          suggestions: [],
          aiExplanation: "Bạn muốn đặt sân chơi vào hôm nay hay ngày nào khác ạ? Vui lòng bổ sung ngày chơi để mình kiểm tra lịch trống chính xác nhé!",
          matchedCriteria: {
            sportType: requestedSportType,
            location: requestedLocation,
          },
        };
      }

      // Programmatic check: Past time today
      if (requestedTime != null) {
        const isToday = requestedDateText === currentDateDashStr || requestedDateText === 'hôm nay' || !requestedDateText;
        if (isToday) {
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          if (requestedTime <= currentMinutes) {
            requestedDateText = tomorrowDateStr;
            tomorrowFallbackActive = true;
          }
        }
      }

      // Step 2: Handle non-search intents
      if (intent === 'greeting') {
        return {
          suggestions: [],
          aiExplanation: aiExplanation || 'Chào bạn, mình là EZSport AI. Bạn muốn tìm sân môn gì, ở khu vực nào và khoảng mấy giờ?',
          matchedCriteria: {},
        };
      }

      if (intent === 'identity') {
        return {
          suggestions: [],
          aiExplanation: aiExplanation || 'Mình là EZSport AI, trợ lý giúp bạn tìm sân thể thao ở Đà Nẵng. Bạn có thể nhắn kiểu: "cầu lông Thanh Khê 20h", "pickleball gần tôi", hoặc "sân bóng đá Hải Châu tối nay".',
          matchedCriteria: {},
        };
      }

      if (intent === 'thanks') {
        return {
          suggestions: [],
          aiExplanation: aiExplanation || 'Không có gì! 😊 Khi cần tìm sân, bạn chỉ cần nhắn môn thể thao, khu vực và giờ chơi là mình sẽ tìm ngay cho bạn.',
          matchedCriteria: {},
        };
      }

      // FAQ: Câu hỏi về quy trình, chính sách, tính năng EZSport
      if (intent === 'faq') {
        return {
          suggestions: [],
          aiExplanation: aiExplanation || 'Bạn muốn hỏi gì về EZSport? Mình có thể giải đáp về quy trình đặt sân, hủy sân, combo, check-in, playmate, đánh giá và thanh toán.',
          matchedCriteria: {},
        };
      }

      // Support: Báo lỗi hoặc cần hỗ trợ kỹ thuật
      if (intent === 'support') {
        return {
          suggestions: [],
          aiExplanation: aiExplanation || 'Mình xin lỗi vì sự bất tiện này! 🙏 Để được hỗ trợ kỹ thuật nhanh nhất, bạn vui lòng liên hệ qua email hỗ trợ hoặc fanpage EZSport. Mình sẽ ghi nhận và chuyển vấn đề của bạn đến đội ngũ kỹ thuật ngay.',
          matchedCriteria: {},
        };
      }

      if (intent === 'unknown') {
        return {
          suggestions: [],
          aiExplanation: aiExplanation || 'Mình có thể giúp bạn:\n• 🏸 Tìm sân thể thao: "cầu lông Thanh Khê 20h hôm nay"\n• ❓ Giải đáp thắc mắc: "hủy sân như thế nào?", "combo là gì?"\n• 🤝 Tìm bạn chơi cùng: "tìm người chơi cầu lông"\n\nBạn muốn làm gì ạ?',
          matchedCriteria: {},
        };
      }

      // Step 3: Fetch active courts and filter
      let allCourts = await Court.find({ isActive: true }).populate('venue');
      
      // Filter out orphan courts that do not belong to a valid venue
      allCourts = allCourts.filter((court: any) => court.venue !== null && court.venue !== undefined);

      if (allCourts.length === 0) {
        return {
          suggestions: [],
          aiExplanation: 'Hiện tại hệ thống chưa có sân khả dụng nào.',
          matchedCriteria: {},
        };
      }

      if (requestedTime != null && !requestedSportType && !requestedLocation) {
        return {
          suggestions: [],
          aiExplanation: buildNeedMoreInfoMessage(undefined, undefined, requestedTime, requestedDateText),
          matchedCriteria: {},
        };
      }

      if (requestedLocation && !requestedSportType) {
        return {
          suggestions: [],
          aiExplanation: buildNeedMoreInfoMessage(undefined, requestedLocation, requestedTime, requestedDateText),
          matchedCriteria: { location: requestedLocation },
        };
      }

      const candidateCourts = allCourts.filter((court: any) => {
        if (requestedSportType && !courtMatchesSport(court, requestedSportType)) return false;
        if (requestedLocation) {
          if (!court.venue) return false;
          if (!courtMatchesLocation(court, requestedLocation)) return false;
        }
        if (!isOpenForRange(court, requestedTime, requestedEndTime)) return false;
        return true;
      });

      // Filter by booking availability
      let availableCourts = await filterCourtsByBookingAvailability(
        candidateCourts,
        requestedDateText || null,
        requestedTime ?? null,
        requestedEndTime ?? null
      );

      let usedLocationFallback = false;
      if (availableCourts.length === 0 && requestedLocation) {
        // Fallback: try finding courts without location filter
        const courtsWithoutLocationFilter = allCourts.filter((court: any) => {
          if (requestedSportType && !courtMatchesSport(court, requestedSportType)) return false;
          if (!isOpenForRange(court, requestedTime, requestedEndTime)) return false;
          return true;
        });

        const availableWithoutLocation = await filterCourtsByBookingAvailability(
          courtsWithoutLocationFilter,
          requestedDateText || null,
          requestedTime ?? null,
          requestedEndTime ?? null
        );

        if (availableWithoutLocation.length > 0) {
          availableCourts = availableWithoutLocation;
          usedLocationFallback = true;
        }
      }

      const shouldUseDistance = Boolean(userLat && userLng && !requestedLocation);
      const rankedCourts = shouldUseDistance
        ? applyDistance(availableCourts, userLat, userLng, maxDistance)
        : availableCourts.map(toPlainCourt);

      const suggestions = rankedCourts.slice(0, limit);

      // Step 4: Generate rich dynamic conversational response using LLM
      if (suggestions.length === 0) {
        try {
          const apologyPrompt = `Bạn là trợ lý AI EZSport thân thiện. Khách hàng yêu cầu: "${prompt}".
Rất tiếc là hệ thống hiện không tìm thấy sân nào trống phù hợp với yêu cầu này (về môn thể thao, thời gian chơi hoặc địa điểm).
Hãy viết một lời phản hồi tự nhiên, lịch sự (2-3 câu) bằng tiếng Việt xin lỗi khách hàng và khuyên họ thử đổi giờ chơi khác hoặc chọn địa điểm khác nhé.`;
          
          const completion = await openai.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: apologyPrompt }],
            temperature: 0.7,
            max_tokens: 250,
          });
          aiExplanation = completion.choices[0].message.content || buildNoMatchMessage(requestedSportType, requestedLocation, requestedTime, requestedDateText);
        } catch {
          aiExplanation = buildNoMatchMessage(requestedSportType, requestedLocation, requestedTime, requestedDateText);
        }

        return {
          suggestions: [],
          aiExplanation,
          matchedCriteria: {
            sportType: requestedSportType,
            location: requestedLocation,
          },
        };
      }

      try {
        const courtsInfo = suggestions.map((c, idx) => {
          const venue = c.venue || {};
          const priceStr = c.pricePerHour ? `${Number(c.pricePerHour).toLocaleString('vi-VN')} VNĐ/giờ` : 'Liên hệ';
          return `${idx + 1}. ${c.name} tại địa chỉ ${venue.location || 'Đà Nẵng'} (Giá: ${priceStr})`;
        }).join('\n');

        let suggestPrompt = '';
        if (tomorrowFallbackActive) {
          suggestPrompt = `Bạn là trợ lý AI EZSport thân thiện. Khách hàng yêu cầu chơi ngày hôm nay (hoặc ngầm hiểu hôm nay), nhưng giờ chơi đó đã trôi qua so với giờ hiện tại.
Chúng tôi đã tự động chuyển ngày chơi sang Ngày Mai và tìm thấy các sân trống phù hợp sau:
${courtsInfo}

Hãy viết một phản hồi ngắn gọn, tự nhiên và thân thiện (2-3 câu) bằng tiếng Việt giải thích khéo léo rằng giờ chơi hôm nay đã trôi qua rồi, nên hệ thống đề xuất các sân này vào Ngày Mai để họ tham khảo đặt sân bên dưới.
LƯU Ý CỰC KỲ QUAN TRỌNG: Chỉ được giới thiệu và sử dụng tên sân/địa chỉ chính xác trong danh sách được cung cấp. Tuyệt đối không tự bịa ra quận/huyện/địa điểm/tên sân khác không có trong danh sách.`;
        } else if (usedLocationFallback) {
          suggestPrompt = `Bạn là trợ lý AI EZSport thân thiện. Khách hàng yêu cầu tìm sân ở khu vực cụ thể: "${prompt}".
Tuy nhiên, các sân trống ở khu vực đó đã hết. Chúng tôi đã tìm thấy một số sân trống phù hợp trong hệ thống như sau:
${courtsInfo}

Hãy viết một phản hồi ngắn gọn, tự nhiên (2-3 câu) bằng tiếng Việt giải thích khéo léo rằng khu vực họ tìm hiện đã hết sân trống, và giới thiệu các sân thay thế này cho họ.
LƯU Ý CỰC KỲ QUAN TRỌNG: Chỉ được giới thiệu và sử dụng đúng tên sân/địa chỉ chính xác trong danh sách được cung cấp. Tuyệt đối không tự bịa ra hay suy đoán quận/huyện/địa điểm khác ngoài thông tin địa chỉ cụ thể có sẵn trong danh sách trên.`;
        } else {
          suggestPrompt = `Bạn là trợ lý AI EZSport thân thiện. Khách hàng yêu cầu: "${prompt}".
Chúng tôi đã tìm thấy các sân trống phù hợp sau:
${courtsInfo}

Hãy viết một phản hồi ngắn gọn, thân thiện (2-3 câu) bằng tiếng Việt để giới thiệu các sân này và khuyến khích họ chọn đặt sân bên dưới.
LƯU Ý CỰC KỲ QUAN TRỌNG: Chỉ được giới thiệu và sử dụng tên sân/địa chỉ chính xác trong danh sách được cung cấp. Tuyệt đối không tự bịa ra quận/huyện/địa điểm khác ngoài danh sách.`;
        }

        const completion = await openai.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: suggestPrompt }],
          temperature: 0.6,
          max_tokens: 300,
        });

        aiExplanation = completion.choices[0].message.content || buildSuggestionMessage(suggestions, requestedSportType, requestedLocation, requestedTime, requestedDateText);
      } catch (err) {
        aiExplanation = buildSuggestionMessage(suggestions, requestedSportType, requestedLocation, requestedTime, requestedDateText);
      }

      let localDate = new Date();
      if (requestedDateText) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(requestedDateText)) {
          const [y, m, d] = requestedDateText.split('-').map(Number);
          localDate = new Date(y, m - 1, d);
        } else if (requestedDateText.includes('mai')) {
          localDate.setDate(localDate.getDate() + 1);
        }
      }
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const formatMinutesToHHMM = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      };

      const parsedSlot = requestedTime != null ? {
        date: formattedDate,
        startTime: formatMinutesToHHMM(requestedTime),
        endTime: formatMinutesToHHMM(requestedEndTime || (requestedTime + 60)),
        duration: Math.max(1, ((requestedEndTime || (requestedTime + 60)) - requestedTime) / 60),
        comboType: requestedComboType,
      } : undefined;

      return {
        suggestions,
        aiExplanation,
        matchedCriteria: {
          sportType: requestedSportType,
          location: requestedLocation,
        },
        parsedSlot,
      };

    } catch (error: any) {
      console.error('Error in suggestCourts:', error);
      return {
        suggestions: [],
        aiExplanation: 'Mình đang gặp lỗi khi tìm sân. Bạn thử lại sau ít phút hoặc nhập rõ hơn theo mẫu: "cầu lông Thanh Khê 20h".',
        matchedCriteria: {},
      };
    }
  }

  static async generateCourtDescription(courtId: string): Promise<string> {
    try {
      const court = await Court.findById(courtId).populate('venue');
      if (!court) throw new Error('Không tìm thấy sân');

      const venue = (court as any).venue || {};
      const priceText = court.pricePerHour
        ? `${Number(court.pricePerHour).toLocaleString('vi-VN')} VNĐ / giờ`
        : (venue.price || 'Liên hệ');
      const prompt = `Viết mô tả ngắn bằng tiếng Việt cho sân:
- Tên: ${court.name}
- Loại sân: ${((court as any).sportTypes || []).join(', ')}
- Địa điểm: ${venue.location || 'Đà Nẵng'}
- Giá: ${priceText}

Yêu cầu: 2-3 câu, tự nhiên, không bịa thông tin ngoài dữ liệu trên.`;

      const completion = await openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 200,
      });

      return completion.choices[0].message.content || (court as any).description || '';
    } catch (error: any) {
      console.error('Error generating description:', error);
      throw error;
    }
  }

  static async compareCourts(courtIds: string[]): Promise<string> {
    try {
      const courts = await Court.find({ _id: { $in: courtIds }, isActive: true }).populate('venue');
      if (courts.length === 0) throw new Error('Không tìm thấy sân nào để so sánh');

      const courtsInfo = courts
        .map((court: any) => {
          const venue = court.venue || {};
          const priceText = court.pricePerHour
            ? `${Number(court.pricePerHour).toLocaleString('vi-VN')} VNĐ / giờ`
            : (venue.price || 'Liên hệ');
          return `- ${court.name}: ${(court.sportTypes || []).join(', ')}, ${priceText}, tại ${venue.location || 'Đà Nẵng'}`;
        })
        .join('\n');

      const completion = await openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `So sánh các sân sau bằng tiếng Việt, chỉ dùng dữ liệu được cung cấp:\n\n${courtsInfo}`,
        }],
        temperature: 0.4,
        max_tokens: 500,
      });

      return completion.choices[0].message.content || 'Không thể so sánh các sân.';
    } catch (error: any) {
      console.error('Error comparing courts:', error);
      throw error;
    }
  }
}
