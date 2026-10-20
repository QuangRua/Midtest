import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n/LanguageContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { MSSV } from '../constants/config';

export const DishCard = ({ dish, categoryName, onPress }) => {
  const { t } = useLanguage();

  const name = dish[`${MSSV}_Name`] || 'Unnamed Dish';
  const price = Number(dish[`${MSSV}_Price`] || 0);
  const prepTime = Number(dish[`${MSSV}_PreparationTime`] || 0);
  const isAvailable = Boolean(dish[`${MSSV}_IsAvailable`]);
  const images = Array.isArray(dish[`${MSSV}_DishImage`]) ? dish[`${MSSV}_DishImage`] : [];

  // Find thumbnail or first image
  const thumbnailObj = images.find((img) => img[`${MSSV}_IsThumbnail`] === true) || images[0];
  const imageUrl = thumbnailObj?.[`${MSSV}_ImageUrl`];

  // Quick vs Regular computed rule (Requirement 4.3)
  const isQuick = prepTime <= 15;

  // Format currency
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(price) + ' ₫';

  return (
    <TouchableOpacity
      style={[styles.card, !isAvailable && styles.cardUnavailable]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Dish Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="fast-food-outline" size={36} color={COLORS.textMuted} />
          </View>
        )}

        {/* Prep Time Badge (Quick / Regular) */}
        <View style={[styles.prepBadge, isQuick ? styles.quickBadge : styles.regularBadge]}>
          <Ionicons
            name={isQuick ? 'flash' : 'time-outline'}
            size={12}
            color={isQuick ? COLORS.secondary : COLORS.accent}
            style={styles.prepIcon}
          />
          <Text style={[styles.prepText, isQuick ? styles.quickText : styles.regularText]}>
            {isQuick ? t('quickPrep') : t('regularPrep')} ({prepTime} {t('prepTimeMinutes')})
          </Text>
        </View>
      </View>

      {/* Dish Info */}
      <View style={styles.content}>
        {/* Category Pill & Status Badge */}
        <View style={styles.badgeRow}>
          {categoryName ? (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {categoryName}
              </Text>
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

        {/* Dish Name */}
        <Text style={styles.title} numberOfLines={2}>
          {name}
        </Text>

        {/* Bottom row: Price & arrow */}
        <View style={styles.bottomRow}>
          <Text style={styles.priceText}>{formattedPrice}</Text>
          <View style={styles.detailArrow}>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  cardUnavailable: {
    opacity: 0.88,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#ECEFF1',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prepBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
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
  prepIcon: {
    marginRight: 4,
  },
  prepText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickText: {
    color: COLORS.secondary,
  },
  regularText: {
    color: COLORS.accent,
  },
  content: {
    padding: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs + 2,
  },
  categoryPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    maxWidth: '60%',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
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
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  priceText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailArrow: {
    padding: 2,
  },
});
