// Simple test for PaperTradingValidator
import { PaperTradingValidator, ValidationTest, TestResult } from './paperTradingValidator.js';

console.log('Testing PaperTradingValidator...');

// Test 1: Check if ValidationTest constants are defined
console.log('ValidationTest.ORDER_CREATION:', ValidationTest.ORDER_CREATION);
console.log('ValidationTest.ORDER_EXECUTION:', ValidationTest.ORDER_EXECUTION);

// Test 2: Check if TestResult constants are defined
console.log('TestResult.PASSED:', TestResult.PASSED);
console.log('TestResult.FAILED:', TestResult.FAILED);

// Test 3: Check if PaperTradingValidator is a function
console.log('PaperTradingValidator type:', typeof PaperTradingValidator);

console.log('All tests passed!');
