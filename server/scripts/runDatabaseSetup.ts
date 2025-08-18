
import { setupDatabase } from './setupDatabase.ts';
import { seedSystemData } from './seedSystemData.ts';

const runCompleteSetup = async () => {
  try {
    console.log('🚀 Starting complete database setup...\n');
    
    // Step 1: Setup database structure
    console.log('=== STEP 1: Database Structure Setup ===');
    await setupDatabase();
    
    console.log('\n=== STEP 2: Seeding System Data ===');
    await seedSystemData();
    
    console.log('\n🎉 Complete database setup finished successfully!');
    console.log('\n📋 What you can do next:');
    console.log('1. Test the super admin login:');
    console.log('   Email: superadmin@insurcheck.com');
    console.log('   Password: Solulab@123');
    console.log('2. Check the API endpoints:');
    console.log('   - Health: http://0.0.0.0:5000/api/health');
    console.log('   - System Metrics: http://0.0.0.0:5000/api/system-metrics');
    console.log('   - Activity Logs: http://0.0.0.0:5000/api/activity-logs');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

runCompleteSetup();
