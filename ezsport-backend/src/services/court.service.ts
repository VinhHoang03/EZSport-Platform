import { openai } from "../configs/openai";
import Court, { ICourt } from "../models/court.model";

interface CourtSuggestionParams {
  prompt: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number; // km
  limit?: number;
}

interface CourtSuggestionResponse {
  suggestions: ICourt[];
  aiExplanation: string;
  matchedCriteria: {
    sportType?: string;
    priceRange?: string;
    location?: string;
    features?: string[];
  };
}

export class CourtService {
  /**
   * Sử dụng OpenAI để phân tích prompt và gợi ý sân phù hợp
   */
  static async suggestCourts(
    params: CourtSuggestionParams
  ): Promise<CourtSuggestionResponse> {
    const { prompt, userLat, userLng, maxDistance = 10, limit = 5 } = params;

    try {
      // Bước 1: Lấy tất cả sân đang hoạt động
      const allCourts = await Court.find({ isActive: true });

      if (allCourts.length === 0) {
        return {
          suggestions: [],
          aiExplanation: "Hiện tại không có sân nào khả dụng trong hệ thống.",
          matchedCriteria: {},
        };
      }

      // Bước 2: Tạo context về các sân có sẵn cho AI
      const courtsContext = allCourts
        .map(
          (court, index) =>
            `${index + 1}. ${court.name}
   - Loại sân: ${court.sportType}
   - Địa điểm: ${court.location}
   - Giá: ${court.price}
   - Đánh giá: ${court.rating}/5
   - Mô tả: ${court.description || "Không có mô tả"}
   - ID: ${court._id}`
        )
        .join("\n\n");

      // Bước 3: Gọi AI - thông minh, trò chuyện tự nhiên
      const systemPrompt = `Bạn là EZSport AI - trợ lý thông minh của nền tảng đặt sân thể thao EZSport tại Việt Nam.
Bạn thân thiện, vui vẻ và có thể trò chuyện tự nhiên với người dùng.

Danh sách sân hiện có trong hệ thống:
${courtsContext}

CÁCH XỬ LÝ CÁC LOẠI TIN NHẮN:

1. CHÀO HỎI ("hello", "hi", "xin chào", "chào", "hey", v.v):
   → Chào lại thân thiện, tự giới thiệu là AI của EZSport, hỏi user muốn tìm sân gì
   → recommendedCourtIds = []

2. HỎI VỀ BẠN LÀ AI ("bạn là ai", "bạn làm được gì", v.v):
   → Giới thiệu: là EZSport AI, có thể tìm sân, gợi ý, so sánh sân thể thao
   → recommendedCourtIds = []

3. TÌM SÂN / HỎI VỀ THỂ THAO:
   → Gợi ý sân phù hợp nhất từ danh sách trên, tối đa ${limit} sân
   → recommendedCourtIds = [danh sách ID sân phù hợp]

4. CẢM ƠN / KÉT THÚC HỘI THOẠI:
   → Trả lời lịch sự, hỏi có cần thêm gì không
   → recommendedCourtIds = []

5. CHỦ ĐỀ KHÁC (thời tiết, nấu ăn, tin tức, v.v):
   → Trả lời ngắn gọn lịch sự, sau đó hỏi nhẹ nhàng có muốn tìm sân không
   → recommendedCourtIds = []

ĐỊNH DẠNG PHẢN HỒI (JSON bắt buộc):
{
  "recommendedCourtIds": [],
  "explanation": "Nội dung tin nhắn trả lời người dùng (tiếng Việt, thân thiện, có thể dùng emoji)",
  "matchedCriteria": {
    "sportType": "",
    "priceRange": "",
    "location": "",
    "features": []
  }
}

LƯU Ý QUAN TRỌNG:
- KHÔNG BAO GIỜ nói cứng nhắc kiểu "Tôi chỉ có thể giúp tìm sân thể thao"
- Luôn trả lời tự nhiên như một người bạn thân thiện
- Dùng emoji để tin nhắn sinh động hơn 😊`;

      const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.85,
        response_format: { type: "json_object" },
      });

