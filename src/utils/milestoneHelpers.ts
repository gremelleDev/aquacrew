// src/utils/milestoneHelpers.ts
export interface MilestoneData {
    title: string;
    message: string;
    emoji: string;
  }
  
  export function getMilestoneMessage(milestone: string): MilestoneData {
    if (milestone.startsWith('weekly_')) {
      const week = milestone.split('_')[1];
      return {
        title: `${week} Week Streak! 🎉`,
        message: `Amazing! You've maintained your hydration goal for ${week} week${week !== '1' ? 's' : ''} in a row!`,
        emoji: '🏆'
      };
    } else if (milestone.startsWith('monthly_')) {
      const month = milestone.split('_')[1];
      return {
        title: `${month} Month Streak! 🏆`,
        message: `Incredible! You've maintained your hydration goal for ${month} month${month !== '1' ? 's' : ''} in a row!`,
        emoji: '👑'
      };
    }
    return {
      title: 'Milestone Achieved!',
      message: 'Great job on your progress!',
      emoji: '🎉'
    };
  }