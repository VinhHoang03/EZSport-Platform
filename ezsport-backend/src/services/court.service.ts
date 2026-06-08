import { openai } from '../configs/openai';
import Court from '../models/court.model';
import { calculateDistance } from '../utils/distance.util';

interface CourtSuggestionParams {
  prompt: string;
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
}

type Intent = 'greeting' | 'identity' | 'thanks' | 'search' | 'unknown';

const SPORT_LABELS: Record<string, string> = {
  badminton: 'cầu lông',
  pickleball: 'pickleball',
  soccer: 'bóng đá',
  tennis: 'tennis',
  basketball: 'bóng rổ',
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
    soccer: ['soccer', 'football', 'bong da', 'da banh'],
    tennis: ['tennis', 'quan vot'],
    basketball: ['basketball', 'bong ro'],
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
    return `Bạn muốn tìm sân ở ${DISTRICT_LABELS[location] || location}. Bạn muốn chơi môn nào: cầu lông, pickleball, bóng đá, tennis hay bóng rổ?`;
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

export class CourtService {
  static async suggestCourts(params: CourtSuggestionParams): Promise<CourtSuggestionResponse> {
    const { prompt, userLat, userLng, maxDistance = 10, limit = 5 } = params;
    const requestedSportType = detectSportType(prompt);
    const requestedLocation = detectDaNangDistrict(prompt);
    const requestedTimeRange = parseTimeRange(prompt);
    const requestedTime = requestedTimeRange.start;
    const requestedEndTime = requestedTimeRange.end;
    const requestedDateText = detectDateText(prompt);
    const intent = detectIntent(prompt);

    try {
      if (intent === 'greeting') {
        return {
          suggestions: [],
          aiExplanation: 'Chào bạn, mình là EZSport AI. Bạn muốn tìm sân môn gì, ở khu vực nào và khoảng mấy giờ?',
          matchedCriteria: {},
        };
      }

      if (intent === 'identity') {
        return {
          suggestions: [],
          aiExplanation: 'Mình là EZSport AI, trợ lý giúp bạn tìm sân thể thao ở Đà Nẵng. Bạn có thể nhắn kiểu: "cầu lông Thanh Khê 20h", "pickleball gần tôi", hoặc "sân bóng đá Hải Châu tối nay".',
          matchedCriteria: {},
        };
      }

      if (intent === 'thanks') {
        return {
          suggestions: [],
          aiExplanation: 'Không có gì. Khi cần tìm sân, bạn chỉ cần gửi môn thể thao, khu vực và giờ chơi là được.',
          matchedCriteria: {},
        };
      }

      if (intent === 'unknown') {
        return {
          suggestions: [],
          aiExplanation: 'Mình chưa hiểu bạn muốn tìm sân nào. Bạn thử nhập theo mẫu: "cầu lông Thanh Khê 20h" hoặc "pickleball Ngũ Hành Sơn ngày mai" nhé.',
          matchedCriteria: {},
        };
      }

      const allCourts = await Court.find({ isActive: true }).populate('venue');

      if (allCourts.length === 0) {
        return {
          suggestions: [],
          aiExplanation: 'Hiện tại hệ thống chưa có sân khả dụng.',
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
        // If location is requested, require court to have venue AND match location
        if (requestedLocation) {
          if (!court.venue) return false; // No venue = can't match location
          if (!courtMatchesLocation(court, requestedLocation)) return false;
        }
        if (!isOpenForRange(court, requestedTime, requestedEndTime)) return false;
        return true;
      });

      if (candidateCourts.length === 0) {
        // Try again without location filter if originally requested location
        if (requestedLocation) {
          const courtsWithoutLocationFilter = allCourts.filter((court: any) => {
            if (requestedSportType && !courtMatchesSport(court, requestedSportType)) return false;
            if (!isOpenForRange(court, requestedTime, requestedEndTime)) return false;
            return true;
          });
          
          if (courtsWithoutLocationFilter.length > 0) {
            const shouldUseDistance = Boolean(userLat && userLng);
            const rankedCourts = shouldUseDistance
              ? applyDistance(courtsWithoutLocationFilter, userLat, userLng, maxDistance)
              : courtsWithoutLocationFilter.map(toPlainCourt);

            const suggestions = rankedCourts.slice(0, limit);
            
            return {
              suggestions,
              aiExplanation: `Mình không tìm thấy sân ${requestedSportType ? SPORT_LABELS[requestedSportType] : ''} ở ${DISTRICT_LABELS[requestedLocation] || requestedLocation}, nhưng có ${suggestions.length} sân ${requestedSportType ? SPORT_LABELS[requestedSportType] : ''} khác trong hệ thống. Bạn có thể xem các lựa chọn bên dưới nhé.`,
              matchedCriteria: {
                sportType: requestedSportType,
              },
            };
          }
        }
        
        return {
          suggestions: [],
          aiExplanation: buildNoMatchMessage(requestedSportType, requestedLocation, requestedTime, requestedDateText),
          matchedCriteria: {
            sportType: requestedSportType,
            location: requestedLocation,
          },
        };
      }

      const shouldUseDistance = Boolean(userLat && userLng && !requestedLocation);
      const rankedCourts = shouldUseDistance
        ? applyDistance(candidateCourts, userLat, userLng, maxDistance)
        : candidateCourts.map(toPlainCourt);

      const suggestions = rankedCourts.slice(0, limit);

      if (suggestions.length === 0) {
        return {
          suggestions: [],
          aiExplanation: buildNoMatchMessage(requestedSportType, requestedLocation, requestedTime, requestedDateText),
          matchedCriteria: {
            sportType: requestedSportType,
            location: requestedLocation,
          },
        };
      }

      return {
        suggestions,
        aiExplanation: buildSuggestionMessage(suggestions, requestedSportType, requestedLocation, requestedTime, requestedDateText),
        matchedCriteria: {
          sportType: requestedSportType,
          location: requestedLocation,
        },
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
