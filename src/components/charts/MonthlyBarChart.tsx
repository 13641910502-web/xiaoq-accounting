import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Colors, Typography } from '../../constants';
import { formatAmountShort } from '../../utils/currency';
import { getMonthLabel } from '../../utils/date';
import type { MonthlyData } from '../../types/chart';

interface Props {
  data: MonthlyData[];
}

export function MonthlyBarChart({ data }: Props) {
  if (data.length === 0) return null;

  const chartData = data.map((d, i) => {
    const isCurrent = i === data.length - 1;
    return {
      value: d.total,
      label: getMonthLabel(d.month).slice(-2), // Just show month number
      frontColor: isCurrent ? Colors.primary : Colors.primaryLight,
      topLabelComponent: () => (
        <Text style={styles.barLabel}>{formatAmountShort(d.total)}</Text>
      ),
    };
  });

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 80, chartData.length * 50);

  return (
    <View style={styles.container}>
      <BarChart
        data={chartData}
        width={chartWidth}
        height={160}
        barWidth={28}
        spacing={20}
        roundedTop
        roundedBottom
        hideRules
        xAxisThickness={1}
        xAxisColor={Colors.border}
        yAxisThickness={0}
        yAxisTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
        noOfSections={4}
        maxValue={Math.max(...data.map(d => d.total)) * 1.2}
        isAnimated
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', overflow: 'hidden' },
  barLabel: { ...Typography.caption, color: Colors.textTertiary, marginBottom: 4, fontSize: 10 },
});
