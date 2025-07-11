/**
 * Firebase Usage Dashboard Component
 * 
 * Visual monitoring dashboard for Firebase usage tracking. Shows real-time
 * usage statistics with color-coded alerts and progress indicators.
 * 
 * Features:
 * - Development-only visibility
 * - Collapsible interface with usage statistics
 * - Color-coded alert system (green/yellow/red)
 * - Progress bars for each Firebase service
 * - Positioned above FAB for easy access
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUsageMonitor } from '../hooks/useUsageMonitor';

// Color scheme for different alert levels
const ALERT_COLORS = {
  safe: '#10B981',     // Green
  warning: '#F59E0B',  // Yellow
  danger: '#EF4444'    // Red
};

const ALERT_BACKGROUNDS = {
  safe: '#ECFDF5',     // Light green
  warning: '#FFFBEB',  // Light yellow
  danger: '#FEF2F2'    // Light red
};

export default function UsageDashboard() {
  const { getUsageReport, isLoading } = useUsageMonitor();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only render in development mode
  if (!__DEV__) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  const report = getUsageReport();
  const alertColor = ALERT_COLORS[report.alertLevel];
  const alertBackground = ALERT_BACKGROUNDS[report.alertLevel];

  /**
   * Render progress bar for a specific metric
   */
  const renderProgressBar = (label: string, current: number, limit: number, percentage: number) => (
    <View style={styles.metricContainer}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>
          {current.toLocaleString()} / {limit.toLocaleString()} ({percentage}%)
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: percentage >= 90 ? ALERT_COLORS.danger : 
                              percentage >= 70 ? ALERT_COLORS.warning : 
                              ALERT_COLORS.safe
            }
          ]} 
        />
      </View>
    </View>
  );

  /**
   * Get appropriate icon for alert level
   */
  const getAlertIcon = () => {
    switch (report.alertLevel) {
      case 'safe':
        return 'check-circle';
      case 'warning':
        return 'alert-triangle';
      case 'danger':
        return 'alert-circle';
      default:
        return 'info';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: alertBackground }]}>
      {/* Header with collapse/expand functionality */}
      <TouchableOpacity 
        style={[styles.header, { borderLeftColor: alertColor }]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Feather 
              name={getAlertIcon()} 
              size={16} 
              color={alertColor} 
              style={styles.alertIcon}
            />
            <Text style={styles.headerTitle}>Firebase Usage</Text>
          </View>
          <Feather 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#6B7280"
          />
        </View>
      </TouchableOpacity>

      {/* Expanded content */}
      {isExpanded && (
        <View style={styles.content}>
          <Text style={[styles.alertText, { color: alertColor }]}>
            Status: {report.alertLevel.toUpperCase()}
          </Text>
          
          {renderProgressBar(
            'Firestore Reads',
            report.reads.current,
            report.reads.limit,
            report.reads.percentage
          )}
          
          {renderProgressBar(
            'Firestore Writes',
            report.writes.current,
            report.writes.limit,
            report.writes.percentage
          )}
          
          {renderProgressBar(
            'Cloud Functions',
            report.functions.current,
            report.functions.limit,
            report.functions.percentage
          )}

          <Text style={styles.infoText}>
            Daily limits reset at midnight. Limits are set to 75% of Firebase free tier for safety.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Position above FAB button
    left: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricContainer: {
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  metricValue: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  infoText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },
});