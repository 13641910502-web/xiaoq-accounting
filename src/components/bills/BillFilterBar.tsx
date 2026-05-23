import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants';
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
      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContent}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, activeFilter.categories.includes(cat.name) && styles.chipActive]}
            onPress={() => toggleCategory(cat.name)}
          >
            <Text style={styles.chipIcon}>{cat.icon}</Text>
            <Text style={[styles.chipText, activeFilter.categories.includes(cat.name) && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Actions Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, activeFilter.dateRange && styles.actionBtnActive]}
          onPress={() => setShowDateSheet(true)}
        >
          <Ionicons name="calendar-outline" size={16} color={activeFilter.dateRange ? Colors.primary : Colors.textSecondary} />
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
            placeholderTextColor={Colors.textTertiary}
          />
          <Text style={styles.amountSep}>-</Text>
          <TextInput
            style={styles.amountInput}
            value={activeFilter.amountMax}
            onChangeText={v => onFilterChange({ ...activeFilter, amountMax: v })}
            placeholder="最高"
            keyboardType="decimal-pad"
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        {hasActiveFilter && (
          <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
            <Ionicons name="close-circle" size={16} color={Colors.error} />
            <Text style={styles.clearText}>重置</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Date Preset Modal */}
      <Modal visible={showDateSheet} transparent animationType="slide" onRequestClose={() => setShowDateSheet(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDateSheet(false)}>
          <View style={styles.dateSheet}>
            <Text style={styles.sheetTitle}>选择日期范围</Text>
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
              <Text style={[styles.dateOptionText, { color: Colors.error }]}>清除日期筛选</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.surface, paddingBottom: Spacing.sm },
  chipScroll: { maxHeight: 44 },
  chipContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipIcon: { fontSize: 13 },
  chipText: { ...Typography.caption, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  actionBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  actionText: { ...Typography.caption, color: Colors.textSecondary },
  actionTextActive: { color: Colors.primary, fontWeight: '600' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  amountInput: {
    flex: 1,
    ...Typography.caption,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    textAlign: 'center',
  },
  amountSep: { ...Typography.caption, color: Colors.textTertiary },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  clearText: { ...Typography.caption, color: Colors.error },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  dateSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  sheetTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.lg },
  dateOption: { paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  dateOptionText: { ...Typography.body, color: Colors.text },
});