      const aiResponse = completion.choices[0].message.content;
      if (!aiResponse) {
        throw new Error("AI không trả về kết quả");
      }

      const parsedResponse = JSON.parse(aiResponse);

      // Bước 4: Lấy thông tin chi tiết các sân được gợi ý
      const recommendedCourtIds = parsedResponse.recommendedCourtIds || [];
      let suggestedCourts: any[] = allCourts.filter((court) =>
        recommendedCourtIds.includes(court._id.toString())
      );

      // Bước 5: Nếu có vị trí người dùng, tính distance và sắp xếp (KHÔNG filter loại bỏ sân xa)
      if (userLat && userLng) {
        const { calculateDistance } = await import("../utils/distance.util");
        
        suggestedCourts = suggestedCourts
          .map((court) => ({
            ...court.toObject(),
            distance: calculateDistance(userLat, userLng, court.lat, court.lng),
          }))
          .sort((a: any, b: any) => a.distance - b.distance)
          .slice(0, limit);
      } else {
        suggestedCourts = suggestedCourts
          .map((court) => court.toObject ? court.toObject() : court)
          .slice(0, limit);
      }

      return {
        suggestions: suggestedCourts,
        aiExplanation: parsedResponse.explanation || "Đây là các sân được gợi ý cho bạn.",
        matchedCriteria: parsedResponse.matchedCriteria || {},
      };
    } catch (error: any) {
      console.error("Error in suggestCourts:", error);
      
      // Fallback: Nếu AI lỗi, trả về các sân có rating cao nhất
      const fallbackCourts = await Court.find({ isActive: true })
        .sort({ rating: -1 })
        .limit(limit);

      return {
        suggestions: fallbackCourts,
        aiExplanation:
          "Không thể xử lý yêu cầu của bạn bằng AI. Đây là các sân được đánh giá cao nhất.",
        matchedCriteria: {},
      };
    }
  }

  /**
   * Tạo mô tả chi tiết cho sân bằng AI
   */
  static async generateCourtDescription(courtId: string): Promise<string> {
    try {
      const court = await Court.findById(courtId);
      if (!court) {
        throw new Error("Không tìm thấy sân");
      }

      const prompt = `Hãy tạo một mô tả hấp dẫn và chi tiết cho sân thể thao sau:
- Tên: ${court.name}
- Loại sân: ${court.sportType}
- Địa điểm: ${court.location}
- Giá: ${court.price}
- Đánh giá: ${court.rating}/5

Mô tả nên:
- Dài khoảng 2-3 câu
- Nhấn mạnh điểm mạnh của sân
- Thân thiện và hấp dẫn
- Phù hợp với người Việt Nam`;

      const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 200,
      });

      return completion.choices[0].message.content || court.description || "";
    } catch (error: any) {
      console.error("Error generating description:", error);
      throw error;
    }
  }

  /**
   * So sánh nhiều sân và đưa ra phân tích
   */
  static async compareCourts(courtIds: string[]): Promise<string> {
    try {
      const courts = await Court.find({ _id: { $in: courtIds }, isActive: true });

      if (courts.length === 0) {
        throw new Error("Không tìm thấy sân nào để so sánh");
      }

      const courtsInfo = courts
        .map(
          (court) =>
            `- ${court.name}: ${court.sportType}, ${court.price}, rating ${court.rating}/5, tại ${court.location}`
        )
        .join("\n");

      const prompt = `Hãy so sánh các sân thể thao sau và đưa ra phân tích chi tiết:

${courtsInfo}

Phân tích nên bao gồm:
1. Điểm mạnh và điểm yếu của từng sân
2. Sân nào phù hợp với từng nhu cầu (tiết kiệm, chất lượng cao, gần gũi...)
3. Đề xuất lựa chọn tốt nhất cho các trường hợp khác nhau

Trả lời bằng tiếng Việt, chi tiết và dễ hiểu.`;

      const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0].message.content || "Không thể so sánh các sân.";
    } catch (error: any) {
      console.error("Error comparing courts:", error);
      throw error;
    }
  }
}
