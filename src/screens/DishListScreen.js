import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../context/FoodContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Header } from '../components/Header';
import { OfflineBanner } from '../components/OfflineBanner';
import { DishCard } from '../components/DishCard';
import { EmptyState } from '../components/EmptyState';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { MSSV } from '../constants/config';

export const DishListScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const {
    categories,
    filteredDishes,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sortBy,
    setSortBy,
    resetFilters,
    reload,
  } = useFood();

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [priceError, setPriceError] = useState('');

  // Validate price range when inputs change
  const handleMinPriceChange = (val) => {
    setMinPrice(val.replace(/[^0-9]/g, ''));
    validatePriceRange(val, maxPrice);
  };

  const handleMaxPriceChange = (val) => {
    setMaxPrice(val.replace(/[^0-9]/g, ''));
    validatePriceRange(minPrice, val);
  };

  const validatePriceRange = (min, max) => {
    if (min !== '' && max !== '' && Number(min) > Number(max)) {
      setPriceError(t('valMinMaxPriceInvalid'));
    } else {
      setPriceError('');
    }
  };

  // Find category name by ID
  const getCategoryName = (catId) => {
    const cat = categories.find((c) => String(c[`${MSSV}_Id`]) === String(catId));
    return cat ? cat[`${MSSV}_Name`] : '';
  };

  // Active filter count for badge
  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (sortBy !== 'DEFAULT' ? 1 : 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* App Header with MSSV, Network & Lang toggle */}
      <Header
        navigation={navigation}
        title={t('dishListTitle')}
        rightAction={
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Categories')}
              title={t('manageCategories')}
            >
              <Ionicons name="grid-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Settings')}
              title={t('settings')}
            >
              <Ionicons name="settings-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Offline sync status banner */}
      <OfflineBanner />

      {/* Search Bar & Filter Toggle Button */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.filterToggleBtn, isFilterExpanded && styles.filterToggleActive]}
          onPress={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <Ionicons
            name="funnel"
            size={18}
            color={isFilterExpanded || activeFiltersCount > 0 ? COLORS.primary : COLORS.textSecondary}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Expandable Advanced Multi-filter & Sort Panel (Requirement 4.2) */}
      {isFilterExpanded && (
        <View style={styles.filterPanel}>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.filterScroll}>
            {/* Filter by Category */}
            <Text style={styles.filterSectionTitle}>{t('filterCategory')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
              <TouchableOpacity
                style={[styles.pill, selectedCategory === '' && styles.pillActive]}
                onPress={() => setSelectedCategory('')}
              >
                <Text style={[styles.pillText, selectedCategory === '' && styles.pillTextActive]}>
                  {t('all')}
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => {
                const catId = String(cat[`${MSSV}_Id`]);
                const isSelected = selectedCategory === catId;
                return (
                  <TouchableOpacity
                    key={catId}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => setSelectedCategory(isSelected ? '' : catId)}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {cat[`${MSSV}_Name`]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Filter by Status: All vs Available Only */}
            <Text style={styles.filterSectionTitle}>{t('filterStatus')}</Text>
            <View style={styles.statusRow}>
              <TouchableOpacity
                style={[styles.segmentBtn, selectedStatus === 'ALL' && styles.segmentBtnActive]}
                onPress={() => setSelectedStatus('ALL')}
              >
                <Text style={[styles.segmentText, selectedStatus === 'ALL' && styles.segmentTextActive]}>
                  {t('statusAll')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, selectedStatus === 'AVAILABLE' && styles.segmentBtnActive]}
                onPress={() => setSelectedStatus('AVAILABLE')}
              >
                <Text style={[styles.segmentText, selectedStatus === 'AVAILABLE' && styles.segmentTextActive]}>
                  {t('statusAvailableOnly')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Filter by Price Range (Min Price - Max Price) */}
            <Text style={styles.filterSectionTitle}>{t('filterPriceRange')}</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceInputWrapper}>
                <TextInput
                  style={styles.priceInput}
                  placeholder={t('minPrice')}
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={handleMinPriceChange}
                />
              </View>
              <Text style={styles.priceDash}>—</Text>
              <View style={styles.priceInputWrapper}>
                <TextInput
                  style={styles.priceInput}
                  placeholder={t('maxPrice')}
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={handleMaxPriceChange}
                />
              </View>
            </View>
            {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}

            {/* Sorting options */}
            <Text style={styles.filterSectionTitle}>{t('sortBy')}</Text>
            <View style={styles.sortContainer}>
              {[
                { id: 'DEFAULT', label: t('sortDefault') },
                { id: 'PRICE_ASC', label: t('sortPriceAsc') },
                { id: 'PRICE_DESC', label: t('sortPriceDesc') },
                { id: 'PREP_TIME_ASC', label: t('sortPrepTimeAsc') },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.sortOption, sortBy === opt.id && styles.sortOptionActive]}
                  onPress={() => setSortBy(opt.id)}
                >
                  <Ionicons
                    name={sortBy === opt.id ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={sortBy === opt.id ? COLORS.primary : COLORS.textSecondary}
                    style={{ marginRight: SPACING.sm }}
                  />
                  <Text style={[styles.sortText, sortBy === opt.id && styles.sortTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filter Action buttons */}
            <View style={styles.filterBtnRow}>
              <TouchableOpacity style={styles.resetFiltersBtn} onPress={resetFilters}>
                <Text style={styles.resetFiltersText}>{t('clearFilters')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersBtn}
                onPress={() => setIsFilterExpanded(false)}
              >
                <Text style={styles.applyFiltersText}>{t('applyFilters')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Dish Count Header */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {filteredDishes.length} {t('dishesCount')}
        </Text>
        {activeFiltersCount > 0 && !isFilterExpanded && (
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.activeFilterReset}>{t('clearFilters')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dish List */}
      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => String(item[`${MSSV}_Id`] || item.id)}
        renderItem={({ item }) => (
          <DishCard
            dish={item}
            categoryName={getCategoryName(item[`${MSSV}_DishCategoryId`])}
            onPress={() => navigation.navigate('DishDetail', { dishId: item[`${MSSV}_Id`] })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reload} />}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title={t('noDishesFound')}
            message={activeFiltersCount > 0 ? t('clearFilters') : t('addFirstDish')}
            actionText={activeFiltersCount > 0 ? t('clearFilters') : t('addNewDish')}
            onAction={activeFiltersCount > 0 ? resetFilters : () => navigation.navigate('DishForm')}
          />
        }
      />

      {/* Floating Action Button: Add Dish */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('DishForm')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
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
  headerIconBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    height: '100%',
  },
  clearSearchBtn: {
    padding: 4,
  },
  filterToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    position: 'relative',
  },
  filterToggleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  filterPanel: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    maxHeight: 380,
    ...SHADOWS.medium,
  },
  filterScroll: {
    maxHeight: 360,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs + 2,
  },
  pillRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  pill: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  pillTextActive: {
    color: COLORS.white,
  },
  statusRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInputWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 40,
    justifyContent: 'center',
  },
  priceInput: {
    fontSize: 13,
    color: COLORS.text,
  },
  priceDash: {
    marginHorizontal: SPACING.sm,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 11,
    marginTop: 4,
  },
  sortContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
  },
  sortOptionActive: {},
  sortText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sortTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  filterBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  resetFiltersBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetFiltersText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  applyFiltersBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFiltersText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeFilterReset: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  listContent: {
    paddingTop: SPACING.sm,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
});
