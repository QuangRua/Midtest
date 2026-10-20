import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { MSSV } from '../constants/config';

export const Header = ({ navigation, title, showBack = false, rightAction }) => {
  const { locale, setLocale, t } = useLanguage();
  const { isOnline, isSyncing, pendingSyncCount } = useNetwork();

  return (
    <View style={styles.container}>
      {/* Top Bar: MSSV & Network / Language controls */}
      <View style={styles.topRow}>
        <View style={styles.studentBadge}>
          <Ionicons name="school" size={14} color={COLORS.primary} style={styles.badgeIcon} />
          <Text style={styles.studentText}>{MSSV}</Text>
        </View>

        <View style={styles.rightControls}>
          {/* Online / Offline status indicator */}
          <View
            style={[
              styles.networkBadge,
              isSyncing
                ? styles.badgeSyncing
                : isOnline
                ? styles.badgeOnline
                : styles.badgeOffline,
            ]}
          >
            <View
              style={[
                styles.networkDot,
                {
                  backgroundColor: isSyncing
                    ? COLORS.accent
                    : isOnline
                    ? COLORS.online
                    : COLORS.offline,
                },
              ]}
            />
            <Text style={styles.networkText}>
              {isSyncing
                ? t('syncing')
                : isOnline
                ? t('online')
                : t('offline')}
              {pendingSyncCount > 0 ? ` (${pendingSyncCount})` : ''}
            </Text>
          </View>

          {/* Segmented Language Selector (EN | VI) */}
          <View style={styles.langSegmentGroup}>
            <TouchableOpacity
              style={[styles.langSegmentBtn, locale === 'en' && styles.langSegmentActive]}
              onPress={() => setLocale('en')}
              activeOpacity={0.8}
            >
              <Text style={[styles.langSegmentText, locale === 'en' && styles.langSegmentTextActive]}>
                EN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langSegmentBtn, locale === 'vi' && styles.langSegmentActive]}
              onPress={() => setLocale('vi')}
              activeOpacity={0.8}
            >
              <Text style={[styles.langSegmentText, locale === 'vi' && styles.langSegmentTextActive]}>
                VI
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Bar: Title & Navigation */}
      <View style={styles.mainRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title || t('appName')}
          </Text>
        </View>

        {rightAction ? (
          <View style={styles.rightActionContainer}>{rightAction}</View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.small,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  studentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeIcon: {
    marginRight: 4,
  },
  studentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
  },
  badgeOnline: {
    backgroundColor: COLORS.secondaryLight,
  },
  badgeOffline: {
    backgroundColor: COLORS.dangerLight,
  },
  badgeSyncing: {
    backgroundColor: COLORS.accentLight,
  },
  networkDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  networkText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  langSegmentGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 2,
  },
  langSegmentBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm - 2,
  },
  langSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  langSegmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  langSegmentTextActive: {
    color: COLORS.white,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  backButton: {
    marginRight: SPACING.md,
    padding: 2,
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
