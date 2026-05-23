import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChartStore } from '../../src/stores/chartStore';
import { useBillStore } from '../../src/stores/billStore';
import { Colors, Typography, Spacing } from '../../src/constants';
import { formatAmount } from '../../src/utils/currency';
import { getCurrentYearMonth, getMonthLabel } from '../../src/utils/date';
import { CategoryPieChart } from '../../src/components/charts/CategoryPieChart';
import { MonthlyBarChart } from '../../src/components/charts/MonthlyBarChart';
import { TrendLineChart } from '../../src/components/charts/TrendLineChart';
import { DailyHeatmap } from '../../src/components/charts/DailyHeatmap';

export default function DashboardScreen() {
  const { summary, categoryData, monthlyData, trendData, heatmapData, selectedMonth, loadDashboard, setSelectedMonth } = useChartStore();
  const { fetchBills } = useBillStore();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  useEffect(() => {
    const month = getCurrentYearMonth();
    loadDashboard(month);
    fetchBills(true);
  }, []);

  const changeMonth = (offset: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + offset, 1);
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
    loadDashboard(newMonth);
  };

  const chartGrid = (
    <View style={isDesktop ? styles.desktopGrid : undefined}>
      <View style={[styles.chartCard, isDesktop && styles.chartCardHalf]}>
        <Text style={styles.chartTitle}>分类支出</Text>
        {categoryData.length > 0 ? (
          <CategoryPieChart data={categoryData} />
        ) : (
          <Text style={styles.emptyText}>暂无数据</Text>
        )}
      </View>

      <View style={[styles.chartCard, isDesktop && styles.chartCardHalf]}>
        <Text style={styles.chartTitle}>月度对比</Text>
        {monthlyData.length > 0 ? (
          <MonthlyBarChart data={monthlyData} />
        ) : (
          <Text style={styles.emptyText}>暂无数据</Text>
        )}
      </View>

      <View style={[styles.chartCard, isDesktop && styles.chartCardFull]}>
        <Text style={styles.chartTitle}>本月趋势</Text>
        {trendData.length > 0 ? (
          <TrendLineChart data={trendData} />
        ) : (
          <Text style={styles.emptyText}>暂无数据</Text>
        )}
      </View>

      <View style={[styles.chartCard, isDesktop && styles.chartCardFull]}>
        <Text style={styles.chartTitle}>支出热力图</Text>
        <Text style={styles.chartSubtitle}>近三个月每日支出分布</Text>
        <DailyHeatmap data={heatmapData} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, isDesktop && styles.contentWide]}>
      {/* Header */}
      <View style={[styles.headerRow, isDesktop && styles.headerRowDesktop]}>
        <View>
          <Text style={styles.pageTitle}>概览</Text>
          <Text style={styles.pageSubtitle}>智能记账，轻松理财</Text>
        </View>

        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthBtn}>
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{getMonthLabel(selectedMonth)}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthBtn}>
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
        <View style={[styles.statCard, { backgroundColor: Colors.primary }]}>
          <Text style={styles.statLabel}>本月支出</Text>
          <Text style={styles.statAmount}>
            {summary ? formatAmount(summary.totalSpending) : '¥0.00'}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: isDesktop ? Colors.surface : Colors.white }]}>
          <Text style={[styles.statLabel, { color: isDesktop ? Colors.textSecondary : Colors.white }]}>环比</Text>
          <Text style={[styles.statValue, summary?.monthOverMonth && summary.monthOverMonth > 0 ? styles.statUp : null, { color: isDesktop ? Colors.text : Colors.white }]}>
            {summary ? `${summary.monthOverMonth > 0 ? '+' : ''}${summary.monthOverMonth}%` : '--'}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: isDesktop ? Colors.surface : Colors.white + 'DD' }]}>
          <Text style={[styles.statLabel, { color: isDesktop ? Colors.textSecondary : Colors.white }]}>笔数</Text>
          <Text style={[styles.statValue, { color: isDesktop ? Colors.text : Colors.white }]}>
            {summary?.billCount ?? '--'}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: isDesktop ? Colors.surface : Colors.white + 'CC' }]}>
          <Text style={[styles.statLabel, { color: isDesktop ? Colors.textSecondary : Colors.white }]}>最多</Text>
          <Text style={[styles.statValue, { color: summary?.topCategory.color ?? Colors.text }]} numberOfLines={1}>
            {summary ? `${summary.topCategory.icon} ${summary.topCategory.name}` : '--'}
          </Text>
        </View>
      </View>

      {/* Charts */}
      {chartGrid}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  contentWide: { maxWidth: 1200, alignSelf: 'center', width: '100%' },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerRowDesktop: { marginBottom: Spacing.xl },
  pageTitle: { ...Typography.h2, color: Colors.text },
  pageSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },

  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  monthBtn: { padding: Spacing.xs },
  monthText: { ...Typography.body, color: Colors.text, fontWeight: '600', minWidth: 90, textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statsRowDesktop: { gap: Spacing.md, marginBottom: Spacing.xl },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  statAmount: { ...Typography.amount, color: Colors.white, fontSize: 18, fontWeight: '700' },
  statValue: { ...Typography.h3, color: Colors.white, fontSize: 16 },
  statUp: { color: '#FFD93D' },

  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  chartCardHalf: { flex: 1, minWidth: 360, marginBottom: 0 },
  chartCardFull: { width: '100%' },
  chartTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.xs },
  chartSubtitle: { ...Typography.caption, color: Colors.textTertiary, marginBottom: Spacing.md },
  emptyText: { ...Typography.body, color: Colors.textTertiary, textAlign: 'center', paddingVertical: Spacing.xxxl },

  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
});
