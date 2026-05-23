# 🎨 Hướng Dẫn Tích Hợp AI Court Suggestion vào Frontend

## 📋 Tổng Quan

Hướng dẫn này giúp bạn tích hợp tính năng AI gợi ý sân vào ứng dụng React/Vue/Angular.

---

## 🔧 Setup API Service

### React/TypeScript Example

```typescript
// src/services/courtAI.service.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface CourtSuggestionRequest {
  prompt: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  limit?: number;
}

export interface Court {
  _id: string;
  name: string;
  description?: string;
  image: string;
  rating: number;
  location: string;
  price: string;
  lat: number;
  lng: number;
  emoji: string;
  sportType: string;
  distance?: number;
}

export interface CourtSuggestionResponse {
  suggestions: Court[];
  aiExplanation: string;
  matchedCriteria: {
    sportType?: string;
    priceRange?: string;
    location?: string;
    features?: string[];
  };
}

export const courtAIService = {
  // Gợi ý sân dựa trên prompt
  async suggestCourts(data: CourtSuggestionRequest): Promise<CourtSuggestionResponse> {
    const response = await axios.post(`${API_BASE_URL}/courts/ai/suggest`, data);
    return response.data.data;
  },

  // Tạo mô tả cho sân
  async generateDescription(courtId: string): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/courts/${courtId}/ai/description`);
    return response.data.data.description;
  },

  // So sánh nhiều sân
  async compareCourts(courtIds: string[]): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/courts/ai/compare`, { courtIds });
    return response.data.data.comparison;
  },
};
```

---

## 🎯 Component Examples

### 1. AI Search Bar Component

```tsx
// src/components/AICourtSearch.tsx

import React, { useState } from 'react';
import { courtAIService, CourtSuggestionResponse } from '../services/courtAI.service';

export const AICourtSearch: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CourtSuggestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!prompt.trim()) {
      setError('Vui lòng nhập mô tả sân bạn muốn tìm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Lấy vị trí người dùng (optional)
      let userLat: number | undefined;
      let userLng: number | undefined;

      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
      }

      const data = await courtAIService.suggestCourts({
        prompt,
        userLat,
        userLng,
        maxDistance: 10,
        limit: 5,
      });

      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-court-search">
      <div className="search-box">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ví dụ: Tìm sân bóng đá giá rẻ gần đây..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
        <button onClick={handleSearch} disabled={loading || !prompt.trim()}>
          {loading ? '🔍 Đang tìm...' : '🤖 AI Gợi Ý'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="search-results">
          <div className="ai-explanation">
            <h3>💡 AI Giải Thích:</h3>
            <p>{result.aiExplanation}</p>
          </div>

          {result.matchedCriteria && (
            <div className="matched-criteria">
              <h4>📊 Tiêu Chí Phù Hợp:</h4>
              {result.matchedCriteria.sportType && (
                <span className="badge">🏃 {result.matchedCriteria.sportType}</span>
              )}
              {result.matchedCriteria.priceRange && (
                <span className="badge">💰 {result.matchedCriteria.priceRange}</span>
              )}
              {result.matchedCriteria.location && (
                <span className="badge">📍 {result.matchedCriteria.location}</span>
              )}
            </div>
          )}

          <div className="court-list">
            <h3>🏟️ Các Sân Được Gợi Ý:</h3>
            {result.suggestions.map((court) => (
              <div key={court._id} className="court-card">
                <img src={court.image} alt={court.name} />
                <div className="court-info">
                  <h4>
                    {court.emoji} {court.name}
                  </h4>
                  <p className="sport-type">{court.sportType}</p>
                  <p className="location">📍 {court.location}</p>
                  <p className="price">💰 {court.price}</p>
                  <p className="rating">⭐ {court.rating}/5</p>
                  {court.distance && (
                    <p className="distance">🚗 {court.distance.toFixed(1)} km</p>
                  )}
                  {court.description && <p className="description">{court.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 2. Quick Prompt Suggestions

```tsx
// src/components/QuickPrompts.tsx

