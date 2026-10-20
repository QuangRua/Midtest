import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { useFood } from '../context/FoodContext';
import { storageService } from '../services/storageService';
import { mockApiService } from '../services/mockApiService';
import { Header } from '../components/Header';
import { OfflineBanner } from '../components/OfflineBanner';
import { ConfirmModal } from '../components/ConfirmModal';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { MSSV, APP_NAME, DEFAULT_MOCKAPI_URL } from '../constants/config';

export const SettingsScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const {
    isOnline,
    simulateOffline,
    toggleSimulateOffline,
    pendingSyncCount,
    triggerManualSync,
    isSyncing,
  } = useNetwork();
  const { resetToDefaultData } = useFood();

  const [mockApiUrl, setMockApiUrl] = useState('');
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [urlTestStatus, setUrlTestStatus] = useState(null); // 'success' | 'fail' | null
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    (async () => {
      const url = await storageService.getMockApiUrl();
      setMockApiUrl(url || DEFAULT_MOCKAPI_URL);
    })();
  }, []);

  const handleSaveUrl = async () => {
    if (!mockApiUrl.trim()) return;
    await storageService.saveMockApiUrl(mockApiUrl.trim());
    Alert.alert(t('success'), t('saveSuccess'));
  };

  const handleTestConnection = async () => {
    setIsTestingUrl(true);
    setUrlTestStatus(null);
    try {
      const ok = await mockApiService.testConnection(mockApiUrl.trim());
      setUrlTestStatus(ok ? 'success' : 'fail');
    } catch (e) {
      setUrlTestStatus('fail');
    } finally {
      setIsTestingUrl(false);
    }
  };

  const handleResetData = async () => {
    try {
      await resetToDefaultData();
      setShowResetModal(false);
      Alert.alert(t('success'), t('resetDemoData'));
    } catch (e) {
      Alert.alert(t('error'), e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header navigation={navigation} title={t('settings')} showBack />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Student Identification Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="school-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Student Identification</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MSSV:</Text>
            <Text style={styles.infoValue}>{MSSV}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Project Name:</Text>
            <Text style={styles.infoValue}>{APP_NAME}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subject:</Text>
            <Text style={styles.infoValue}>Phát triển ứng dụng di động</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Topic:</Text>
            <Text style={styles.infoValue}>Quản lý món ăn</Text>
          </View>
        </View>

        {/* Offline & Auto-Sync Engine (Section 5) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sync-outline" size={20} color={COLORS.accent} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Offline Mode & Auto-Sync (1.5 pts)</Text>
          </View>
          <Text style={styles.helperText}>
            Simulate offline mode to test creating/editing dishes without internet. Once toggled
            back to online, changes are automatically synced to MockAPI.
          </Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: SPACING.md }}>
              <Text style={styles.switchTitle}>{t('simulateOffline')}</Text>
              <Text style={styles.switchSub}>
                {simulateOffline ? 'Currently Disconnected (Local Queue Active)' : 'Normal Online Mode'}
              </Text>
            </View>
            <Switch
              value={simulateOffline}
              onValueChange={toggleSimulateOffline}
              trackColor={{ false: COLORS.border, true: COLORS.dangerLight }}
              thumbColor={simulateOffline ? COLORS.danger : '#f4f3f4'}
            />
          </View>

          <View style={styles.syncStatusBox}>
            <Text style={styles.syncStatusText}>
              Pending Sync Queue: <Text style={{ fontWeight: '800' }}>{pendingSyncCount} operations</Text>
            </Text>
            {isOnline && pendingSyncCount > 0 && (
              <TouchableOpacity
                style={styles.syncNowBtn}
                onPress={triggerManualSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.syncNowText}>Sync Now</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* MockAPI REST API Configuration */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="server-outline" size={20} color={COLORS.secondary} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>MockAPI REST API Endpoint</Text>
          </View>
          <Text style={styles.helperText}>
            Tables: {MSSV}_DishCategory & {MSSV}_Dish
          </Text>

          <TextInput
            style={styles.input}
            value={mockApiUrl}
            onChangeText={setMockApiUrl}
            placeholder="https://...mockapi.io/api/v1"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
          />

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestConnection}
              disabled={isTestingUrl}
            >
              {isTestingUrl ? (
                <ActivityIndicator size="small" color={COLORS.text} />
              ) : (
                <Text style={styles.testBtnText}>{t('testConnection')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveUrlBtn} onPress={handleSaveUrl}>
              <Text style={styles.saveUrlText}>{t('save')}</Text>
            </TouchableOpacity>
          </View>

          {urlTestStatus && (
            <View
              style={[
                styles.testResultBox,
                urlTestStatus === 'success' ? styles.resultSuccess : styles.resultFail,
              ]}
            >
              <Ionicons
                name={urlTestStatus === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={urlTestStatus === 'success' ? COLORS.secondary : COLORS.danger}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.testResultText,
                  { color: urlTestStatus === 'success' ? COLORS.secondary : COLORS.danger },
                ]}
              >
                {urlTestStatus === 'success'
                  ? 'Connected to MockAPI successfully!'
                  : 'Could not connect to MockAPI. Check URL or internet.'}
              </Text>
            </View>
          )}
        </View>

        {/* Restore Initial Demo Data */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="refresh-outline" size={20} color={COLORS.warning} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>{t('resetDemoData')}</Text>
          </View>
          <Text style={styles.helperText}>
            Restores the required initial 3 categories and 5 dishes and resets filters.
          </Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => setShowResetModal(true)}
          >
            <Text style={styles.resetBtnText}>{t('resetDemoData')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        visible={showResetModal}
        title={t('resetDemoData')}
        message={t('resetDemoDataConfirm')}
        onConfirm={handleResetData}
        onCancel={() => setShowResetModal(false)}
        confirmText={t('confirm')}
        cancelText={t('cancel')}
        isDestructive={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  switchSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  syncStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  syncStatusText: {
    fontSize: 13,
    color: COLORS.text,
  },
  syncNowBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
  },
  syncNowText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 13,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  testBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveUrlBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveUrlText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  testResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  resultSuccess: {
    backgroundColor: COLORS.secondaryLight,
  },
  resultFail: {
    backgroundColor: COLORS.dangerLight,
  },
  testResultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resetBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.warning,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  resetBtnText: {
    color: COLORS.warning,
    fontWeight: '700',
    fontSize: 14,
  },
});
