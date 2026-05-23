import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors, Typography } from '../../constants';
import { formatAmountShort } from '../../utils/currency';

interface Props {
  data: { date: string; amount: number }[];
  color?: string;
}

export function TrendLineChart({ data, color = Colors.primary }: Props) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.amount), 1);
  const screenWidth = Dimensions.get('window').width;

  const chartData = data.map((d, i) => ({
    value: d.amount,
    label: i % 5 === 0 ? d.date.slice(8) : '',
    dataPointText: '',
  }));

  const spacing = Math.max(20, (screenWidth - 80) / chartData.length - 2);

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth - 80}
        height={140}
        spacing={spacing}
        color={color}
        thickness={2}
        startFillColor={color + '20'}
        endFillColor={color + '02'}
        startOpacity={0.6}
        endOpacity={0.05}
        initialSpacing={0}
        hideDataPoints
        hideRules
        xAxisColor={Colors.border}
        yAxisColor="transparent"
        yAxisTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
        noOfSections={3}
        maxValue={maxVal * 1.2}
        curved
        isAnimated
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', overflow: 'hidden' },
});
