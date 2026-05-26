# ✅ Deployment Checklist - AI Court Suggestion Feature

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] OpenAI API key đã được thêm vào `.env`
- [ ] API key còn credit và hoạt động
- [ ] Tất cả dependencies đã được cài đặt
- [ ] MongoDB connection hoạt động bình thường

### 2. Code Quality
- [ ] Không có TypeScript errors
- [ ] Code đã được format đúng chuẩn
- [ ] Tất cả imports đều hợp lệ
- [ ] Validators hoạt động đúng

### 3. Testing
- [ ] Test API với Postman/cURL thành công
- [ ] Test với các prompt khác nhau
- [ ] Test validation errors
- [ ] Test với và không có vị trí người dùng
- [ ] Test fallback khi AI lỗi

### 4. Security
- [ ] API key không bị hardcode trong code
- [ ] `.env` file đã được thêm vào `.gitignore`
- [ ] Input validation đã được implement
- [ ] Rate limiting đã được cân nhắc

### 5. Documentation
- [ ] API documentation đã hoàn thiện
- [ ] Frontend integration guide đã sẵn sàng
- [ ] README đã được cập nhật
- [ ] Code comments đầy đủ

---

## 🚀 Deployment Steps

### Step 1: Verify Environment

```bash
# Kiểm tra .env file
cat .env | grep OPENAI_API_KEY

# Kiểm tra dependencies
npm list openai express-validator
```

### Step 2: Build & Test

```bash
# Build project
npm run build

# Run tests (nếu có)
npm test

# Start development server
npm run dev
```

### Step 3: Test API Endpoints

```bash
# Test AI suggestion
curl -X POST http://localhost:5000/api/courts/ai/suggest \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Tìm sân bóng đá giá rẻ", "limit": 3}'

# Verify response
# Expected: 200 OK with suggestions array
```

### Step 4: Monitor First Requests

```bash
# Check server logs
tail -f logs/server.log

# Monitor OpenAI usage
# Visit: https://platform.openai.com/usage
```

### Step 5: Deploy to Production

```bash
# Set production environment
export NODE_ENV=production

# Start with PM2 (recommended)
pm2 start npm --name "ezsport-backend" -- start
pm2 save
pm2 startup
```

---

## 🔍 Post-Deployment Verification

### 1. Health Check
- [ ] Server đang chạy và accessible
- [ ] Database connection stable
- [ ] OpenAI API responding

### 2. Functionality Check
- [ ] AI suggestion endpoint hoạt động
- [ ] Generate description endpoint hoạt động
- [ ] Compare courts endpoint hoạt động
- [ ] Error handling đúng

### 3. Performance Check
- [ ] Response time < 5 seconds
- [ ] No memory leaks
- [ ] CPU usage reasonable

### 4. Monitoring Setup
- [ ] Logging đã được cấu hình
- [ ] Error tracking (Sentry, etc.)
- [ ] Usage analytics
- [ ] Cost monitoring

---

## 📊 Monitoring Metrics

### Key Metrics to Track:

1. **API Performance:**
   - Average response time
   - Success rate
   - Error rate
   - Requests per minute

2. **OpenAI Usage:**
   - Total requests/day
   - Tokens consumed
   - Cost per day
   - Rate limit hits

3. **User Behavior:**
   - Most common prompts
   - Average suggestions clicked
   - User satisfaction
   - Conversion rate

### Monitoring Tools:

```javascript
// Example: Simple logging middleware
app.use('/api/courts/ai', (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      prompt: req.body.prompt?.substring(0, 50),
    });
  });
  
  next();
});
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid API Key"
**Solution:**
```bash
# Verify API key format
echo $OPENAI_API_KEY | grep "sk-proj-"

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Issue 2: "Rate Limit Exceeded"
**Solution:**
- Implement request queuing
- Add caching for common prompts
- Upgrade OpenAI plan

### Issue 3: "Slow Response Time"
**Solution:**
- Reduce max_tokens in OpenAI config
- Implement timeout handling
- Cache frequent queries

### Issue 4: "High Costs"
**Solution:**
- Implement aggressive caching
- Use cheaper model (gpt-3.5-turbo)
- Add rate limiting per user

---

## 💰 Cost Management

### Budget Alerts:

