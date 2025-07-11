// functions/src/migration.ts
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

// This is a one-time script to add streak fields to existing users who completed onboarding
// Run this once after deploying the new schema

async function migrateExistingUsers() {
  const db = admin.firestore();
  
  try {
    // Only migrate users who have completed onboarding (have username and hydrationGoal)
    const usersSnapshot = await db.collection('users')
      .where('onboardingComplete', '==', true)
      .get();
    
    const batch = db.batch();
    let updateCount = 0;
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      
      // Only update if streak fields don't exist
      if (userData.currentStreak === undefined) {
        const userRef = db.collection('users').doc(doc.id);
        
        batch.update(userRef, {
          currentStreak: 0,
          longestStreak: 0,
          lastGoalAchievedDate: '',
          unviewedMilestones: []
        });
        
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully migrated ${updateCount} completed users with streak fields`);
      return `Successfully migrated ${updateCount} users`;
    } else {
      console.log('No users needed migration');
      return 'No users needed migration';
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// HTTP function to run the migration - call this once after deployment
export const runMigration = onRequest(async (req, res) => {
  try {
    const result = await migrateExistingUsers();
    res.status(200).send(`Migration completed: ${result}`);
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).send(`Migration failed: ${error}`);
  }
});