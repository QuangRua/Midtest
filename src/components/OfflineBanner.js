import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../context/NetworkContext';
import { useLanguage } from '../i18n/LanguageContext';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export const OfflineBanner = () => {
  const { isOnline, isSyncing, pendingSyncCount, triggerManualSync } = useNetwork();
  const { t } = useLanguage();

  if (isOnline && pendingSyncCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        !isOnline ? styles.bannerOffline : styles.bannerSyncing,
      ]}
    >
      <View style={styles.content}>
        {isSyncing ? (
          <ActivityIndicator size="small" color={COLORS.accent} style={styles.icon} />
        ) : (
          <Ionicons
            name={!isOnline ? 'cloud-offline' : 'sync'}
            size={18}
            color={!isOnline ? COLORS.danger : COLORS.accent}
            style={styles.icon}
          />
        )}
        <View style={styles.textWrapper}>
          <Text style={styles.title}>
            {!isOnline
              ? t('offlineNotice')
              : `${pendingSyncCount} ${t('syncPending')}...`}
          </Text>
        </View>
      </View>

      {isOnline && pendingSyncCount > 0 && !isSyncing && (
        <TouchableOpacity style={styles.syncBtn} onPress={triggerManualSync}>
          <Text style={styles.syncBtnText}>Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  bannerOffline: {
    backgroundColor: COLORS.dangerLight,
    borderBottomColor: '#FFCDD2',
  },
  bannerSyncing: {
    backgroundColor: COLORS.accentLight,
    borderBottomColor: '#BBDEFB',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: SPACING.sm,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  syncBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
