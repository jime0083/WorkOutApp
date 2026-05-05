#!/bin/bash

# WorkOutApp デプロイスクリプト
# 使用方法: ./scripts/deploy.sh [all|functions|hosting|rules]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cloud Functions デプロイ
deploy_functions() {
    echo_info "Cloud Functions をデプロイ中..."

    cd "$PROJECT_ROOT"

    # シークレット設定確認
    if ! firebase functions:secrets:access APPLE_SHARED_SECRET > /dev/null 2>&1; then
        echo_warn "APPLE_SHARED_SECRET が設定されていません"
        echo_info "以下のコマンドで設定してください:"
        echo "  firebase functions:secrets:set APPLE_SHARED_SECRET"
    fi

    firebase deploy --only functions

    echo_info "Cloud Functions デプロイ完了"
}

# Hosting デプロイ
deploy_hosting() {
    echo_info "Web アプリをビルド中..."

    cd "$PROJECT_ROOT/web"
    npm run build

    echo_info "Firebase Hosting にデプロイ中..."
    cd "$PROJECT_ROOT"
    firebase deploy --only hosting

    echo_info "Hosting デプロイ完了"
}

# Security Rules デプロイ
deploy_rules() {
    echo_info "Security Rules をデプロイ中..."

    cd "$PROJECT_ROOT"
    firebase deploy --only firestore:rules,storage

    echo_info "Security Rules デプロイ完了"
}

# Firestore インデックスデプロイ
deploy_indexes() {
    echo_info "Firestore インデックスをデプロイ中..."

    cd "$PROJECT_ROOT"
    firebase deploy --only firestore:indexes

    echo_info "インデックスデプロイ完了"
}

# 全てデプロイ
deploy_all() {
    deploy_functions
    deploy_rules
    deploy_indexes
    deploy_hosting
}

# メイン処理
case "${1:-all}" in
    functions)
        deploy_functions
        ;;
    hosting)
        deploy_hosting
        ;;
    rules)
        deploy_rules
        ;;
    indexes)
        deploy_indexes
        ;;
    all)
        deploy_all
        ;;
    *)
        echo "使用方法: $0 [all|functions|hosting|rules|indexes]"
        exit 1
        ;;
esac

echo_info "デプロイ完了!"
