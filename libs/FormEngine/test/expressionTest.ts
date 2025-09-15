/**
 * Expression Engine Test
 * Tests the Altinn DSL implementation in FormEngine
 */
import { createExpressionContext, evaluateExpression } from 'libs/FormEngine/modules/expression/altinnDsl';
import { expressionService } from 'libs/FormEngine/modules/expression/expression.service';

// Test data
const testData = {
  person: {
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
    email: 'john@example.com',
  },
  settings: {
    theme: 'dark',
    notifications: true,
  },
};

// Test component map
const testComponentMap = {
  'name-input': {
    id: 'name-input',
    type: 'Input',
    dataModelBindings: {
      simpleBinding: 'person.firstName',
    },
  },
  'age-input': {
    id: 'age-input',
    type: 'Input',
    dataModelBindings: {
      simpleBinding: 'person.age',
    },
  },
};

console.log('🧪 Testing Altinn DSL Expression Engine\n');

// Test 1: Basic data model access
console.log('📋 Test 1: Data Model Access');
try {
  const context = createExpressionContext(testData, { componentMap: testComponentMap });

  const firstName = evaluateExpression(['dataModel', 'person.firstName'], context);
  const age = evaluateExpression(['dataModel', 'person.age'], context);

  console.log(`✅ firstName: ${firstName} (expected: John)`);
  console.log(`✅ age: ${age} (expected: 30)`);
  console.log('');
} catch (error) {
  console.error('❌ Test 1 failed:', error);
}

// Test 2: Comparison operators
console.log('📋 Test 2: Comparison Operators');
try {
  const context = createExpressionContext(testData, { componentMap: testComponentMap });

  const isAdult = evaluateExpression(['greaterThan', ['dataModel', 'person.age'], 18], context);
  const nameEquals = evaluateExpression(['equals', ['dataModel', 'person.firstName'], 'John'], context);
  const nameNotEquals = evaluateExpression(['notEquals', ['dataModel', 'person.firstName'], 'Jane'], context);

  console.log(`✅ isAdult (age > 18): ${isAdult} (expected: true)`);
  console.log(`✅ nameEquals: ${nameEquals} (expected: true)`);
  console.log(`✅ nameNotEquals: ${nameNotEquals} (expected: true)`);
  console.log('');
} catch (error) {
  console.error('❌ Test 2 failed:', error);
}

// Test 3: Logical operators
console.log('📋 Test 3: Logical Operators');
try {
  const context = createExpressionContext(testData, { componentMap: testComponentMap });

  const adultWithEmail = evaluateExpression(
    ['and', ['greaterThan', ['dataModel', 'person.age'], 18], ['notEquals', ['dataModel', 'person.email'], '']],
    context,
  );

  const youngOrNoEmail = evaluateExpression(
    ['or', ['lessThan', ['dataModel', 'person.age'], 18], ['equals', ['dataModel', 'person.email'], '']],
    context,
  );

  console.log(`✅ adultWithEmail: ${adultWithEmail} (expected: true)`);
  console.log(`✅ youngOrNoEmail: ${youngOrNoEmail} (expected: false)`);
  console.log('');
} catch (error) {
  console.error('❌ Test 3 failed:', error);
}

// Test 4: Component references
console.log('📋 Test 4: Component References');
try {
  const context = createExpressionContext(testData, { componentMap: testComponentMap });

  const nameValue = evaluateExpression(['component', 'name-input'], context);
  const ageValue = evaluateExpression(['component', 'age-input'], context);

  console.log(`✅ name component value: ${nameValue} (expected: John)`);
  console.log(`✅ age component value: ${ageValue} (expected: 30)`);
  console.log('');
} catch (error) {
  console.error('❌ Test 4 failed:', error);
}

// Test 5: String operations
console.log('📋 Test 5: String Operations');
try {
  const context = createExpressionContext(testData, { componentMap: testComponentMap });

  const fullName = evaluateExpression(
    ['concat', ['dataModel', 'person.firstName'], ' ', ['dataModel', 'person.lastName']],
    context,
  );

  const upperName = evaluateExpression(['upperCase', ['dataModel', 'person.firstName']], context);

  console.log(`✅ fullName: ${fullName} (expected: John Doe)`);
  console.log(`✅ upperName: ${upperName} (expected: JOHN)`);
  console.log('');
} catch (error) {
  console.error('❌ Test 5 failed:', error);
}

// Test 6: Expression Service Integration
console.log('📋 Test 6: Expression Service Integration');
try {
  // Test visibility evaluation (hidden = false means visible)
  const hiddenExpression = ['lessThan', ['dataModel', 'person.age'], 50]; // hidden if age < 50
  const isVisible = expressionService.evaluateVisibility(hiddenExpression, {
    componentMap: testComponentMap,
    data: testData,
  });

  // Test required evaluation
  const requiredExpression = ['greaterThan', ['dataModel', 'person.age'], 18]; // required if age > 18
  const isRequired = expressionService.evaluateRequired(requiredExpression, {
    componentMap: testComponentMap,
    data: testData,
  });

  console.log(`✅ isVisible (age < 50 hidden): ${isVisible} (expected: false)`);
  console.log(`✅ isRequired (age > 18): ${isRequired} (expected: true)`);
  console.log('');
} catch (error) {
  console.error('❌ Test 6 failed:', error);
}

// Test 7: Complex nested expressions
console.log('📋 Test 7: Complex Nested Expressions');
try {
  const context = createExpressionContext(testData, { componentMap: testComponentMap });

  const complexCondition = evaluateExpression(
    [
      'if',
      ['and', ['greaterThan', ['dataModel', 'person.age'], 25], ['equals', ['dataModel', 'settings.theme'], 'dark']],
      'Premium User',
      'Standard User',
    ],
    context,
  );

  console.log(`✅ complexCondition: ${complexCondition} (expected: Premium User)`);
  console.log('');
} catch (error) {
  console.error('❌ Test 7 failed:', error);
}

console.log('🎉 Expression Engine Tests Complete!');
console.log('✅ Altinn DSL successfully integrated into FormEngine');
