/**
 * Quick Test Script for AI Court Suggestion
 * 
 * Usage:
 * 1. Make sure server is running: npm run dev
 * 2. Run this script: node test-ai-quick.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/courts';

// Test cases
const testCases = [
  {
    name: 'Test 1: Simple prompt',
    data: {
      prompt: 'Tìm sân bóng đá giá rẻ',
      limit: 3
    }
  },
  {
    name: 'Test 2: Detailed prompt with location',
    data: {
      prompt: 'Tôi muốn tìm sân cầu lông có điều hòa, giá khoảng 100-200k/giờ',
      userLat: 21.0285,
      userLng: 105.8542,
      maxDistance: 5,
      limit: 5
    }
  },
  {
    name: 'Test 3: Complex requirements',
    data: {
      prompt: 'Sân tennis chất lượng cao, không quan tâm giá, có huấn luyện viên',
      limit: 3
    }
  },
  {
    name: 'Test 4: Time-based prompt',
    data: {
      prompt: 'Muốn đá bóng tối nay, sân có đèn chiếu sáng tốt',
      limit: 5
    }
  }
];

async function testAISuggestion(testCase) {
  console.log('\n' + '='.repeat(60));
  console.log(`🧪 ${testCase.name}`);
  console.log('='.repeat(60));
  console.log('📝 Prompt:', testCase.data.prompt);
  
  try {
    const startTime = Date.now();
    const response = await axios.post(`${API_BASE_URL}/ai/suggest`, testCase.data);
    const endTime = Date.now();
    
    const result = response.data.data;
    
    console.log('\n✅ Success!');
    console.log(`⏱️  Response time: ${endTime - startTime}ms`);
    console.log(`\n💡 AI Explanation:\n${result.aiExplanation}`);
    
    if (result.matchedCriteria) {
      console.log('\n📊 Matched Criteria:');
      if (result.matchedCriteria.sportType) {
        console.log(`   🏃 Sport Type: ${result.matchedCriteria.sportType}`);
      }
      if (result.matchedCriteria.priceRange) {
        console.log(`   💰 Price Range: ${result.matchedCriteria.priceRange}`);
      }
      if (result.matchedCriteria.location) {
        console.log(`   📍 Location: ${result.matchedCriteria.location}`);
      }
      if (result.matchedCriteria.features && result.matchedCriteria.features.length > 0) {
        console.log(`   ✨ Features: ${result.matchedCriteria.features.join(', ')}`);
      }
    }
    
    console.log(`\n🏟️  Suggested Courts (${result.suggestions.length}):`);
    result.suggestions.forEach((court, index) => {
      console.log(`\n   ${index + 1}. ${court.emoji} ${court.name}`);
      console.log(`      📍 ${court.location}`);
      console.log(`      💰 ${court.price}`);
      console.log(`      ⭐ ${court.rating}/5`);
      if (court.distance) {
        console.log(`      🚗 ${court.distance.toFixed(1)} km`);
      }
    });
    
    return true;
  } catch (error) {
    console.log('\n❌ Error!');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message || error.message}`);
    } else {
      console.log(`   ${error.message}`);
    }
    return false;
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting AI Court Suggestion Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = await testAISuggestion(testCase);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Wait a bit between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${testCases.length}`);
  console.log('='.repeat(60) + '\n');
}

// Run tests
runAllTests().catch(console.error);
