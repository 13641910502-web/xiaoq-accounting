import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderWidth } from '../../constants';
import type { Category } from '../../types/category';

interface FilterState {
  categories: string[];
  dateRange: { start: string; end: string } | null;
  amountMin: string;
  amountMax: string;
}

interface Props {
  categories: Category[];
  activeFilter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  onClear: () => void;
}

const DATE_PRESETS = [
  { label: '本周', get: () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    return { start: start.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) };
  }},
  { label: '本月', get: () => {
    const now = new Date();
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return { start, end: now.toISOString().slice(0, 10) };
  }},
  { label: '近3月', get: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return { start: start.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) };
  }},
  { label: '今年', get: () => {
    const now = new Date();
    return { start: `${now.getFullYear()}-01-01`, end: now.toISOString().slice(0, 10) };
  }},
];

export function BillFilterBar({ categories, activeFilter, onFilterChange, onClear }: Props) {
  const [showDateSheet, setShowDateSheet] = useState(false);
  const hasActiveFilter = activeFilter.categories.length > 0 || activeFilter.dateRange !== null || activeFilter.amountMin !== '' || activeFilter.amountMax !== '';

  const toggleCategory = (name: string) => {
    const next = activeFilter.categories.includes(name)
      ? activeFilter.categories.filter(c => c !== name)
      : [...activeFilter.categories, name];
    onFilterChange({ ...activeFilter, categories: next });
  };

  const applyDatePreset = (get: () => { start: string; end: string }) => {
    onFilterChange({ ...activeFilter, dateRange: get() });
    setShowDateSheet(false);
  };

  return (
    <View style={styles.container}>
      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContent}
      >
        {categories.map(cat => {
          const active = activeFilter.categories.includes(cat.name);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleCategory(cat.name)}
            >
              <View style={[styles.chipDot, { backgroundColor: cat.color }]} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Action row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, activeFilter.dateRange && styles.actionBtnActive]}
          onPress={() => setShowDateSheet(true)}
        >
          <Ionicons name="calendar-outline" size={14} color={activeFilter.dateRange ? Colors.white : Colors.black} />
          <Text style={[styles.actionText, activeFilter.dateRange && styles.actionTextActive]}>
            {activeFilter.dateRange ? `${activeFilter.dateRange.start.slice(5)}~${activeFilter.dateRange.end.slice(5)}` : '日期'}
          </Text>
        </TouchableOpacity>

        <View style={styles.amountRow}>
          <TextInput
            style={styles.amountInput}
            value={activeFilter.amountMin}
            onChangeText={v => onFilterChange({ ...activeFilter, amountMin: v })}
            placeholder="最低"
            keyboardType="decimal-pad"
            placeholderTextColor={Colors.midGray}
          />
          <Text style={styles.amountSep}>-</Text>
          <TextInput
            style={styles.amountInput}
            value={activeFilter.amountMax}
            onChangeText={v => onFilterChange({ ...activeFilter, amountMax: v })}
            placeholder="最高"
            keyboardType="decimal-pad"
            placeholderTextColor={Colors.midGray}
          />
        </View>

        {hasActiveFilter && (
          <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
            <Text style={styles.clearText}>重置</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Date preset modal */}
      <Modal visible={showDateSheet} transparent animationType="slide" onRequestClose={() => setShowDateSheet(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDateSheet(false)}>
          <View style={styles.dateSheet}>
            <Text style={styles.sheetTitle}>选择日期</Text>
            {DATE_PRESETS.map(p => (
              <TouchableOpacity key={p.label} style={styles.dateOption} onPress={() => applyDatePreset(p.get)}>
                <Text style={styles.dateOptionText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => {
                onFilterChange({ ...activeFilter, dateRange: null });
                setShowDateSheet(false);
              }}
            >
              <Text style={[styles.dateOptionText, { color: Colors.red }]}>清除筛选</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.background, paddingBottom: Spacing.sm },
  chipScroll: { maxHeight: 42 },
  chipContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderWidth: BorderWidth.normal,
    borderColor: Colors.black,
    gap: 4,
  },
  chipActive: { backgroundColor: Colors.black },
  chipDot: { width: 6, height: 6 },
  chipText: { ...Typography.caption, color: Colors.black },
  chipTextActive: { color: Colors.white },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderWidth: BorderWidth.normal,
    borderColor: Colors.black,
    gap: 4,
  },
  actionBtnActive: { backgroundColor: Colors.black },
  actionText: { ...Typography.caption, color: Colors.black },
  actionTextActive: { color: Colors.white },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  amountInput: {
    flex: 1,
    ...Typography.caption,
    color: Colors.black,
    borderWidth: BorderWidth.normal,
    borderColor: Colors.black,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    textAlign: 'center',
  },
  amountSep: { ...Typography.caption, color: Colors.black },
  clearBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderWidth: BorderWidth.normal,
    borderColor: Colors.red,
  },
  clearText: { ...Typography.caption, color: Colors.red },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  dateSheet: {
    backgroundColor: Colors.surface,
    borderTopWidth: BorderWidth.heavy,
    borderTopColor: Colors.black,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  sheetTitle: { ...Typography.h3, color: Colors.black, marginBottom: Spacing.lg },
  dateOption: {
    paddingVertical: Spacing.md,
    borderBottomWidth: BorderWidth.thin,
    borderBottomColor: Colors.lightGray,
  },
  dateOptionText: { ...Typography.body, color: Colors.black },
});