import React from 'react';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt }) => {
  const prompts = [
    { icon: '⚽', text: 'Sân bóng đá giá rẻ' },
    { icon: '🏸', text: 'Sân cầu lông có điều hòa' },
    { icon: '🏀', text: 'Sân bóng rổ ngoài trời' },
    { icon: '🎾', text: 'Sân tennis chất lượng cao' },
    { icon: '🏐', text: 'Sân bóng chuyền gần đây' },
    { icon: '⚡', text: 'Sân có đèn chiếu sáng tốt' },
  ];

  return (
    <div className="quick-prompts">
      <h4>💡 Gợi Ý Nhanh:</h4>
      <div className="prompt-buttons">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            className="prompt-btn"
            onClick={() => onSelectPrompt(prompt.text)}
          >
            {prompt.icon} {prompt.text}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 3. Court Comparison Component

```tsx
// src/components/CourtComparison.tsx

import React, { useState } from 'react';
import { courtAIService } from '../services/courtAI.service';

interface CourtComparisonProps {
  selectedCourtIds: string[];
}

export const CourtComparison: React.FC<CourtComparisonProps> = ({ selectedCourtIds }) => {
  const [comparison, setComparison] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (selectedCourtIds.length < 2) {
      alert('Vui lòng chọn ít nhất 2 sân để so sánh');
      return;
    }

    setLoading(true);
    try {
      const result = await courtAIService.compareCourts(selectedCourtIds);
      setComparison(result);
    } catch (error) {
      console.error('Error comparing courts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="court-comparison">
      <button onClick={handleCompare} disabled={loading || selectedCourtIds.length < 2}>
        {loading ? 'Đang so sánh...' : `🤖 So Sánh ${selectedCourtIds.length} Sân`}
      </button>

      {comparison && (
        <div className="comparison-result">
          <h3>📊 Kết Quả So Sánh:</h3>
          <div className="markdown-content" dangerouslySetInnerHTML={{ __html: comparison }} />
        </div>
      )}
    </div>
  );
};
```

---

## 🎨 CSS Styling

```css
/* src/styles/AICourtSearch.css */

.ai-court-search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-box input {
  flex: 1;
  padding: 15px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  transition: border-color 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #4CAF50;
}

.search-box button {
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.search-box button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.search-box button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 15px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 8px;
  margin-bottom: 20px;
}

.ai-explanation {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.ai-explanation h3 {
  margin-top: 0;
}

.matched-criteria {
  margin-bottom: 20px;
}

.matched-criteria .badge {
  display: inline-block;
  padding: 8px 15px;
  background-color: #f5f5f5;
  border-radius: 20px;
  margin-right: 10px;
  margin-bottom: 10px;
  font-size: 14px;
}

.court-list {
  display: grid;
  gap: 20px;
}

.court-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.court-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.court-card img {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.court-info {
  flex: 1;
}

.court-info h4 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.court-info p {
  margin: 5px 0;
  color: #666;
}

.quick-prompts {
  margin-bottom: 20px;
}

.prompt-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.prompt-btn {
  padding: 10px 20px;
  background-color: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.prompt-btn:hover {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}
```

---

## 🚀 Usage Examples

### Trong Page Component:

```tsx
// src/pages/CourtSearchPage.tsx

import React from 'react';
import { AICourtSearch } from '../components/AICourtSearch';
import { QuickPrompts } from '../components/QuickPrompts';

export const CourtSearchPage: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = React.useState('');

  return (
    <div className="court-search-page">
      <h1>🤖 Tìm Sân Thông Minh với AI</h1>
      <p>Mô tả sân bạn muốn tìm, AI sẽ gợi ý những lựa chọn tốt nhất!</p>
      
      <QuickPrompts onSelectPrompt={setSelectedPrompt} />
      <AICourtSearch initialPrompt={selectedPrompt} />
    </div>
  );
};
```

---

## 📱 Mobile Responsive

```css
@media (max-width: 768px) {
  .search-box {
    flex-direction: column;
  }

  .court-card {
    flex-direction: column;
  }

  .court-card img {
    width: 100%;
    height: 200px;
  }

  .prompt-buttons {
    flex-direction: column;
  }

  .prompt-btn {
    width: 100%;
  }
}
```

---

## 🔔 Loading States & UX

```tsx
// Loading skeleton component
export const CourtCardSkeleton: React.FC = () => (
  <div className="court-card skeleton">
    <div className="skeleton-image" />
    <div className="skeleton-content">
      <div className="skeleton-title" />
      <div className="skeleton-text" />
      <div className="skeleton-text" />
    </div>
  </div>
);

// Usage
{loading && (
  <>
    <CourtCardSkeleton />
    <CourtCardSkeleton />
    <CourtCardSkeleton />
  </>
)}
```

---

## 🎯 Best Practices

1. **Debounce Input:** Tránh gọi API quá nhiều
2. **Cache Results:** Lưu kết quả tìm kiếm gần đây
3. **Error Handling:** Xử lý lỗi mạng, timeout
4. **Loading States:** Hiển thị skeleton khi đang load
5. **Empty States:** Hiển thị gợi ý khi không có kết quả
6. **Analytics:** Track các prompt phổ biến

---

## 🔐 Environment Variables

```env
# .env
VITE_API_URL=http://localhost:5000/api
VITE_ENABLE_AI_FEATURES=true
```

---

## 📊 Analytics Integration

```typescript
// Track AI search events
const trackAISearch = (prompt: string, resultsCount: number) => {
  // Google Analytics
  gtag('event', 'ai_court_search', {
    search_term: prompt,
    results_count: resultsCount,
  });

  // Custom analytics
  analytics.track('AI Court Search', {
    prompt,
    resultsCount,
    timestamp: new Date().toISOString(),
  });
};
```

---

## 🎉 Done!

Bây giờ bạn đã có một hệ thống tìm kiếm sân thông minh với AI! 🚀
