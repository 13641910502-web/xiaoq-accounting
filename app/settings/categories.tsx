import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { Colors, Typography, Spacing } from '../../src/constants';
import type { Category } from '../../src/types/category';

export default function CategoriesScreen() {
  const { mainCategories, subCategories, loadCategories, loadSubCategories, removeCategory } = useCategoryStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      loadSubCategories(id);
      setExpandedId(id);
    }
  };

  const handleDelete = (cat: Category) => {
    if (cat.is_system) {
      Alert.alert('提示', '系统默认分类不可删除');
      return;
    }
    Alert.alert('删除分类', `确定要删除"${cat.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => removeCategory(cat.id) },
    ]);
  };

  const renderCategory = (cat: Category) => {
    const isExpanded = expandedId === cat.id;
    const subs = subCategories[cat.id] ?? [];

    return (
      <View key={cat.id}>
        <TouchableOpacity
          style={styles.categoryItem}
          onPress={() => cat.type === 'main' ? toggleExpand(cat.id) : null}
          onLongPress={() => handleDelete(cat)}
        >
          <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
          <Text style={styles.catIcon}>{cat.icon}</Text>
          <Text style={styles.catName}>{cat.name}</Text>
          {cat.type === 'main' && (
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          )}
          {cat.is_system === 1 && <Text style={styles.systemBadge}>系统</Text>}
        </TouchableOpacity>

        {isExpanded && subs.map(sub => (
          <TouchableOpacity
            key={sub.id}
            style={styles.subItem}
            onLongPress={() => handleDelete(sub)}
          >
            <Text style={styles.subIcon}>{sub.icon}</Text>
            <Text style={styles.subName}>{sub.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mainCategories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => renderCategory(item)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.headerText}>长按分类可删除 (系统分类不可删)</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md },
  headerText: { ...Typography.caption, color: Colors.textTertiary, textAlign: 'center', paddingBottom: Spacing.md },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 10,
    marginBottom: Spacing.xs,
  },
  colorDot: { width: 4, height: 28, borderRadius: 2, marginRight: Spacing.sm },
  catIcon: { fontSize: 20, marginRight: Spacing.sm },
  catName: { ...Typography.body, color: Colors.text, flex: 1 },
  expandIcon: { ...Typography.caption, color: Colors.textTertiary },
  systemBadge: {
    ...Typography.caption,
    color: Colors.textTertiary,
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: Spacing.sm,
    overflow: 'hidden',
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  subIcon: { fontSize: 16, marginRight: Spacing.sm },
  subName: { ...Typography.bodySmall, color: Colors.textSecondary },
});
