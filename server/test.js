// Simple test script to verify backend setup
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';

dotenv.config();

console.log('🧪 Testing Backend Configuration...\n');

// Test 1: Environment Variables
console.log('1. Environment Variables:');
console.log(`   PORT: ${process.env.PORT || 'Not set'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? 'Set' : 'Not set'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}\n`);

// Test 2: Supabase Connection
console.log('2. Testing Supabase Connection:');
try {
  const { data, error } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);

  if (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
  } else {
    console.log('   ✅ Supabase connection successful');
  }
} catch (err) {
  console.log(`   ❌ Connection error: ${err.message}`);
}

// Test 3: Database Tables
console.log('\n3. Testing Database Tables:');
const tables = ['profiles', 'reports', 'courses', 'quizzes', 'guides', 'coins', 'admin_roles'];

for (const table of tables) {
  try {
    const { error } = await supabase
      .from(table)
      .select('count')
      .limit(1);

    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
    } else {
      console.log(`   ✅ ${table}: Accessible`);
    }
  } catch (err) {
    console.log(`   ❌ ${table}: ${err.message}`);
  }
}

console.log('\n🎯 Test completed!');
console.log('\nTo start the server:');
console.log('   npm run dev');
console.log('\nTo test the API:');
console.log('   curl http://localhost:3001/health');
