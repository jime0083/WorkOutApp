/**
 * セキュリティユーティリティ（Web）
 * テキスト選択防止、右クリック防止、キーボードショートカット防止
 */

/**
 * セキュリティ機能を初期化
 */
export function initializeSecurity(): () => void {
  // 右クリック防止
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // キーボードショートカット防止
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + S (保存)
    // Ctrl/Cmd + C (コピー) - メッセージ内でのコピーは許可しない
    // Ctrl/Cmd + A (全選択)
    // Ctrl/Cmd + P (印刷)
    // Ctrl/Cmd + Shift + I (開発者ツール)
    // F12 (開発者ツール)
    // Ctrl/Cmd + U (ソース表示)

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    if (isCtrlOrCmd) {
      const blockedKeys = ['s', 'c', 'a', 'p', 'u'];
      if (blockedKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + Shift + I (開発者ツール)
      if (e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        return false;
      }
    }

    // F12 (開発者ツール)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // PrintScreen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      // 画面を一時的に非表示にする
      document.body.style.visibility = 'hidden';
      setTimeout(() => {
        document.body.style.visibility = 'visible';
      }, 100);
      return false;
    }

    return true;
  };

  // ドラッグ防止
  const handleDragStart = (e: DragEvent) => {
    e.preventDefault();
    return false;
  };

  // 選択防止
  const handleSelectStart = (e: Event) => {
    // 入力フィールド内での選択は許可
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return true;
    }
    e.preventDefault();
    return false;
  };

  // コピー防止
  const handleCopy = (e: ClipboardEvent) => {
    // 入力フィールド内でのコピーは許可
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return true;
    }
    e.preventDefault();
    return false;
  };

  // イベントリスナーを追加
  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('dragstart', handleDragStart);
  document.addEventListener('selectstart', handleSelectStart);
  document.addEventListener('copy', handleCopy);

  console.log('Web security initialized');

  // クリーンアップ関数を返す
  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('dragstart', handleDragStart);
    document.removeEventListener('selectstart', handleSelectStart);
    document.removeEventListener('copy', handleCopy);
    console.log('Web security cleaned up');
  };
}

/**
 * 開発者ツール検出（デバッグ用）
 * 注意: 完全な防止は不可能
 */
export function detectDevTools(): boolean {
  const threshold = 160;
  const widthThreshold =
    window.outerWidth - window.innerWidth > threshold;
  const heightThreshold =
    window.outerHeight - window.innerHeight > threshold;

  return widthThreshold || heightThreshold;
}

/**
 * コンソール出力を無効化（本番環境用）
 */
export function disableConsole(): void {
  if (import.meta.env.PROD) {
    const noop = () => {};
    console.log = noop;
    console.warn = noop;
    console.error = noop;
    console.info = noop;
    console.debug = noop;
  }
}
