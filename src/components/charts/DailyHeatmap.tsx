import { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants';

interface HeatmapData {
  date: string;
  amount: number;
}

interface Props {
  data: HeatmapData[];
  color?: string;
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
const CELL_SIZE = 14;
const CELL_GAP = 3;

export function DailyHeatmap({ data, color = Colors.primary }: Props) {
  const { grid, maxAmount } = useMemo(() => {
    // Build a map of date -> amount
    const dateMap = new Map<string, number>();
    let max = 0;
    for (const d of data) {
      dateMap.set(d.date, d.amount);
      if (d.amount > max) max = d.amount;
    }

    // Build grid: weeks x 7 days
    const now = new Date();
    // Start from ~12 weeks ago
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 84); // 12 weeks

    // Align to Monday
    const dayOfWeek = startDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + mondayOffset);

    const weeks: { date: string; amount: number; dayOfWeek: number }[][] = [];
    let currentWeek: typeof weeks[0] = [];

    const d = new Date(startDate);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 1);

    while (d <= endDate) {
      const dateStr = d.toISOString().slice(0, 10);
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1; // Monday=0, Sunday=6

      if (dayIdx === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push({
        date: dateStr,
        amount: dateMap.get(dateStr) ?? 0,
        dayOfWeek: dayIdx,
      });

      d.setDate(d.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { grid: weeks.slice(-12), maxAmount: max }; // Keep last 12 weeks
  }, [data]);

  const getColor = (amount: number): string => {
    if (amount === 0) return Colors.border;
    const intensity = maxAmount > 0 ? amount / maxAmount : 0;
    if (intensity < 0.25) return color + '30';
    if (intensity < 0.5) return color + '60';
    if (intensity < 0.75) return color + '90';
    return color;
  };

  if (maxAmount === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>近三个月无支出记录</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Day labels */}
      <View style={styles.row}>
        <View style={styles.labelCol}>
          {DAY_LABELS.map(l => (
            <Text key={l} style={styles.dayLabel}>{l}</Text>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.gridWrapper}>
          <View style={styles.grid}>
            {grid.map((week, wi) => (
              <View key={wi} style={styles.weekCol}>
                {week.map((cell, di) => (
                  <View
                    key={`${wi}-${di}`}
                    style={[
                      styles.cell,
                      { backgroundColor: getColor(cell.amount) },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendText}>少</Text>
            <View style={[styles.legendCell, { backgroundColor: Colors.border }]} />
            <View style={[styles.legendCell, { backgroundColor: color + '30' }]} />
            <View style={[styles.legendCell, { backgroundColor: color + '60' }]} />
            <View style={[styles.legendCell, { backgroundColor: color + '90' }]} />
            <View style={[styles.legendCell, { backgroundColor: color }]} />
            <Text style={styles.legendText}>多</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  empty: { paddingVertical: Spacing.xl, alignItems: 'center' },
  emptyText: { ...Typography.caption, color: Colors.textTertiary },
  row: { flexDirection: 'row' },
  labelCol: { marginRight: Spacing.sm, justifyContent: 'space-between', paddingVertical: 1 },
  dayLabel: { ...Typography.caption, color: Colors.textTertiary, height: CELL_SIZE, lineHeight: CELL_SIZE, fontSize: 10 },
  gridWrapper: { flex: 1 },
  grid: { flexDirection: 'row', gap: CELL_GAP },
  weekCol: { gap: CELL_GAP },
  cell: { width: CELL_SIZE, height: CELL_SIZE, borderRadius: 3 },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    gap: 3,
  },
  legendCell: { width: 10, height: 10, borderRadius: 2 },
  legendText: { ...Typography.caption, color: Colors.textTertiary, fontSize: 9 },
});
