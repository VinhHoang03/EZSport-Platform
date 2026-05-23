# Changelog

All notable changes to the EZSport Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-05-21

### 🎉 Added - AI Features

#### New API Endpoints:
- **AI Court Suggestion** (`POST /api/courts/ai/suggest`)
  - Intelligent court recommendations based on natural language prompts
  - Location-based filtering with distance calculation
  - Detailed AI explanations for suggestions
  - Matched criteria analysis (sport type, price range, location, features)

- **Auto Description Generator** (`POST /api/courts/:id/ai/description`)
  - Automatic generation of attractive court descriptions
  - AI-powered content creation
  - Automatic database update

- **Court Comparison** (`POST /api/courts/ai/compare`)
  - AI-powered comparison of multiple courts
  - Detailed pros/cons analysis
  - Personalized recommendations

#### New Services:
- `CourtService` class with AI integration
  - `suggestCourts()` - Main AI suggestion logic
  - `generateCourtDescription()` - Description generation
  - `compareCourts()` - Court comparison logic

#### New Validators:
- `suggestCourtsValidator` - Validates AI suggestion requests
- `compareCourtsValidator` - Validates comparison requests

#### Dependencies:
- Added `openai` (^4.x) - OpenAI API integration
- Added `express-validator` (^7.x) - Request validation

#### Documentation:
- `AI_COURT_SUGGESTION_API.md` - Complete API documentation
- `FRONTEND_INTEGRATION_GUIDE.md` - Frontend integration guide
- `AI_FEATURES_README.md` - AI features overview
- `DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `HUONG_DAN_SU_DUNG.md` - Vietnamese quick start guide
- `SUMMARY.md` - Feature summary
- `README.md` - Main project README

#### Testing Tools:
- `test-ai-api.http` - REST Client test file (12 test cases)
- `test-ai-quick.js` - Node.js test script (4 test cases)
- `postman_collection.json` - Postman collection

### 🔧 Changed

#### Updated Files:
- `court.controller.ts` - Added 3 new AI endpoint handlers
- `court.routes.ts` - Added 3 new AI routes with validation
- `package.json` - Updated dependencies

### 🐛 Fixed
- None in this release

### 🔐 Security
- API key protection via environment variables
- Input validation for all AI endpoints
- Rate limiting recommendations documented

---

## [1.0.0] - 2026-05-01

### 🎉 Initial Release

#### Core Features:
- User authentication (JWT + Google OAuth)
- Court listing and management
- Check-in system with loyalty points
- Location-based court search
- User profile management
- Address management
- Provider request system
- Service request system

#### Backend:
- Express.js REST API
- MongoDB database with Mongoose
- JWT authentication
- Google OAuth integration
- Cloudinary image storage
- Email notifications (Nodemailer)
- Socket.io for real-time features

#### Frontend:
- React 18 with TypeScript
- Vite build tool
- Responsive design
- Google Maps integration

#### Models:
- User
- Court
- Address
- Provider
- ProviderRequest
- ServiceRequest
- ServiceHistory
- CheckIn
- Session
- PasswordResetToken

#### API Endpoints:
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/courts/*` - Court management
- `/api/addresses/*` - Address management
- `/api/providers/*` - Provider management
- `/api/provider-requests/*` - Provider requests
- `/api/service-requests/*` - Service requests
- `/api/admin/*` - Admin operations

---

## [Unreleased]

### 🚀 Planned Features

#### Phase 2 (Next Quarter):
- [ ] Online booking system
- [ ] Payment integration (VNPay, Momo)
- [ ] Real-time court availability
- [ ] Push notifications
- [ ] Advanced search filters
- [ ] Court reviews and ratings
- [ ] Booking history
- [ ] Favorite courts

#### Phase 3 (Future):
- [ ] Voice search integration
- [ ] Image recognition for court quality
- [ ] Social features (friends, groups)
- [ ] Tournament organization
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Weather-based recommendations
- [ ] Price prediction

#### AI Enhancements:
- [ ] Personalized recommendations based on user history
- [ ] Sentiment analysis for reviews
- [ ] Chatbot for customer support
- [ ] Predictive booking suggestions
- [ ] Dynamic pricing recommendations

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.1.0 | 2026-05-21 | AI Features Release |
| 1.0.0 | 2026-05-01 | Initial Release |

---

## Migration Guide

### Upgrading from 1.0.0 to 1.1.0

#### 1. Install New Dependencies:
```bash
cd ezsport-backend
npm install openai express-validator --legacy-peer-deps
```

#### 2. Update Environment Variables:
Add to `.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

#### 3. Database Migration:
No database changes required for this release.

#### 4. API Changes:
- 3 new endpoints added (backward compatible)
- No breaking changes to existing endpoints

#### 5. Testing:
```bash
# Test new AI endpoints
node test-ai-quick.js

# Or use REST Client
# Open test-ai-api.http in VS Code
```

---

## Breaking Changes

### Version 1.1.0
- None

### Version 1.0.0
- Initial release

---

## Deprecations

### Version 1.1.0
- None

### Future Deprecations
- None planned

---

## Known Issues

### Version 1.1.0
- OpenAI API may have occasional timeouts (5-10 seconds)
- Rate limiting not yet implemented (recommended for production)
- Caching not yet implemented (recommended for cost optimization)

### Workarounds:
1. **Timeout Issues:**
   - Increase axios timeout to 30 seconds
   - Implement retry logic

2. **Rate Limiting:**
   - Use express-rate-limit middleware
   - Implement per-user rate limiting

3. **Cost Optimization:**
   - Implement Redis caching for common prompts
   - Use cheaper model (gpt-3.5-turbo) for simple queries

---

## Contributors

### Version 1.1.0
- AI Integration: [Your Name]
- Documentation: [Your Name]
- Testing: [Your Name]

### Version 1.0.0
- Backend: [Your Name]
- Frontend: [Your Name]
- Design: [Your Name]

---

## Support

For questions or issues:
- 📧 Email: support@ezsport.com
- 🐛 Issues: https://github.com/your-username/ezsport-platform/issues
- 📚 Docs: https://docs.ezsport.com

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

*Last updated: May 21, 2026*
