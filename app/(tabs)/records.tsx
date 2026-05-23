import { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBillStore } from '../../src/stores/billStore';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { BillTimeline } from '../../src/components/bills/BillTimeline';
import { BillFilterBar } from '../../src/components/bills/BillFilterBar';
import { Colors, Typography, Spacing } from '../../src/constants';
import type { Bill } from '../../src/types/bill';

export default function RecordsScreen() {
  const router = useRouter();
  const { bills, fetchBills, hasMore, isLoading, removeBill, setFilter, filter, clearFilter } = useBillStore();
  const { mainCategories, loadCategories } = useCategoryStore();

  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [localFilter, setLocalFilter] = useState({
    categories: [] as string[],
    dateRange: null as { start: string; end: string } | null,
    amountMin: '',
    amountMax: '',
  });

  useEffect(() => {
    loadCategories();
    fetchBills(true);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    fetchBills(true);
    setRefreshing(false);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) fetchBills();
  }, [hasMore, isLoading]);

  const handleSearch = () => {
    if (searchText.trim()) {
      setFilter({ searchText: searchText.trim() });
    } else {
      const { searchText: _, ...rest } = filter;
      setFilter(rest);
    }
  };

  const handleFilterChange = (newFilter: typeof localFilter) => {
    setLocalFilter(newFilter);
    const f: Record<string, unknown> = {};
    if (newFilter.categories.length > 0) f.categories = newFilter.categories;
    if (newFilter.dateRange) f.dateRange = newFilter.dateRange;
    if (newFilter.amountMin) {
      f.amountRange = {
        min: parseFloat(newFilter.amountMin),
        ...(newFilter.amountMax ? { max: parseFloat(newFilter.amountMax) } : {}),
      };
    } else if (newFilter.amountMax) {
      f.amountRange = { max: parseFloat(newFilter.amountMax) };
    }
    if (searchText.trim()) f.searchText = searchText.trim();
    setFilter(f);
  };

  const handleClearFilter = () => {
    setLocalFilter({ categories: [], dateRange: null, amountMin: '', amountMax: '' });
    setSearchText('');
    clearFilter();
  };

  const handlePressBill = (bill: Bill) => {
    router.push(`/records/${bill.id}`);
  };

  const handleLongPressBill = (bill: Bill) => {
    Alert.alert(bill.description, `金额: ¥${bill.amount.toFixed(2)}\n分类: ${bill.main_category}`, [
      { text: '取消', style: 'cancel' },
      { text: '编辑', onPress: () => router.push(`/records/edit/${bill.id}`) },
      { text: '删除', style: 'destructive', onPress: () => removeBill(bill.id) },
    ]);
  };

  const ListHeader = (
    <View>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索账单描述..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          placeholderTextColor={Colors.textTertiary}
        />
        {searchText.length > 0 && (
          <Ionicons
            name="close-circle"
            size={18}
            color={Colors.textTertiary}
            onPress={() => { setSearchText(''); clearFilter(); }}
          />
        )}
      </View>

      {/* Filter Bar */}
      <BillFilterBar
        categories={mainCategories}
        activeFilter={localFilter}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilter}
      />

      {/* Results summary */}
      {bills.length > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            共 {bills.length} 条记录
            {localFilter.categories.length > 0 && ` · ${localFilter.categories.join(', ')}`}
          </Text>
        </View>
      )}
    </View>
  );

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color={Colors.textTertiary} />
      <Text style={styles.emptyText}>暂无账单记录</Text>
      <Text style={styles.emptyHint}>点击"记账"标签开始记录吧</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <BillTimeline
        bills={bills}
        categories={mainCategories}
        onPressBill={handlePressBill}
        onLongPressBill={handleLongPressBill}
        onEndReached={loadMore}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.black,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.sm + 2,
    marginLeft: Spacing.sm,
  },
  summaryRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  summaryText: { ...Typography.label, color: Colors.textSecondary },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyText: { ...Typography.bodyBold, color: Colors.textSecondary, marginTop: Spacing.md },
  emptyHint: { ...Typography.caption, color: Colors.textTertiary, marginTop: Spacing.xs },
});
