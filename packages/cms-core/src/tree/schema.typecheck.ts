import type { ColumnNode, ComponentNode, GridNode, PageNode, RowNode, SectionNode } from './schema';

type Rejects<Actual, Expected> = [Actual] extends [Expected] ? false : true;
type Assert<Condition extends true> = Condition;

export type PageRejectsComponent = Assert<Rejects<ComponentNode, PageNode['sections'][number]>>;
export type SectionRejectsColumn = Assert<Rejects<ColumnNode, SectionNode['content'][number]>>;
export type RowRejectsGrid = Assert<Rejects<GridNode, RowNode['columns'][number]>>;
export type ColumnRejectsGrid = Assert<Rejects<GridNode, ColumnNode['content'][number]>>;
export type GridRejectsRow = Assert<Rejects<RowNode, GridNode['items'][number]>>;
export type ComponentRejectsExtraSlot = Assert<
  Rejects<Omit<ComponentNode, 'sections'> & { sections: SectionNode[] }, ComponentNode>
>;
