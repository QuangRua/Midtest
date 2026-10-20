import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../context/FoodContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Header } from '../components/Header';
import { OfflineBanner } from '../components/OfflineBanner';
import { ConfirmModal } from '../components/ConfirmModal';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { MSSV } from '../constants/config';

const { width } = Dimensions.get('window');

export const DishDetailScreen = ({ route, navigation }) => {
  const { dishId } = route.params || {};
  const { t } = useLanguage();
  const { dishes, categories, deleteDish, updateDish } = useFood();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Find dish by ID
  const dish = dishes.find((d) => String(d[`${MSSV}_Id`]) === String(dishId));

  // If dish not found
  if (!dish) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header navigation={navigation} title={t('dishDetailTitle')} showBack />
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.danger} />
          <Text style={styles.notFoundText}>{t('dishNotFound')}</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>{t('close')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const name = dish[`${MSSV}_Name`] || '';
  const price = Number(dish[`${MSSV}_Price`] || 0);
  const prepTime = Number(dish[`${MSSV}_PreparationTime`] || 0);
  const isAvailable = Boolean(dish[`${MSSV}_IsAvailable`]);
  const description = dish[`${MSSV}_Description`] || '';
  const categoryId = String(dish[`${MSSV}_DishCategoryId`]);
  const images = Array.isArray(dish[`${MSSV}_DishImage`]) ? dish[`${MSSV}_DishImage`] : [];

  const category = categories.find((c) => String(c[`${MSSV}_Id`]) === categoryId);
  const categoryName = category ? category[`${MSSV}_Name`] : '';

  const isQuick = prepTime <= 15;
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(price) + ' ₫';

  // Handle changing thumbnail (Requirement 4.3)
  const handleSetThumbnail = async (indexToSet) => {
    if (indexToSet < 0 || indexToSet >= images.length) return;

    const newImages = images.map((img, idx) => ({
      ...img,
      [`${MSSV}_IsThumbnail`]: idx === indexToSet,
    }));

    try {
      await updateDish(dishId, {
        ...dish,
        [`${MSSV}_DishImage`]: newImages,
      });
    } catch (e) {
      console.warn('Failed to update thumbnail:', e);
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteDish(dishId);
      setShowDeleteModal(false);
      navigation.goBack();
    } catch (e) {
      console.warn('Failed to delete dish:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const activeImage = images[selectedImageIndex] || images[0];
  const isCurrentActiveThumbnail = activeImage?.[`${MSSV}_IsThumbnail`] === true;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        navigation={navigation}
        title={t('dishDetailTitle')}
        showBack
        rightAction={
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => navigation.navigate('DishForm', { dishId })}
            >
              <Ionicons name="create-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => setShowDeleteModal(true)}
            >
              <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        }
      />

      <OfflineBanner />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image Banner */}
        <View style={styles.mainImageContainer}>
          {activeImage?.[`${MSSV}_ImageUrl`] ? (
            <Image
              source={{ uri: activeImage[`${MSSV}_ImageUrl`] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.noImagesText}>{t('noImages')}</Text>
            </View>
          )}

          {/* Prep Time Badge */}
          <View style={[styles.prepBadge, isQuick ? styles.quickBadge : styles.regularBadge]}>
            <Ionicons
              name={isQuick ? 'flash' : 'time-outline'}
              size={14}
              color={isQuick ? COLORS.secondary : COLORS.accent}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.prepText, isQuick ? styles.quickText : styles.regularText]}>
              {isQuick ? t('quickPrep') : t('regularPrep')} ({prepTime} {t('prepTimeMinutes')})
            </Text>
          </View>

          {/* Thumbnail Badge on Main Image */}
          {isCurrentActiveThumbnail && (
            <View style={styles.activeThumbBadge}>
              <Ionicons name="star" size={12} color={COLORS.white} style={{ marginRight: 4 }} />
              <Text style={styles.activeThumbText}>{t('thumbnail')}</Text>
            </View>
          )}
        </View>

        {/* Thumbnail Selector & Multi-image carousel (Requirement 4.3) */}
        {images.length > 0 && (
          <View style={styles.imageThumbnailsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbsScroll}>
              {images.map((img, idx) => {
                const isSelected = idx === selectedImageIndex;
                const isThumb = img[`${MSSV}_IsThumbnail`] === true;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.thumbWrapper,
                      isSelected && styles.thumbWrapperSelected,
                    ]}
                    onPress={() => setSelectedImageIndex(idx)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: img[`${MSSV}_ImageUrl`] }}
                      style={styles.thumbImage}
                      resizeMode="cover"
                    />
                    {isThumb && (
                      <View style={styles.thumbStar}>
                        <Ionicons name="star" size={10} color={COLORS.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Set as thumbnail button if active image is not current thumbnail */}
            {!isCurrentActiveThumbnail && activeImage && (
              <TouchableOpacity
                style={styles.setThumbnailBtn}
                onPress={() => handleSetThumbnail(selectedImageIndex)}
                activeOpacity={0.8}
              >
                <Ionicons name="star-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.setThumbnailText}>{t('setAsThumbnail')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Dish Info Card */}
        <View style={styles.card}>
          {/* Header Row: Category & Status */}
          <View style={styles.metaRow}>
            {categoryName ? (
              <View style={styles.categoryPill}>
                <Ionicons name="restaurant" size={12} color={COLORS.primaryDark} style={{ marginRight: 4 }} />
                <Text style={styles.categoryText}>{categoryName}</Text>
              </View>
            ) : null}

            <View
              style={[
                styles.statusBadge,
                isAvailable ? styles.statusAvailable : styles.statusUnavailable,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isAvailable ? COLORS.secondary : COLORS.warning },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isAvailable ? COLORS.secondary : COLORS.warning },
                ]}
              >
                {isAvailable ? t('statusAvailable') : t('statusUnavailable')}
              </Text>
            </View>
          </View>

          {/* Dish Title */}
          <Text style={styles.dishTitle}>{name}</Text>

          {/* Price Box */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>{t('price')}</Text>
            <Text style={styles.priceValue}>{formattedPrice}</Text>
          </View>

          <View style={styles.divider} />

          {/* Preparation Time Details */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <Ionicons name="time" size={20} color={COLORS.accent} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('preparationTime')}</Text>
              <Text style={styles.detailValue}>
                {prepTime} {t('prepTimeMinutes')} (
                {isQuick ? `${t('quickPrep')} ≤ 15 min` : `${t('regularPrep')} > 15 min`})
              </Text>
            </View>
          </View>

          {/* Description */}
          {description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionHeading}>{t('description')}</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title={t('deleteDishConfirmTitle')}
        message={t('deleteDishConfirmMsg')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.md,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainImageContainer: {
    width: '100%',
    height: 260,
    backgroundColor: '#CFD8DC',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagesText: {
    marginTop: SPACING.sm,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  prepBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...SHADOWS.small,
  },
  quickBadge: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  regularBadge: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  prepText: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickText: {
    color: COLORS.secondary,
  },
  regularText: {
    color: COLORS.accent,
  },
  activeThumbBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  activeThumbText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  imageThumbnailsSection: {
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  thumbsScroll: {
    flexDirection: 'row',
  },
  thumbWrapper: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbWrapperSelected: {
    borderColor: COLORS.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbStar: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setThumbnailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  setThumbnailText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    margin: SPACING.lg,
    padding: SPACING.xl,
    ...SHADOWS.small,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  statusAvailable: {
    backgroundColor: COLORS.secondaryLight,
  },
  statusUnavailable: {
    backgroundColor: COLORS.warningLight,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dishTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 28,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  descriptionSection: {
    marginTop: SPACING.md,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs + 2,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginVertical: SPACING.lg,
    textAlign: 'center',
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
