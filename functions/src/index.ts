// functions/src/index.ts
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import type { FirestoreEvent } from "firebase-functions/v2/firestore";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

interface DailyProgress {
  currentIntake: number;
  date?: string;
}

interface UserProfile {
  hydrationGoal: number;
  currentStreak: number;
  longestStreak: number;
  lastGoalAchievedDate: string;
  unviewedMilestones: string[];
}

// Cloud Function that triggers when daily_progress documents are written
export const calculateStreak = onDocumentWritten(
  "users/{userId}/daily_progress/{date}",
  async (event: FirestoreEvent<any>) => {
    const userId = event.params.userId;
    const date = event.params.date; // YYYY-MM-DD format
    
    // Only process if document was created or updated (not deleted)
    if (!event.data) {
      return null;
    }
    
    const progressData = event.data as DailyProgress;
    
    // Get user profile to check hydration goal
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error(`User ${userId} not found`);
      return null;
    }

    const userData = userDoc.data() as UserProfile;
    const hydrationGoal = userData.hydrationGoal || 2000;
    
    // Only calculate streak if daily goal is reached
    if (progressData.currentIntake < hydrationGoal) {
      console.log(`User ${userId} hasn't reached goal yet: ${progressData.currentIntake}/${hydrationGoal}`);
      return null;
    }

    console.log(`User ${userId} reached goal on ${date}! Calculating streak...`);

    // Check if we already processed this date
    if (userData.lastGoalAchievedDate === date) {
      console.log(`Already processed streak for ${userId} on ${date}`);
      return null;
    }

    // Calculate new streak
    const newStreakData = await calculateNewStreak(userId, date, userData);
    
    // Update user document with new streak data
    await userRef.update(newStreakData);
    
    console.log(`Updated streak for ${userId}:`, newStreakData);
    return null;
  });

async function calculateNewStreak(
  userId: string, 
  currentDate: string, 
  userData: UserProfile
): Promise<Partial<UserProfile>> {
  const currentStreak = userData.currentStreak || 0;
  const longestStreak = userData.longestStreak || 0;
  const lastAchievedDate = userData.lastGoalAchievedDate;
  const unviewedMilestones = userData.unviewedMilestones || [];

  // Parse dates
  const current = new Date(currentDate);
  const yesterday = new Date(current);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak: number;

  if (!lastAchievedDate) {
    // First time achieving goal
    newStreak = 1;
  } else if (lastAchievedDate === yesterdayStr) {
    // Consecutive day - increment streak
    newStreak = currentStreak + 1;
  } else if (lastAchievedDate === currentDate) {
    // Same day (shouldn't happen due to earlier check, but just in case)
    newStreak = currentStreak;
  } else {
    // Gap in streak - start over
    newStreak = 1;
  }

  // Update longest streak if needed
  const newLongestStreak = Math.max(longestStreak, newStreak);

  // Check for milestones
  const newMilestones = checkMilestones(newStreak, currentStreak);
  const updatedUnviewedMilestones = [...unviewedMilestones, ...newMilestones];

  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastGoalAchievedDate: currentDate,
    unviewedMilestones: updatedUnviewedMilestones
  };
}

function checkMilestones(newStreak: number, oldStreak: number): string[] {
  const milestones: string[] = [];
  
  // Weekly milestones: 7, 14, 21, 28 days
  const weeklyMilestones = [7, 14, 21, 28];
  // Monthly milestones: 30, 60, 90 days
  const monthlyMilestones = [30, 60, 90];
  
  const allMilestones = [...weeklyMilestones, ...monthlyMilestones];
  
  for (const milestone of allMilestones) {
    // Check if we just reached this milestone
    if (newStreak >= milestone && oldStreak < milestone) {
      if (weeklyMilestones.includes(milestone)) {
        const weekNumber = milestone / 7;
        milestones.push(`weekly_${weekNumber}`);
      } else {
        const monthNumber = milestone / 30;
        milestones.push(`monthly_${monthNumber}`);
      }
    }
  }
  
  return milestones;
}

// Migration function to add streak fields to existing users
export const runMigration = onRequest(async (req: any, res: any) => {
  try {
    // Only migrate users who have completed onboarding
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
      console.log(`Successfully migrated ${updateCount} users`);
      res.status(200).send(`Migration completed: Successfully migrated ${updateCount} users`);
    } else {
      console.log('No users needed migration');
      res.status(200).send('Migration completed: No users needed migration');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).send(`Migration failed: ${error}`);
  }
});