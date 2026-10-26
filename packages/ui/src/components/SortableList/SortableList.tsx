'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { Button } from '../ui/button';
import { applySortableReorder } from './sortable-reorder.util';

export type SortableListLabels = {
  handle: string;
  instructions: string;
  pickedUp: string;
  movedOver: string;
  dropped: string;
  cancelled: string;
};

export type SortableItem = {
  id: string;
  disabled?: boolean;
};

function announce(template: string, activeId: string, overId?: string) {
  return template.replaceAll('{id}', activeId).replaceAll('{over}', overId ?? '');
}

export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  disabled,
  labels,
  children,
  overlay,
}: {
  items: T[];
  onReorder: (ids: string[]) => void;
  disabled?: boolean;
  labels: SortableListLabels;
  children: (item: T, handle: ReactNode) => ReactNode;
  overlay?: (item: T) => ReactNode;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map((item) => item.id);
  const locked = new Set(items.filter((item) => item.disabled).map((item) => item.id));
  const active = items.find((item) => item.id === activeId);

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const overId = event.over?.id;
    if (overId == null) {
      return;
    }
    const next = applySortableReorder(ids, String(event.active.id), String(overId), locked);
    if (next) {
      onReorder(next);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        announcements: {
          onDragStart({ active: current }) {
            return announce(labels.pickedUp, String(current.id));
          },
          onDragOver({ active: current, over }) {
            return over
              ? announce(labels.movedOver, String(current.id), String(over.id))
              : undefined;
          },
          onDragEnd({ active: current, over }) {
            return over ? announce(labels.dropped, String(current.id), String(over.id)) : undefined;
          },
          onDragCancel({ active: current }) {
            return announce(labels.cancelled, String(current.id));
          },
        },
        screenReaderInstructions: { draggable: labels.instructions },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy} disabled={disabled}>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <SortableRow
              key={item.id}
              id={item.id}
              disabled={Boolean(disabled || item.disabled)}
              handleLabel={labels.handle}
            >
              {(handle) => children(item, handle)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
      <DragOverlay>
        {active ? (
          <div className="bg-muted shadow-2 rounded-md p-2">
            {overlay ? overlay(active) : active.id}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableRow({
  id,
  disabled,
  handleLabel,
  children,
}: {
  id: string;
  disabled: boolean;
  handleLabel: string;
  children: (handle: ReactNode) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'opacity-50' : undefined}
    >
      {children(
        disabled ? null : (
          <Button
            ref={setActivatorNodeRef}
            type="button"
            size="sm"
            variant="ghost"
            aria-label={handleLabel}
            className="cursor-grab"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </Button>
        ),
      )}
    </li>
  );
}
