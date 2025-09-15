/**
 * Test file for FormEngine initialization with dummy data
 * Run this with: node -r ts-node/register formEngine.test.ts
 */

import { FormEngine } from '../index';
import { dummyData, simpleTestData } from './dummyData';

console.log('🚀 Testing FormEngine Initialization\n');

// Test 1: Basic FormEngine creation
console.log('1. Creating FormEngine instance...');
const engine = new FormEngine();
console.log('✅ FormEngine created successfully\n');

// Test 2: Initialize with simple test data
console.log('2. Testing with simple data...');
try {
  engine.initialize(simpleTestData);
  console.log('✅ Simple initialization successful');
  
  // Test data access
  const firstName = engine.getData('firstName');
  console.log(`- First name: ${firstName}`);
  
  // Test component access
  const components = engine.getCurrentPageComponents();
  console.log(`- Components on current page: ${components.length}`);
  components.forEach(comp => {
    console.log(`  - ${comp.id} (${comp.type})`);
  });
  
  // Test state
  const state = engine.getState();
  console.log(`- Current page: ${state.currentPage}`);
  console.log(`- Page list: ${state.pageList.join(', ')}`);
  
  console.log('✅ Simple test completed\n');
} catch (error) {
  console.error('❌ Simple test failed:', error);
}

// Test 3: Initialize with complex dummy data
console.log('3. Testing with complex dummy data...');
try {
  const engine2 = new FormEngine();
  engine2.initialize(dummyData);
  console.log('✅ Complex initialization successful');
  
  // Test navigation
  const pages = engine2.layout.getPageList();
  console.log(`- Available pages: ${pages.join(', ')}`);
  
  // Test component lookup
  const headerComponent = engine2.getComponent('page3Task2');
  if (headerComponent) {
    console.log(`- Found component: ${headerComponent.id} (${headerComponent.type})`);
  }
  
  // Test data access
  const shortAnswer = engine2.getData('shortAnswerInput');
  console.log(`- Short answer: ${shortAnswer}`);
  
  // Test visibility
  const isVisible = engine2.isComponentVisible('page3Task2');
  console.log(`- Component visible: ${isVisible}`);
  
  // Test application info
  const appInfo = engine2.getApplicationInfo();
  console.log(`- Application: ${appInfo.id} (${appInfo.organization})`);
  
  console.log('✅ Complex test completed\n');
} catch (error) {
  console.error('❌ Complex test failed:', error);
}

// Test 4: Data manipulation
console.log('4. Testing data manipulation...');
try {
  // Update data
  engine.updateData('firstName', 'Jane');
  const updatedName = engine.getData('firstName');
  console.log(`- Updated first name: ${updatedName}`);
  
  // Batch data access
  const allData = engine.getData();
  console.log(`- All data keys: ${Object.keys(allData).join(', ')}`);
  
  console.log('✅ Data manipulation test completed\n');
} catch (error) {
  console.error('❌ Data manipulation test failed:', error);
}

// Test 5: Debug output
console.log('5. Debug information...');
try {
  const debug = engine.debug();
  console.log('- Debug state:', JSON.stringify(debug.state, null, 2));
  console.log('- Components summary:', JSON.stringify(debug.components, null, 2));
  console.log('✅ Debug test completed\n');
} catch (error) {
  console.error('❌ Debug test failed:', error);
}

console.log('🎉 All tests completed!');

// Export for potential use
export { engine };