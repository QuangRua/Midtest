import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../context/FoodContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Header } from '../components/Header';
import { OfflineBanner } from '../components/OfflineBanner';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { MSSV } from '../constants/config';

export const CategoryScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { categories, dishes, createCategory, deleteCategory } = useFood();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [catToDelete, setCatToDelete] = useState(null);

  // Dish count per category
  const getDishCount = (catId) => {
    return dishes.filter((d) => String(d[`${MSSV}_DishCategoryId`]) === String(catId)).length;
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrorMsg(t('valCategoryNameRequired'));
      return;
    }
    setErrorMsg('');

    try {
      await createCategory({
        [`${MSSV}_Name`]: name.trim(),
        [`${MSSV}_Description`]: description.trim(),
      });
      setName('');
      setDescription('');
      setIsAdding(false);
    } catch (e) {
      const msg = t(e.message) || e.message;
      setErrorMsg(msg);
    }
  };

  const initiateDelete = (cat) => {
    const catId = String(cat[`${MSSV}_Id`]);
    const dishCount = getDishCount(catId);

    // Constraint: Cannot delete category if currently used by any dish! (Requirement 4.4)
    if (dishCount > 0) {
      Alert.alert(t('error'), t('cannotDeleteCategoryInUse'));
      return;
    }

    setCatToDelete(cat);
  };

  const handleConfirmDelete = async () => {
    if (!catToDelete) return;
    try {
      await deleteCategory(catToDelete[`${MSSV}_Id`]);
      setCatToDelete(null);
    } catch (e) {
      Alert.alert(t('error'), t(e.message) || e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        navigation={navigation}
        title={t('categoryTitle')}
        showBack
        rightAction={
          <TouchableOpacity
            style={styles.addToggleBtn}
            onPress={() => setIsAdding(!isAdding)}
          >
            <Ionicons
              name={isAdding ? 'close-circle' : 'add-circle'}
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        }
      />

      <OfflineBanner />

      {/* Add Category Card (Collapsible) */}
      {isAdding && (
        <View style={styles.addCard}>
          <Text style={styles.addTitle}>{t('addCategory')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('categoryNamePlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={(val) => {
              setName(val);
              if (errorMsg) setErrorMsg('');
            }}
          />
          <TextInput
            style={[styles.input, styles.descInput]}
            placeholder={t('categoryDescPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          <View style={styles.addActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setIsAdding(false);
                setName('');
                setDescription('');
                setErrorMsg('');
              }}
            >
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
              <Text style={styles.saveText}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Categories List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item[`${MSSV}_Id`] || item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const cId = String(item[`${MSSV}_Id`]);
          const dishCount = getDishCount(cId);
          return (
            <View style={styles.categoryCard}>
              <View style={styles.categoryInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.categoryName}>{item[`${MSSV}_Name`]}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {dishCount} {t('dishesCount')}
                    </Text>
                  </View>
                </View>
                {item[`${MSSV}_Description`] ? (
                  <Text style={styles.categoryDesc}>{item[`${MSSV}_Description`]}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.deleteBtn, dishCount > 0 && styles.deleteBtnDisabled]}
                onPress={() => initiateDelete(item)}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={dishCount > 0 ? COLORS.textMuted : COLORS.danger}
                />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="grid-outline"
            title={t('noCategoriesFound')}
            actionText={t('addCategory')}
            onAction={() => setIsAdding(true)}
          />
        }
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={Boolean(catToDelete)}
        title={t('deleteCategoryConfirmTitle')}
        message={t('deleteCategoryConfirmMsg')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCatToDelete(null)}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        isDestructive
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  addToggleBtn: {
    padding: SPACING.xs,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  addCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.small,
  },
  addTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  descInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
  },
  cancelText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  saveText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  categoryInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  countBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  categoryDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  deleteBtn: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  deleteBtnDisabled: {
    opacity: 0.4,
  },
});
