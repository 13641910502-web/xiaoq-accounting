import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../src/constants';
import type { ClassificationRule } from '../../src/types/classification';

export default function RulesScreen() {
  const [rules, setRules] = useState<ClassificationRule[]>([]);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    try {
      const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
      const data = db.getAllSync<ClassificationRule>(
        'SELECT * FROM classification_rules ORDER BY priority DESC, match_count DESC'
      );
      setRules(data);
    } catch { /* db not ready */ }
  };

  const handleDelete = (rule: ClassificationRule) => {
    Alert.alert('删除规则', `确定要删除规则"${rule.pattern}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          try {
            const db = SQLite.openDatabaseSync('xiaoq_accounting.db');
            db.runSync('DELETE FROM classification_rules WHERE id = ?', [rule.id]);
            loadRules();
          } catch { /* ignore */ }
        },
      },
    ]);
  };

  const renderRule = ({ item }: { item: ClassificationRule }) => (
    <TouchableOpacity style={styles.ruleItem} onLongPress={() => handleDelete(item)}>
      <View style={styles.ruleLeft}>
        <Text style={styles.rulePattern}>{item.pattern}</Text>
        <Text style={styles.ruleTarget}>
          → {item.main_category}{item.sub_category ? ` > ${item.sub_category}` : ''}
        </Text>
      </View>
      <View style={styles.ruleRight}>
        <Text style={styles.ruleCount}>{item.match_count}次</Text>
        <Text style={styles.rulePriority}>P{item.priority}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rules}
        keyExtractor={item => item.id}
        renderItem={renderRule}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.headerText}>共 {rules.length} 条规则 · 长按可删除</Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="git-branch-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>暂无规则</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md },
  headerText: { ...Typography.caption, color: Colors.textTertiary, textAlign: 'center', paddingBottom: Spacing.md },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.xs,
  },
  ruleLeft: { flex: 1 },
  rulePattern: { ...Typography.bodySmall, color: Colors.text, fontWeight: '500' },
  ruleTarget: { ...Typography.caption, color: Colors.primary, marginTop: 2 },
  ruleRight: { alignItems: 'flex-end', gap: 2 },
  ruleCount: { ...Typography.caption, color: Colors.textSecondary },
  rulePriority: { ...Typography.caption, color: Colors.textTertiary, fontSize: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl },
  emptyText: { ...Typography.body, color: Colors.textTertiary, marginTop: Spacing.md },
});
