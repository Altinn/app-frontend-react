// Debug script to test formatSegmentValue behavior
const { formatSegmentValue } = require('./src/app-components/TimePicker/timeFormatUtils.ts');

console.log('Testing formatSegmentValue with 24-hour format:');
console.log('formatSegmentValue(23, "hours", "HH:mm"):', formatSegmentValue(23, 'hours', 'HH:mm'));
console.log('formatSegmentValue(2, "hours", "HH:mm"):', formatSegmentValue(2, 'hours', 'HH:mm'));
console.log('formatSegmentValue(0, "hours", "HH:mm"):', formatSegmentValue(0, 'hours', 'HH:mm'));

console.log('\nTesting formatSegmentValue with 12-hour format:');
console.log('formatSegmentValue(23, "hours", "hh:mm a"):', formatSegmentValue(23, 'hours', 'hh:mm a'));
console.log('formatSegmentValue(2, "hours", "hh:mm a"):', formatSegmentValue(2, 'hours', 'hh:mm a'));
console.log('formatSegmentValue(0, "hours", "hh:mm a"):', formatSegmentValue(0, 'hours', 'hh:mm a'));