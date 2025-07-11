/**
 * Firebase Usage Monitoring System
 * 
 * Tracks Firestore reads, writes, and Cloud Function executions to prevent
 * unexpected costs on Firebase Blaze plan. Implements daily quotas at 75%
 * of free tier limits as a safety buffer.
 * 
 * Features:
 * - Real-time usage tracking
 * - Persistent storage across app sessions
 * - Automatic daily reset at midnight
 * - Three-tier alert system
 * - Operation blocking when limits exceeded
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Conservative limits: 75% of Firebase free tier daily quotas
// This provides a 25% safety buffer to prevent any possibility of charges
const DAILY_LIMITS = {
  reads: 30000,    // Free tier: 50K/day, we use 30K
  writes: 11250,   // Free tier: 20K/day, we use 11.25K  
  functions: 750   // Free tier: 2M/month ≈ 66K/day, we use 750
};

// Alert thresholds for usage warnings
const ALERT_THRESHOLDS = {
  safe: 0.7,      // 0-70% usage
  warning: 0.9    // 70-90% warning, 90%+ danger
};

const STORAGE_KEY = '@aquacrew_usage_data';

export interface UsageData {
  readsToday: number;
  writesToday: number;
  functionsToday: number;
  lastReset: string;
}

export interface UsageReport {
  reads: {
    current: number;
    limit: number;
    percentage: number;
  };
  writes: {
    current: number;
    limit: number;
    percentage: number;
  };
  functions: {
    current: number;
    limit: number;
    percentage: number;
  };
  alertLevel: 'safe' | 'warning' | 'danger';
}

export type UsageType = 'reads' | 'writes' | 'functions';
export type AlertLevel = 'safe' | 'warning' | 'danger';

export function useUsageMonitor() {
  const [usageData, setUsageData] = useState<UsageData>({
    readsToday: 0,
    writesToday: 0,
    functionsToday: 0,
    lastReset: new Date().toISOString().split('T')[0]
  });

  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load usage data from AsyncStorage on mount
   */
  const loadUsageData = useCallback(async (): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored) as UsageData;
        setUsageData(parsedData);
      }
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save usage data to AsyncStorage
   */
  const saveUsageData = useCallback(async (data: UsageData): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save usage data:', error);
    }
  }, []);

  /**
   * Reset counters at midnight
   */
  const checkAndResetDaily = useCallback((): UsageData => {
    const today = new Date().toISOString().split('T')[0];
    
    if (usageData.lastReset !== today) {
      // New day detected - reset all counters
      const resetData: UsageData = {
        readsToday: 0,
        writesToday: 0,
        functionsToday: 0,
        lastReset: today
      };
      return resetData;
    }
    
    return usageData;
  }, [usageData]);

  /**
   * Calculate alert level based on usage percentages
   */
  const getAlertLevel = useCallback((): AlertLevel => {
    const readsPercentage = usageData.readsToday / DAILY_LIMITS.reads;
    const writesPercentage = usageData.writesToday / DAILY_LIMITS.writes;
    const functionsPercentage = usageData.functionsToday / DAILY_LIMITS.functions;
    
    const maxPercentage = Math.max(readsPercentage, writesPercentage, functionsPercentage);
    
    if (maxPercentage >= ALERT_THRESHOLDS.warning) {
      return 'danger';
    } else if (maxPercentage >= ALERT_THRESHOLDS.safe) {
      return 'warning';
    } else {
      return 'safe';
    }
  }, [usageData]);

  /**
   * Get detailed usage report
   */
  const getUsageReport = useCallback((): UsageReport => {
    return {
      reads: {
        current: usageData.readsToday,
        limit: DAILY_LIMITS.reads,
        percentage: Math.round((usageData.readsToday / DAILY_LIMITS.reads) * 100)
      },
      writes: {
        current: usageData.writesToday,
        limit: DAILY_LIMITS.writes,
        percentage: Math.round((usageData.writesToday / DAILY_LIMITS.writes) * 100)
      },
      functions: {
        current: usageData.functionsToday,
        limit: DAILY_LIMITS.functions,
        percentage: Math.round((usageData.functionsToday / DAILY_LIMITS.functions) * 100)
      },
      alertLevel: getAlertLevel()
    };
  }, [usageData, getAlertLevel]);

  /**
   * Increments usage counter for specified operation type.
   * 
   * @param type - Type of Firebase operation: 'reads', 'writes', or 'functions'
   * @param count - Number to increment by (default: 1)
   * @returns Promise<boolean> - True if operation allowed, false if limit exceeded
   * 
   * @example
   * const canProceed = await incrementUsage('writes', 1);
   * if (canProceed) {
   *   // Perform Firestore write operation
   * }
   */
  const incrementUsage = useCallback(async (type: UsageType, count: number = 1): Promise<boolean> => {
    // First check if we need to reset for new day
    const currentData = checkAndResetDaily();
    
    // Calculate what the new values would be
    const newData = { ...currentData };
    
    switch (type) {
      case 'reads':
        newData.readsToday += count;
        if (newData.readsToday > DAILY_LIMITS.reads) {
          return false; // Limit exceeded
        }
        break;
      case 'writes':
        newData.writesToday += count;
        if (newData.writesToday > DAILY_LIMITS.writes) {
          return false; // Limit exceeded
        }
        break;
      case 'functions':
        newData.functionsToday += count;
        if (newData.functionsToday > DAILY_LIMITS.functions) {
          return false; // Limit exceeded
        }
        break;
    }
    
    // Update state and persist
    setUsageData(newData);
    await saveUsageData(newData);
    
    return true; // Operation allowed
  }, [checkAndResetDaily, saveUsageData]);

  /**
   * Check if an operation would exceed limits without actually incrementing
   */
  const wouldExceedLimit = useCallback((type: UsageType, count: number = 1): boolean => {
    const currentData = checkAndResetDaily();
    
    switch (type) {
      case 'reads':
        return (currentData.readsToday + count) > DAILY_LIMITS.reads;
      case 'writes':
        return (currentData.writesToday + count) > DAILY_LIMITS.writes;
      case 'functions':
        return (currentData.functionsToday + count) > DAILY_LIMITS.functions;
      default:
        return false;
    }
  }, [checkAndResetDaily]);

  // Load data on mount
  useEffect(() => {
    loadUsageData();
  }, [loadUsageData]);

  // Check for daily reset on every render
  useEffect(() => {
    const resetData = checkAndResetDaily();
    if (resetData !== usageData) {
      setUsageData(resetData);
      saveUsageData(resetData);
    }
  }, [checkAndResetDaily, usageData, saveUsageData]);

  return {
    usageData,
    isLoading,
    incrementUsage,
    wouldExceedLimit,
    getAlertLevel,
    getUsageReport,
    loadUsageData
  };
}