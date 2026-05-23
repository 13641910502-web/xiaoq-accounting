import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Colors, Typography } from '../../constants';
import { formatAmount } from '../../utils/currency';
import type { ChartDataPoint } from '../../types/chart';

interface Props {
  data: ChartDataPoint[];
}

export function CategoryPieChart({ data }: Props) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartData = data.map(d => ({
    value: d.value,
    color: d.color,
    text: d.label,
  }));

  const screenWidth = Dimensions.get('window').width;
  const chartSize = Math.min(screenWidth - 80, 240);

  return (
    <View style={styles.container}>
      <PieChart
        data={chartData}
        donut
        radius={chartSize / 2}
        innerRadius={chartSize / 2 - 30}
        innerCircleColor={Colors.surface}
        showText={false}
        centerLabelComponent={() => (
          <View style={styles.centerLabel}>
            <Text style={styles.centerAmount}>{formatAmount(total)}</Text>
            <Text style={styles.centerText}>总支出</Text>
          </View>
        )}
      />
      <View style={styles.legend}>
        {data.slice(0, 6).map(d => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <View key={d.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: d.color }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>{d.label}</Text>
              <Text style={styles.legendPct}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  centerLabel: { alignItems: 'center' },
  centerAmount: { ...Typography.amount, color: Colors.text, fontSize: 16 },
  centerText: { ...Typography.caption, color: Colors.textTertiary },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, justifyContent: 'center', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '45%', marginBottom: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendLabel: { ...Typography.caption, color: Colors.textSecondary, flex: 1 },
  legendPct: { ...Typography.caption, color: Colors.textTertiary },
});
