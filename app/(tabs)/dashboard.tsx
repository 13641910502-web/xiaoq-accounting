import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChartStore } from '../../src/stores/chartStore';
import { useBillStore } from '../../src/stores/billStore';
import { Colors, Typography, Spacing, BorderRadius, BorderWidth } from '../../src/constants';
import { formatAmount } from '../../src/utils/currency';
import { getCurrentYearMonth, getMonthLabel } from '../../src/utils/date';
import { CategoryPieChart } from '../../src/components/charts/CategoryPieChart';
import { MonthlyBarChart } from '../../src/components/charts/MonthlyBarChart';
import { TrendLineChart } from '../../src/components/charts/TrendLineChart';
import { DailyHeatmap } from '../../src/components/charts/DailyHeatmap';

const STAT_CARDS = [
  { key: 'spending', title: '本月支出', color: Colors.black, textColor: Colors.white },
  { key: 'mom', title: '环比', color: Colors.red, textColor: Colors.white },
  { key: 'count', title: '笔数', color: Colors.blue, textColor: Colors.white },
  { key: 'top', title: '最多', color: Colors.yellow, textColor: Colors.black },
] as const;

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

  const statValue = (key: string) => {
    if (!summary) return { value: '--', sub: '' };
    switch (key) {
      case 'spending': return { value: formatAmount(summary.totalSpending), sub: '' };
      case 'mom': return { value: `${summary.monthOverMonth > 0 ? '+' : ''}${summary.monthOverMonth}%`, sub: '' };
      case 'count': return { value: String(summary.billCount), sub: '笔' };
      case 'top': return { value: summary.topCategory.icon, sub: summary.topCategory.name };
    }
    return { value: '--', sub: '' };
  };

  const chartGrid = (
    <View style={[isDesktop && styles.desktopGrid]}>
      <View style={[styles.chartCard, isDesktop && styles.chartHalf]}>
        <Text style={styles.chartLabel}>分类支出</Text>
        {categoryData.length > 0 ? (
          <CategoryPieChart data={categoryData} />
        ) : (
          <Text style={styles.emptyText}>暂无数据</Text>
        )}
      </View>

      <View style={[styles.chartCard, isDesktop && styles.chartHalf]}>
        <Text style={styles.chartLabel}>月度对比</Text>
        {monthlyData.length > 0 ? (
          <MonthlyBarChart data={monthlyData} />
        ) : (
          <Text style={styles.emptyText}>暂无数据</Text>
        )}
      </View>

      <View style={[styles.chartCard, isDesktop && styles.chartFull]}>
        <Text style={styles.chartLabel}>本月趋势</Text>
        {trendData.length > 0 ? (
          <TrendLineChart data={trendData} />
        ) : (
          <Text style={styles.emptyText}>暂无数据</Text>
        )}
      </View>

      <View style={[styles.chartCard, isDesktop && styles.chartFull]}>
        <View style={styles.chartHeaderRow}>
          <Text style={styles.chartLabel}>支出热力图</Text>
          <Text style={styles.chartSub}>近三个月每日支出分布</Text>
        </View>
        <DailyHeatmap data={heatmapData} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, isDesktop && styles.contentWide]}>
      {/* Header with month picker */}
      <View style={[styles.header, isDesktop && styles.headerWide]}>
        <View>
          <Text style={styles.pageTitle}>概览</Text>
          <View style={styles.titleBar} />
          <Text style={styles.pageSub}>智能记账，轻松理财</Text>
        </View>

        <View style={styles.monthPicker}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthBtn}>
            <Ionicons name="chevron-back" size={16} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{getMonthLabel(selectedMonth)}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthBtn}>
            <Ionicons name="chevron-forward" size={16} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stat Cards — Bauhaus color blocks */}
      <View style={[styles.statsRow, isDesktop && styles.statsRowWide]}>
        {STAT_CARDS.map((card) => (
          <View key={card.key} style={[styles.statCard, { backgroundColor: card.color }]}>
            <Text style={[styles.statLabel, { color: card.textColor === Colors.white ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
              {card.title}
            </Text>
            <Text style={[styles.statValue, { color: card.textColor }]} numberOfLines={1}>
              {statValue(card.key).value}
            </Text>
            {statValue(card.key).sub ? (
              <Text style={[styles.statSub, { color: card.textColor === Colors.white ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
                {statValue(card.key).sub}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      {/* Chart grid */}
      {chartGrid}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  contentWide: { maxWidth: 1200, alignSelf: 'center', width: '100%' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  headerWide: { marginBottom: Spacing.xxxl },
  pageTitle: { ...Typography.h1, color: Colors.black },
  titleBar: {
    width: 48,
    height: BorderWidth.heavy,
    backgroundColor: Colors.red,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  pageSub: { ...Typography.bodySmall, color: Colors.textSecondary },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderWidth: BorderWidth.normal,
    borderColor: Colors.black,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  monthBtn: { padding: Spacing.xs },
  monthText: { ...Typography.bodyBold, color: Colors.black, minWidth: 100, textAlign: 'center' },

  // Stat cards
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  statsRowWide: { gap: Spacing.md, marginBottom: Spacing.xxxl },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderWidth: BorderWidth.normal,
    borderColor: Colors.black,
  },
  statLabel: { ...Typography.label, marginBottom: Spacing.xs },
  statValue: { ...Typography.amount, fontSize: 22 },
  statSub: { ...Typography.caption, marginTop: 2 },

  // Charts
  chartCard: {
    backgroundColor: Colors.surface,
    borderWidth: BorderWidth.normal,
    borderColor: Colors.black,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  chartHalf: { flex: 1, minWidth: 360, marginBottom: 0 },
  chartFull: { width: '100%' },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  chartLabel: { ...Typography.label, color: Colors.black, marginBottom: Spacing.md },
  chartSub: { ...Typography.caption, color: Colors.textTertiary },
  emptyText: { ...Typography.body, color: Colors.textTertiary, textAlign: 'center', paddingVertical: Spacing.xxxl },

  // Grid
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
});
