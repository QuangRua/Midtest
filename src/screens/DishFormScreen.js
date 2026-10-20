import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../context/FoodContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Header } from '../components/Header';
import { OfflineBanner } from '../components/OfflineBanner';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { MSSV } from '../constants/config';

export const DishFormScreen = ({ route, navigation }) => {
  const { dishId } = route.params || {};
  const isEditing = Boolean(dishId);

  const { t } = useLanguage();
  const { dishes, categories, createDish, updateDish } = useFood();

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Validation error messages
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializedRef = useRef(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (isEditing && !initializedRef.current) {
      const existing = dishes.find((d) => String(d[`${MSSV}_Id`]) === String(dishId));
      if (existing) {
        setName(existing[`${MSSV}_Name`] || '');
        setPrice(String(existing[`${MSSV}_Price`] || ''));
        setPrepTime(String(existing[`${MSSV}_PreparationTime`] || ''));
        setIsAvailable(existing[`${MSSV}_IsAvailable`] !== false);
        setDescription(existing[`${MSSV}_Description`] || '');
        setCategoryId(String(existing[`${MSSV}_DishCategoryId`] || ''));
        const existingImgs = Array.isArray(existing[`${MSSV}_DishImage`])
          ? existing[`${MSSV}_DishImage`]
          : [];
        setImages(existingImgs);
        initializedRef.current = true;
      }
    } else if (!isEditing && categories.length > 0 && !categoryId) {
      // Default to first category if creating
      setCategoryId(String(categories[0][`${MSSV}_Id`]));
    }
  }, [isEditing, dishId, dishes, categories, categoryId]);

  // Image Management (Requirement 4.3)
  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;

    // Check if first image; if so, make it thumbnail by default
    const isFirst = images.length === 0;
    const newImageObj = {
      [`${MSSV}_ImageUrl`]: trimmed,
      [`${MSSV}_IsThumbnail`]: isFirst,
    };

    setImages([...images, newImageObj]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    // If the removed image was thumbnail, set first remaining image as thumbnail
    if (images[indexToRemove]?.[`${MSSV}_IsThumbnail`] && updated.length > 0) {
      updated[0][`${MSSV}_IsThumbnail`] = true;
    }
    setImages(updated);
  };

  const handleSetThumbnail = (indexToThumb) => {
    const updated = images.map((img, idx) => ({
      ...img,
      [`${MSSV}_IsThumbnail`]: idx === indexToThumb,
    }));
    setImages(updated);
  };

  // Form Submit
  const handleSubmit = async () => {
    const validationErrors = {};

    if (!name.trim()) {
      validationErrors.name = t('valNameRequired');
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      validationErrors.price = t('valPricePositive');
    }

    const numPrep = Number(prepTime);
    if (!prepTime || isNaN(numPrep) || numPrep <= 0) {
      validationErrors.prepTime = t('valPrepTimePositive');
    }

    if (!categoryId) {
      validationErrors.categoryId = t('valCategoryRequired');
    }

    // Name duplication check within same category
    const isDup = dishes.some((d) => {
      const dId = String(d[`${MSSV}_Id`]);
      if (isEditing && dId === String(dishId)) return false;
      const sameCat = String(d[`${MSSV}_DishCategoryId`]) === String(categoryId);
      const sameName = (d[`${MSSV}_Name`] || '').trim().toLowerCase() === name.trim().toLowerCase();
      return sameCat && sameName;
    });

    if (isDup) {
      validationErrors.name = t('valDishNameDuplicate');
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const dishPayload = {
        [`${MSSV}_Name`]: name.trim(),
        [`${MSSV}_Price`]: numPrice,
        [`${MSSV}_PreparationTime`]: numPrep,
        [`${MSSV}_IsAvailable`]: Boolean(isAvailable),
        [`${MSSV}_Description`]: description.trim(),
        [`${MSSV}_DishCategoryId`]: String(categoryId),
        [`${MSSV}_DishImage`]: images,
      };

      if (isEditing) {
        await updateDish(dishId, dishPayload);
      } else {
        await createDish(dishPayload);
      }

      navigation.goBack();
    } catch (e) {
      const errKey = e.message;
      const errorMsg = t(errKey) || e.message;
      Alert.alert(t('error'), errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        navigation={navigation}
        title={isEditing ? t('editDishTitle') : t('createDishTitle')}
        showBack
      />

      <OfflineBanner />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          {/* Dish Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              {t('dishNameLabel')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder={t('dishNamePlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (errors.name) setErrors({ ...errors, name: null });
              }}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Category Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              {t('categoryLabel')} <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories.map((cat) => {
                const cId = String(cat[`${MSSV}_Id`]);
                const isSelected = categoryId === cId;
                return (
                  <TouchableOpacity
                    key={cId}
                    style={[styles.catPill, isSelected && styles.catPillActive]}
                    onPress={() => {
                      setCategoryId(cId);
                      if (errors.categoryId) setErrors({ ...errors, categoryId: null });
                    }}
                  >
                    <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                      {cat[`${MSSV}_Name`]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {errors.categoryId ? (
              <Text style={styles.errorText}>{errors.categoryId}</Text>
            ) : null}
          </View>

          {/* Price & Prep Time in 2 columns */}
          <View style={styles.row}>
            {/* Price */}
            <View style={[styles.fieldGroup, { flex: 1, marginRight: SPACING.md }]}>
              <Text style={styles.label}>
                {t('priceLabel')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                placeholder={t('pricePlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={price}
                onChangeText={(val) => {
                  setPrice(val.replace(/[^0-9]/g, ''));
                  if (errors.price) setErrors({ ...errors, price: null });
                }}
              />
              {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            </View>

            {/* Preparation Time */}
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>
                {t('prepTimeLabel')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.prepTime && styles.inputError]}
                placeholder={t('prepTimePlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={prepTime}
                onChangeText={(val) => {
                  setPrepTime(val.replace(/[^0-9]/g, ''));
                  if (errors.prepTime) setErrors({ ...errors, prepTime: null });
                }}
              />
              {errors.prepTime ? (
                <Text style={styles.errorText}>{errors.prepTime}</Text>
              ) : null}
            </View>
          </View>

          {/* Quick / Regular indicator preview */}
          {prepTime && !isNaN(Number(prepTime)) && Number(prepTime) > 0 ? (
            <View style={styles.prepPreview}>
              <Ionicons
                name={Number(prepTime) <= 15 ? 'flash' : 'time'}
                size={16}
                color={Number(prepTime) <= 15 ? COLORS.secondary : COLORS.accent}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.prepPreviewText,
                  { color: Number(prepTime) <= 15 ? COLORS.secondary : COLORS.accent },
                ]}
              >
                {Number(prepTime) <= 15
                  ? `⚡ ${t('quickPrep')} (≤ 15 ${t('prepTimeMinutes')})`
                  : `⏱️ ${t('regularPrep')} (> 15 ${t('prepTimeMinutes')})`}
              </Text>
            </View>
          ) : null}

          {/* Available Switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>{t('isAvailableLabel')}</Text>
              <Text style={styles.switchSubLabel}>{t('isAvailableSubLabel')}</Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: COLORS.border, true: COLORS.secondaryLight }}
              thumbColor={isAvailable ? COLORS.secondary : '#f4f3f4'}
            />
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('descriptionLabel')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('descriptionPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Images Management Section (Requirement 4.3) */}
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>{t('imagesSectionTitle')}</Text>

            {/* Input URL and Add button */}
            <View style={styles.addImageRow}>
              <TextInput
                style={[styles.input, styles.imageUrlInput]}
                placeholder={t('addImageUrlPlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                value={newImageUrl}
                onChangeText={setNewImageUrl}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.addImageBtn, !newImageUrl.trim() && styles.addImageBtnDisabled]}
                onPress={handleAddImage}
                disabled={!newImageUrl.trim()}
              >
                <Text style={styles.addImageBtnText}>{t('add')}</Text>
              </TouchableOpacity>
            </View>

            {/* Images List */}
            {images.length > 0 ? (
              <View style={styles.imagesListContainer}>
                {images.map((img, idx) => {
                  const isThumb = img[`${MSSV}_IsThumbnail`] === true;
                  return (
                    <View key={idx} style={styles.imageItemRow}>
                      <Image
                        source={{ uri: img[`${MSSV}_ImageUrl`] }}
                        style={styles.imageThumbPreview}
                        resizeMode="cover"
                      />
                      <View style={styles.imageDetails}>
                        <Text style={styles.imageUrlText} numberOfLines={1}>
                          {img[`${MSSV}_ImageUrl`]}
                        </Text>
                        <TouchableOpacity
                          style={[styles.thumbPill, isThumb && styles.thumbPillActive]}
                          onPress={() => handleSetThumbnail(idx)}
                        >
                          <Ionicons
                            name={isThumb ? 'star' : 'star-outline'}
                            size={12}
                            color={isThumb ? COLORS.white : COLORS.primary}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.thumbPillText,
                              isThumb && styles.thumbPillTextActive,
                            ]}
                          >
                            {isThumb ? t('thumbnail') : t('markAsThumbnail')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => handleRemoveImage(idx)}
                      >
                        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isEditing ? 'checkmark-circle' : 'add-circle'}
              size={22}
              color={COLORS.white}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.submitBtnText}>
              {isSubmitting
                ? t('loading')
                : isEditing
                ? t('update')
                : t('create')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 60,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.small,
  },
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs + 2,
  },
  required: {
    color: COLORS.danger,
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
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  textArea: {
    height: 90,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  catScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  catPill: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  catPillTextActive: {
    color: COLORS.white,
  },
  prepPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  prepPreviewText: {
    fontSize: 12,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
  },
  switchLabelContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  switchSubLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  imagesSection: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  addImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  imageUrlInput: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  addImageBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  addImageBtnDisabled: {
    opacity: 0.5,
  },
  addImageBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  imagesListContainer: {
    marginTop: SPACING.xs,
  },
  imageItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  imageThumbPreview: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.md,
  },
  imageDetails: {
    flex: 1,
  },
  imageUrlText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  thumbPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  thumbPillActive: {
    backgroundColor: COLORS.primary,
  },
  thumbPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  thumbPillTextActive: {
    color: COLORS.white,
  },
  removeImageBtn: {
    padding: SPACING.sm,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
    ...SHADOWS.small,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
