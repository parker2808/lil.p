'use client';

import {
  createTreeHistory,
  DraftAutosave,
  endTreeTyping,
  redoTreeHistory,
  undoTreeHistory,
  type AutosaveState,
  type BuilderDraftSnapshot,
  type TreeDocument,
  type TreeHistory,
  type TreeOperation,
} from '@parker2808/cms-core/tree';
import { Button } from '@portfolio/ui/components/ui/button';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { useMe } from '@/modules/admin-core/hooks/use-me.hook';
import { BLOCK_EDITOR_META } from '../constants/block-editor-meta.constant';
import { BuilderShell, builderNodeLabels } from './BuilderShell';
import type { PropertyDraft } from './properties/PropertiesPanel';
import { BuilderVersionActions } from './BuilderVersionActions';
import {
  activateBuilderDraft,
  readBuilderDraft,
  readActiveBuilderDraft,
  publishBuilderDraft,
  restoreBuilderVersion,
  saveBuilderDraft,
} from './autosave/transport';
import { clearRecovery, readRecovery, recoveryKey, writeRecovery } from './autosave/recovery';
import type { BuilderCommand } from './canvas/commands';
import type { CompositionResult } from './canvas/model';
import { commitComposition, commitProperty } from './history/adapter';
import { PropertiesPanel } from './properties/PropertiesPanel';
import { builderRegistry } from './properties/registry';
import styles from './builder.module.css';

const empty: TreeDocument = {
  schemaVersion: 1,
  root: { id: 'page', type: 'page', responsive: { base: {} }, sections: [] },
};

const labels = {
  en: {
    undo: 'Undo',
    redo: 'Redo',
    local: 'Local study · not saved',
    loading: 'Loading draft',
    legacy: 'Local study · activate to save',
    legacyConflict: 'Server draft was restored · your edits are kept locally',
    activate: 'Activate tree draft',
    saving: 'Saving draft',
    saved: 'Draft saved',
    dirty: 'Unsaved changes',
    offline: 'Offline · your edits are kept locally',
    conflict: 'Conflict · your edits are kept locally',
    review: 'Save uncertain · your edits are kept locally',
    retry: 'Retry',
    reviewChanges: 'Review changes',
    keepLocal: 'Keep local edits',
    reload: 'Discard local edits and reload server draft',
    export: 'Export local draft',
    restore: 'Restore local edits',
    dismiss: 'Dismiss recovery',
    recoveryFailed: 'Local recovery is unavailable. Stay on this page or export your edits.',
    noAccess: 'Draft unavailable · editing locally only',
    versionFailed: 'Version action uncertain · check the server draft before editing again',
    versionConflict: 'Server draft changed · reload before trying again',
    versionInvalid: 'Invalid draft · fix the content before publishing or restoring',
    published: 'Published · draft is ready for further edits',
    publishedReview: 'Published · draft reload is required before further edits',
    restored: 'Version restored to draft · publish separately to make it public',
  },
  vi: {
    undo: 'Hoàn tác',
    redo: 'Làm lại',
    local: 'Bản mẫu cục bộ · chưa lưu',
    loading: 'Đang tải bản nháp',
    legacy: 'Bản mẫu cục bộ · kích hoạt để lưu',
    legacyConflict: 'Bản nháp máy chủ đã được khôi phục · thay đổi của bạn vẫn được giữ cục bộ',
    activate: 'Kích hoạt bản nháp cây',
    saving: 'Đang lưu bản nháp',
    saved: 'Đã lưu bản nháp',
    dirty: 'Có thay đổi chưa lưu',
    offline: 'Ngoại tuyến · thay đổi của bạn được giữ cục bộ',
    conflict: 'Xung đột · thay đổi của bạn được giữ cục bộ',
    review: 'Chưa rõ trạng thái lưu · thay đổi của bạn được giữ cục bộ',
    retry: 'Thử lại',
    reviewChanges: 'Xem thay đổi',
    keepLocal: 'Giữ thay đổi cục bộ',
    reload: 'Bỏ thay đổi cục bộ và tải lại bản nháp máy chủ',
    export: 'Xuất bản nháp cục bộ',
    restore: 'Khôi phục thay đổi cục bộ',
    dismiss: 'Bỏ qua bản khôi phục',
    recoveryFailed: 'Không thể khôi phục cục bộ. Hãy ở lại trang hoặc xuất các thay đổi.',
    noAccess: 'Không thể tải bản nháp · chỉ chỉnh sửa cục bộ',
    versionFailed: 'Chưa rõ kết quả thao tác · kiểm tra bản nháp máy chủ trước khi chỉnh sửa tiếp',
    versionConflict: 'Bản nháp máy chủ đã thay đổi · tải lại trước khi thử lại',
    versionInvalid: 'Bản nháp không hợp lệ · sửa nội dung trước khi xuất bản hoặc khôi phục',
    published: 'Đã xuất bản · bản nháp sẵn sàng để chỉnh sửa tiếp',
    publishedReview: 'Đã xuất bản · cần tải lại bản nháp trước khi chỉnh sửa tiếp',
    restored: 'Đã khôi phục vào bản nháp · xuất bản riêng để cập nhật trang công khai',
  },
} as const;

function editableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      !!target.closest('input, textarea, select, [contenteditable="true"]'))
  );
}
function subscribeOnline(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

const canonicalTree = (tree: TreeDocument) =>
  JSON.stringify(tree, (_key, value: unknown) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
        )
      : value,
  );

export function BuilderHost({ pageKey }: { pageKey: string }) {
  const locale = useLocale() === 'vi' ? 'vi' : 'en';
  const translate = useTranslations();
  const componentLabels = {
    ...builderNodeLabels(locale),
    ...Object.fromEntries(
      Object.entries(BLOCK_EDITOR_META).map(([type, meta]) => [type, translate(meta.labelKey)]),
    ),
  };
  const text = labels[locale];
  const { id: userId, role } = useMe();
  const key = recoveryKey(userId, pageKey);
  const history = useRef<TreeHistory>(createTreeHistory(empty, 'page'));
  const [propertyDrafts] = useState(() => new Map<string, PropertyDraft>());
  const [state, setState] = useState({ document: empty, selectedId: 'page' });
  const [historySize, setHistorySize] = useState({ past: 0, future: 0 });
  const [mode, setMode] = useState<'local' | 'loading' | 'legacy' | 'active' | 'unavailable'>(
    pageKey === 'home' ? 'local' : 'loading',
  );
  const [status, setStatus] = useState<AutosaveState['status']>('saved');
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
  const [recovery, setRecovery] = useState<TreeDocument | undefined>();
  const recoveryBaseline = useRef<TreeDocument>(empty);
  const [recoveryFailed, setRecoveryFailed] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [remoteAvailable, setRemoteAvailable] = useState(false);
  const autosave = useRef<DraftAutosave | null>(null);
  const [versionPending, setVersionPending] = useState(false);
  const [versionBlocked, setVersionBlocked] = useState(false);
  const [versionMessage, setVersionMessage] = useState<string | null>(null);
  const versionInFlight = useRef(false);

  const createAutosave = useCallback(
    (draft: BuilderDraftSnapshot) =>
      new DraftAutosave(
        draft,
        {
          save: ({ tree, expectedRevision }) => saveBuilderDraft(pageKey, tree, expectedRevision),
          read: () => readActiveBuilderDraft(pageKey),
        },
        {
          schedule: (callback, delay) => setTimeout(callback, delay),
          cancel: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
        },
        builderRegistry,
      ),
    [pageKey],
  );

  const present = useCallback((next: TreeHistory) => {
    history.current = next;
    setState({ document: next.document, selectedId: next.selectedId ?? 'page' });
    setHistorySize({ past: next.past.length, future: next.future.length });
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (pageKey === 'home') return;
    void readBuilderDraft(pageKey)
      .then((draft) => {
        if (cancelled) return;
        if (draft.mode === 'tree' && draft.tree) {
          present(createTreeHistory(draft.tree, 'page'));
          autosave.current = createAutosave({ tree: draft.tree, revision: draft.revision });
          setMode('active');
        } else setMode('legacy');
        recoveryBaseline.current = history.current.document;
        const stored = readRecovery(key);
        if (stored && JSON.stringify(stored) !== JSON.stringify(draft.tree)) setRecovery(stored);
      })
      .catch(() => {
        if (cancelled) return;
        recoveryBaseline.current = history.current.document;
        setRecovery(readRecovery(key));
        setMode('unavailable');
      });
    return () => {
      cancelled = true;
      autosave.current?.dispose();
      autosave.current = null;
    };
  }, [createAutosave, key, pageKey, present]);

  useEffect(() => {
    if (mode !== 'active') return;
    const interval = window.setInterval(() => {
      const snapshot = autosave.current?.state;
      if (!snapshot) return;
      setStatus(snapshot.status);
      if (
        !recovery &&
        snapshot.status === 'saved' &&
        JSON.stringify(snapshot.local) === JSON.stringify(history.current.document)
      ) {
        clearRecovery(key);
        setRecoveryFailed(false);
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [key, mode, recovery]);

  const changed = useCallback(
    (next: TreeHistory) => {
      present(next);
      setVersionMessage(null);
      if (pageKey !== 'home') {
        setRecoveryFailed(recovery ? true : !writeRecovery(key, next.document));
        autosave.current?.edit(next.document);
        setStatus(autosave.current?.state.status ?? 'dirty');
      }
    },
    [key, pageKey, present, recovery],
  );

  useEffect(() => {
    if (!recoveryFailed || status === 'saved') return;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [recoveryFailed, status]);

  const onDispatch = useCallback(
    (command: BuilderCommand): CompositionResult => {
      if ((versionInFlight.current || versionBlocked) && command.type !== 'select')
        return { ok: false, document: history.current.document, reason: 'INVALID_TREE' };
      const update = commitComposition(history.current, command);
      if (update.result.ok) {
        if (command.type === 'select') present(update.history);
        else if (update.history !== history.current) changed(update.history);
      }
      return update.result;
    },
    [changed, present, versionBlocked],
  );

  const onEdit = useCallback(
    (operation: TreeOperation, typing?: boolean) => {
      if (versionInFlight.current || versionBlocked) return 'INVALID_TREE';
      const update = commitProperty(history.current, operation, typing);
      if (!update.error && update.history !== history.current) changed(update.history);
      return update.error;
    },
    [changed, versionBlocked],
  );

  const onEndTyping = useCallback(() => {
    history.current = endTreeTyping(history.current);
  }, []);

  const travel = useCallback(
    (direction: 'undo' | 'redo') => {
      if (versionInFlight.current || versionBlocked) return;
      const next =
        direction === 'undo' ? undoTreeHistory(history.current) : redoTreeHistory(history.current);
      if (next !== history.current) changed(next);
    },
    [changed, versionBlocked],
  );

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || editableTarget(event.target)) return;
      const keyName = event.key.toLowerCase();
      if (keyName === 'z' || keyName === 'y') {
        event.preventDefault();
        travel(keyName === 'y' || event.shiftKey ? 'redo' : 'undo');
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [travel]);

  async function activate() {
    try {
      const remote = await readBuilderDraft(pageKey);
      if (remote.mode !== 'legacy') {
        setMode('unavailable');
        return;
      }
      const submitted = history.current.document;
      const draft = await activateBuilderDraft(pageKey, submitted, remote.revision);
      autosave.current = createAutosave(draft);
      if (JSON.stringify(history.current.document) !== JSON.stringify(draft.tree)) {
        autosave.current.edit(history.current.document);
        if (!recovery) setRecoveryFailed(!writeRecovery(key, history.current.document));
      } else if (!recovery) {
        clearRecovery(key);
        setRecoveryFailed(false);
      }
      setStatus(autosave.current.state.status);
      setMode('active');
    } catch {
      setMode('unavailable');
    }
  }

  async function review() {
    setReviewOpen(true);
    const remote = await autosave.current?.review();
    setRemoteAvailable(Boolean(remote?.tree));
    setStatus(autosave.current?.state.status ?? 'review');
  }

  async function retry() {
    const controller = autosave.current;
    if (!controller) return;
    const remote = await controller.review();
    setRemoteAvailable(Boolean(remote?.tree));
    if (remote && controller.resolveReviewed('acknowledge')) {
      controller.edit(history.current.document);
    }
    setStatus(controller.state.status);
    setReviewOpen(['conflict', 'review', 'legacy'].includes(controller.state.status));
  }

  function exportLocal() {
    const blob = new Blob([JSON.stringify(history.current.document, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `builder-${pageKey}-local.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function reload() {
    const controller = autosave.current;
    if (
      !controller?.state.remote?.tree ||
      !controller.resolveReviewed('reload', { discardLocalEdits: true })
    )
      return;
    present(createTreeHistory(controller.state.local, 'page'));
    clearRecovery(key);
    setStatus('saved');
    setReviewOpen(false);
    setRemoteAvailable(false);
  }

  const canChangeVersion =
    role === 'admin' &&
    mode === 'active' &&
    online &&
    status === 'saved' &&
    !recovery &&
    !recoveryFailed &&
    !versionPending &&
    !versionBlocked;

  async function verifiedRevision() {
    const controller = autosave.current;
    if (!controller) throw new Error('No active draft');
    await controller.flush();
    const snapshot = controller.state;
    if (
      snapshot.status !== 'saved' ||
      canonicalTree(snapshot.local) !== canonicalTree(history.current.document) ||
      canonicalTree(snapshot.acknowledged.tree) !== canonicalTree(snapshot.local)
    )
      throw new Error('Unsaved draft');
    const remote = await readBuilderDraft(pageKey);
    if (
      remote.mode !== 'tree' ||
      !remote.tree ||
      remote.revision !== snapshot.acknowledged.revision ||
      canonicalTree(remote.tree) !== canonicalTree(snapshot.local)
    )
      throw new Error('Server draft changed');
    return snapshot.acknowledged.revision;
  }

  async function changeVersion(action: 'publish' | 'restore', version?: number): Promise<boolean> {
    if (!canChangeVersion || versionInFlight.current) return false;
    versionInFlight.current = true;
    setVersionPending(true);
    setVersionMessage(null);
    let published = false;
    try {
      const revision = await verifiedRevision();
      if (action === 'publish') {
        await publishBuilderDraft(pageKey, revision);
        published = true;
        const remote = await readBuilderDraft(pageKey);
        if (
          remote.mode !== 'tree' ||
          !remote.tree ||
          !/^(0|[1-9]\d*)$/.test(remote.revision) ||
          BigInt(remote.revision) <= BigInt(revision) ||
          canonicalTree(remote.tree) !== canonicalTree(history.current.document)
        )
          throw new Error('Published draft needs review');
        autosave.current?.dispose();
        autosave.current = createAutosave({ tree: remote.tree, revision: remote.revision });
        setStatus('saved');
        setVersionMessage(text.published);
      } else if (version !== undefined) {
        const restored = await restoreBuilderVersion(pageKey, version, revision);
        if (
          !/^(0|[1-9]\d*)$/.test(restored.revision) ||
          BigInt(restored.revision) <= BigInt(revision)
        )
          throw new Error('Restored draft needs review');
        if (restored.mode === 'tree' && restored.tree) {
          const next = createAutosave({ tree: restored.tree, revision: restored.revision });
          autosave.current?.dispose();
          autosave.current = next;
          present(createTreeHistory(restored.tree, 'page'));
          setStatus('saved');
        } else if (restored.mode === 'legacy' && restored.tree === null) {
          autosave.current?.dispose();
          autosave.current = null;
          present(createTreeHistory(empty, 'page'));
          setMode('legacy');
        } else throw new Error('Invalid restored draft');
        clearRecovery(key);
        setRecoveryFailed(false);
        setVersionMessage(text.restored);
      }
      return true;
    } catch (error) {
      const errorStatus = (error as { status?: number }).status;
      if (published || errorStatus !== 400) setVersionBlocked(true);
      setVersionMessage(
        published
          ? text.publishedReview
          : errorStatus === 400
            ? text.versionInvalid
            : errorStatus === 409
              ? text.versionConflict
              : text.versionFailed,
      );
      return false;
    } finally {
      versionInFlight.current = false;
      setVersionPending(false);
    }
  }

  const shownStatus =
    mode === 'local'
      ? text.local
      : mode === 'loading'
        ? text.loading
        : mode === 'legacy'
          ? text.legacy
          : mode === 'unavailable'
            ? text.noAccess
            : !online && status !== 'saved'
              ? text.offline
              : text[
                  status === 'invalid' ? 'review' : status === 'legacy' ? 'legacyConflict' : status
                ];

  if (mode === 'loading')
    return (
      <div className={styles.loading} role="status">
        {text.loading}
      </div>
    );

  return (
    <div className={styles.host}>
      <BuilderShell
        componentLabels={componentLabels}
        pageKey={pageKey}
        state={state}
        onDispatch={onDispatch}
        status={versionMessage ?? shownStatus}
        versionPending={versionPending || versionBlocked}
        versionControls={
          pageKey !== 'home' ? (
            <BuilderVersionActions
              pageKey={pageKey}
              locale={locale}
              isAdmin={role === 'admin'}
              canPublish={canChangeVersion}
              canRestore={canChangeVersion}
              pending={versionPending}
              restoreError={versionMessage}
              onPublish={() => changeVersion('publish')}
              onRestore={(version) => changeVersion('restore', version)}
            />
          ) : undefined
        }
        historyControls={
          <div className={styles.hostActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => travel('undo')}
              disabled={!historySize.past}
              aria-label={text.undo}
            >
              {text.undo}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => travel('redo')}
              disabled={!historySize.future}
              aria-label={text.redo}
            >
              {text.redo}
            </Button>
            {mode === 'legacy' && (
              <Button type="button" onClick={() => void activate()}>
                {text.activate}
              </Button>
            )}
            {mode === 'active' && ['review', 'conflict', 'invalid', 'legacy'].includes(status) && (
              <>
                <Button type="button" variant="outline" onClick={() => void retry()}>
                  {text.retry}
                </Button>
                <Button type="button" variant="outline" onClick={() => void review()}>
                  {text.reviewChanges}
                </Button>
              </>
            )}
          </div>
        }
        renderProperties={() => (
          <PropertiesPanel
            state={state}
            locale={locale}
            onEdit={onEdit}
            onEndTyping={onEndTyping}
            pageKey={pageKey}
            propertyDrafts={propertyDrafts}
            componentLabels={componentLabels}
          />
        )}
      />
      {recovery && (
        <div role="region" aria-label={text.restore} className={styles.recovery}>
          <p>{text.dirty}</p>
          <Button
            type="button"
            onClick={() => {
              changed(createTreeHistory(recovery, 'page'));
              setRecoveryFailed(!writeRecovery(key, recovery));
              setRecovery(undefined);
            }}
          >
            {text.restore}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRecovery(undefined);
              if (
                JSON.stringify(history.current.document) ===
                JSON.stringify(recoveryBaseline.current)
              ) {
                clearRecovery(key);
                setRecoveryFailed(false);
              } else setRecoveryFailed(!writeRecovery(key, history.current.document));
            }}
          >
            {text.dismiss}
          </Button>
        </div>
      )}
      {recoveryFailed && status !== 'saved' && (
        <div role="alert" className={styles.recovery}>
          <p>{text.recoveryFailed}</p>
          <Button type="button" onClick={exportLocal}>
            {text.export}
          </Button>
        </div>
      )}
      {reviewOpen && (
        <div role="region" aria-label={text.reviewChanges} className={styles.recovery}>
          <p>{shownStatus}</p>
          <Button type="button" variant="outline" onClick={() => setReviewOpen(false)}>
            {text.keepLocal}
          </Button>
          <Button type="button" onClick={exportLocal}>
            {text.export}
          </Button>
          <Button type="button" variant="outline" disabled={!remoteAvailable} onClick={reload}>
            {text.reload}
          </Button>
          <Button type="button" variant="outline" onClick={() => void retry()}>
            {text.retry}
          </Button>
        </div>
      )}
    </div>
  );
}