```javascript
// Example: Cost tracking
const COST_PER_1K_TOKENS = 0.0015; // GPT-4o-mini
const DAILY_BUDGET = 10; // $10/day

let dailyCost = 0;

function trackCost(tokensUsed) {
  const cost = (tokensUsed / 1000) * COST_PER_1K_TOKENS;
  dailyCost += cost;
  
  if (dailyCost > DAILY_BUDGET) {
    // Send alert
    console.error('⚠️ Daily budget exceeded!');
    // Disable AI features temporarily
  }
}
```

### Cost Optimization:

1. **Caching Strategy:**
   ```javascript
   // Cache common prompts
   const cache = new Map();
   
   if (cache.has(prompt)) {
     return cache.get(prompt);
   }
   
   const result = await openai.chat.completions.create(...);
   cache.set(prompt, result);
   ```

2. **Prompt Optimization:**
   - Reduce system prompt length
   - Use shorter court descriptions
   - Limit response tokens

3. **Model Selection:**
   - Use `gpt-4o-mini` for most requests
   - Reserve `gpt-4` for complex queries only

---

## 🔐 Security Checklist

### API Security:
- [ ] Rate limiting implemented
- [ ] Input sanitization
- [ ] CORS configured properly
- [ ] HTTPS enabled in production

### Data Security:
- [ ] API keys stored securely
- [ ] No sensitive data in logs
- [ ] Database access restricted
- [ ] Regular security audits

### Code Security:
- [ ] Dependencies up to date
- [ ] No known vulnerabilities
- [ ] Code review completed
- [ ] Security headers configured

---

## 📈 Scaling Considerations

### When to Scale:

1. **Horizontal Scaling:**
   - > 1000 requests/hour
   - Multiple regions
   - High availability needed

2. **Vertical Scaling:**
   - Complex AI queries
   - Large court database
   - Heavy computation

3. **Caching Layer:**
   - Redis for prompt caching
   - CDN for static content
   - Database query caching

### Scaling Strategy:

```
┌─────────────┐
│ Load        │
│ Balancer    │
└──────┬──────┘
       │
   ┌───┴───┬───────┬───────┐
   │       │       │       │
┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
│ API │ │ API │ │ API │ │ API │
│  1  │ │  2  │ │  3  │ │  4  │
└──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
   │       │       │       │
   └───┬───┴───────┴───────┘
       │
   ┌───▼────┐
   │ Redis  │
   │ Cache  │
   └───┬────┘
       │
   ┌───▼────┐
   │MongoDB │
   └────────┘
```

---

## 🎯 Success Criteria

### Launch Success:
- [ ] Zero critical bugs in first 24h
- [ ] < 5% error rate
- [ ] Average response time < 3s
- [ ] Positive user feedback

### Week 1 Goals:
- [ ] 100+ successful AI requests
- [ ] < $50 OpenAI costs
- [ ] User satisfaction > 80%
- [ ] No major incidents

### Month 1 Goals:
- [ ] 1000+ successful AI requests
- [ ] Cost per request < $0.01
- [ ] Feature adoption > 30%
- [ ] Positive ROI

---

## 📞 Emergency Contacts

### On-Call Team:
- Backend Lead: [Phone/Email]
- DevOps: [Phone/Email]
- Product Manager: [Phone/Email]

### External Services:
- OpenAI Support: https://help.openai.com
- MongoDB Support: [Link]
- Hosting Provider: [Link]

---

## 🔄 Rollback Plan

### If Critical Issues Occur:

1. **Immediate Actions:**
   ```bash
   # Disable AI endpoints
   # Add to nginx config or API gateway
   location /api/courts/ai {
     return 503 "AI features temporarily unavailable";
   }
   ```

2. **Rollback Steps:**
   ```bash
   # Revert to previous version
   git revert HEAD
   npm run build
   pm2 restart ezsport-backend
   ```

3. **Communication:**
   - Notify users via app banner
   - Update status page
   - Send email to stakeholders

---

## ✅ Final Checklist

Before going live:
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Team trained on new features
- [ ] Monitoring configured
- [ ] Rollback plan ready
- [ ] Stakeholders informed
- [ ] Budget approved
- [ ] Legal/compliance reviewed

---

## 🎉 Launch!

Once all items are checked:

```bash
# Deploy to production
npm run deploy:production

# Verify deployment
curl https://api.ezsport.com/health

# Monitor logs
pm2 logs ezsport-backend --lines 100

# Celebrate! 🎊
```

---

**Good luck with your deployment! 🚀**

*Last updated: [Date]*
*Version: 1.0.0*
