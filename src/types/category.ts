export interface Category {
  id: string;
  name: string;
  type: 'main' | 'sub';
  parent_id: string | null;
  icon: string;
  color: string;
  sort_order: number;
  is_system: number;
  is_active: number;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}
