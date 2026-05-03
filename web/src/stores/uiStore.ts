/**
 * UI状態管理ストア
 */
import { create } from 'zustand';

// モーダルの種類
export type ModalType =
  | 'confirm'
  | 'alert'
  | 'imagePreview'
  | 'videoPlayer'
  | 'profileEdit'
  | 'settings'
  | null;

// モーダルオプション
export interface ModalOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  imageUrl?: string;
  videoUrl?: string;
}

// トーストの種類
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// トースト
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// UI状態
interface UIState {
  // モーダル
  activeModal: ModalType;
  modalOptions: ModalOptions;

  // トースト
  toasts: Toast[];

  // ローディング
  isGlobalLoading: boolean;
  loadingMessage: string | null;

  // サイドバー（PC用）
  isSidebarOpen: boolean;

  // キーボード表示状態
  isKeyboardVisible: boolean;
}

// UIアクション
interface UIActions {
  // モーダル
  openModal: (type: ModalType, options?: ModalOptions) => void;
  closeModal: () => void;

  // トースト
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;

  // ローディング
  setGlobalLoading: (loading: boolean, message?: string) => void;

  // サイドバー
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // キーボード
  setKeyboardVisible: (visible: boolean) => void;
}

// ユニークID生成
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// ストア作成
export const useUIStore = create<UIState & UIActions>((set) => ({
  // 初期状態
  activeModal: null,
  modalOptions: {},
  toasts: [],
  isGlobalLoading: false,
  loadingMessage: null,
  isSidebarOpen: false,
  isKeyboardVisible: false,

  // モーダルアクション
  openModal: (type, options = {}) =>
    set({
      activeModal: type,
      modalOptions: options,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      modalOptions: {},
    }),

  // トーストアクション
  showToast: (type, message, duration = 3000) => {
    const id = generateId();
    const toast: Toast = { id, type, message, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // 自動で非表示
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  hideToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),

  // ローディングアクション
  setGlobalLoading: (loading, message) =>
    set({
      isGlobalLoading: loading,
      loadingMessage: message ?? null,
    }),

  // サイドバーアクション
  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // キーボードアクション
  setKeyboardVisible: (visible) => set({ isKeyboardVisible: visible }),
}));

// セレクター（パフォーマンス最適化用）
export const selectActiveModal = (state: UIState) => state.activeModal;
export const selectModalOptions = (state: UIState) => state.modalOptions;
export const selectToasts = (state: UIState) => state.toasts;
export const selectIsGlobalLoading = (state: UIState) => state.isGlobalLoading;
export const selectLoadingMessage = (state: UIState) => state.loadingMessage;
