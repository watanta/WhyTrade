# WhyTrade - 株式売買意思決定PDCAアプリ

株式売買における意思決定のPDCAサイクルを効果的に回すことで、投資スキルの向上と収益性の改善を支援するアプリケーション。

## 📚 ドキュメント

- [アプリケーション設計書](docs/app_design.md) - 詳細な設計仕様

## 🎯 主要機能

### PDCAサイクル管理

- **Plan（計画）**: 売買記録と詳細な根拠入力
  - 市場分析、テクニカル分析、ファンダメンタル分析
  - リスク評価、確信度の記録
  
- **Do（実行）**: 実際の約定情報記録
  - 計画との差異記録
  
- **Check（評価）**: ポジション管理とリアルタイム損益確認
  - 保有ポジション一覧
  - 損益状況の可視化
  
- **Act（改善）**: 利益確定時の振り返り入力
  - うまくいったこと/いかなかったこと
  - 学んだこと、次回への改善アクション

### 分析・レポート

- ダッシュボード（総合損益、勝率統計）
- 確信度別勝率分析
- 根拠タイプ別成績
- 時系列分析
- カスタムレポート作成

## 🛠️ 技術スタック

### フロントエンド
- React + TypeScript
- Redux Toolkit
- Material-UI (MUI)
- Recharts / Chart.js

### バックエンド
- Node.js + Express / FastAPI (Python)
- PostgreSQL
- Prisma / SQLAlchemy
- JWT認証

### インフラ
- Docker + Docker Compose
- AWS / GCP / Vercel

## 📁 プロジェクト構造

```
WhyTrade/
├── docs/              # ドキュメント
│   └── app_design.md  # アプリケーション設計書
├── frontend/          # Reactフロントエンド
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── services/
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── backend/           # FastAPIバックエンド
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   ├── Dockerfile
│   └── pyproject.toml
├── database/          # データベース初期化
│   └── init.sql
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚀 セットアップ手順

### 前提条件
- Docker & Docker Compose
- Git

### 1. リポジトリのクローン
```bash
git clone https://github.com/watanta/WhyTrade.git
cd WhyTrade
```

### 2. 環境変数の設定
```bash
cp .env.example .env
# .envファイルを編集して、SECRET_KEYなどを変更
```

### 3. Dockerコンテナの起動
```bash
docker-compose up -d
```

### 4. アプリケーションへのアクセス
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs

### 5. コンテナの停止
```bash
docker-compose down
```

## 💻 ローカル開発（Docker不使用）

### フロントエンド
```bash
cd frontend
npm install
npm run dev
```

### バックエンド
```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```

### データベース
PostgreSQL 15をローカルにインストールし、`.env`の設定に従ってデータベースを作成してください。

## 📝 開発ワークフロー

1. 新しいブランチを作成
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. 変更を加える

3. コミット
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. プッシュしてプルリクエストを作成
   ```bash
   git push origin feature/your-feature-name
   ```

## 🚀 開発フェーズ

### Phase 1: MVP（最小実行可能製品）
- ユーザー認証
- 基本的な売買記録機能
- 売買根拠の記録
- ポジション一覧表示
- 簡易的な振り返り機能

### Phase 2: 分析機能強化
- ダッシュボード実装
- 基本統計指標
- グラフ・チャート表示
- レポート出力

### Phase 3: 高度な機能
- タグ機能
- 詳細分析レポート
- カスタムレポート作成
- 証券会社API連携
- アラート・通知機能

### Phase 4: UX改善
- モバイル対応
- ダークモード
- データインポート/エクスポート
- テンプレート機能

## 📄 ライセンス

TBD

## 👥 貢献

TBD
