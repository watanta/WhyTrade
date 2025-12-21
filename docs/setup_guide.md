# WhyTrade 開発環境セットアップガイド

このガイドでは、WhyTradeの開発環境をセットアップする手順を説明します。

## 前提条件

以下のソフトウェアがインストールされていることを確認してください:

- **Docker**: バージョン20.10以上
- **Docker Compose**: バージョン2.0以上
- **Git**: バージョン2.0以上

## クイックスタート（Docker使用）

最も簡単な方法は、Dockerを使用することです。

### 1. リポジトリのクローン

```bash
git clone https://github.com/watanta/WhyTrade.git
cd WhyTrade
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集して、以下の項目を変更してください:

- `SECRET_KEY`: ランダムな文字列（本番環境では必ず変更）
  ```bash
  # 生成例
  openssl rand -hex 32
  ```

### 3. Dockerコンテナの起動

```bash
docker-compose up -d
```

初回起動時は、イメージのビルドに数分かかります。

### 4. 動作確認

以下のURLにアクセスして、各サービスが正常に動作していることを確認します:

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API ドキュメント (Swagger UI)**: http://localhost:8000/docs
- **API ドキュメント (ReDoc)**: http://localhost:8000/redoc

### 5. ログの確認

```bash
# 全サービスのログを表示
docker-compose logs -f

# 特定のサービスのログを表示
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### 6. コンテナの停止

```bash
# コンテナを停止（データは保持）
docker-compose stop

# コンテナを停止して削除（データは保持）
docker-compose down

# コンテナとボリュームを削除（データも削除）
docker-compose down -v
```

## ローカル開発（Docker不使用）

Dockerを使用せずにローカルで開発する場合は、以下の手順に従ってください。

### 前提条件

- **Node.js**: バージョン20以上
- **Python**: バージョン3.11以上
- **Poetry**: Pythonパッケージマネージャー
- **PostgreSQL**: バージョン15以上

### フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

フロントエンドは http://localhost:3000 で起動します。

### バックエンドのセットアップ

```bash
cd backend

# Poetryのインストール（未インストールの場合）
curl -sSL https://install.python-poetry.org | python3 -

# 依存関係のインストール
poetry install

# データベースマイグレーション（初回のみ）
poetry run alembic upgrade head

# 開発サーバーの起動
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

バックエンドは http://localhost:8000 で起動します。

### データベースのセットアップ

```bash
# PostgreSQLにログイン
psql -U postgres

# データベースとユーザーの作成
CREATE DATABASE whytrade;
CREATE USER whytrade_user WITH PASSWORD 'whytrade_password';
GRANT ALL PRIVILEGES ON DATABASE whytrade TO whytrade_user;

# 拡張機能の有効化
\c whytrade
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## トラブルシューティング

### ポートが既に使用されている

他のアプリケーションがポート3000、8000、5432を使用している場合、`docker-compose.yml`のポート設定を変更してください。

```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # ホストポートを変更
```

### データベース接続エラー

1. データベースコンテナが起動しているか確認:
   ```bash
   docker-compose ps
   ```

2. データベースのログを確認:
   ```bash
   docker-compose logs db
   ```

3. データベースに直接接続して確認:
   ```bash
   docker-compose exec db psql -U whytrade_user -d whytrade
   ```

### フロントエンドのビルドエラー

```bash
# node_modulesを削除して再インストール
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### バックエンドの依存関係エラー

```bash
# Poetry環境をクリーンアップ
cd backend
poetry env remove python
poetry install
```

## 開発ワークフロー

### 1. 新機能の開発

```bash
# 新しいブランチを作成
git checkout -b feature/your-feature-name

# 変更を加える
# ...

# コミット
git add .
git commit -m "feat: add your feature"

# プッシュ
git push origin feature/your-feature-name
```

### 2. データベースマイグレーション

```bash
cd backend

# 新しいマイグレーションファイルを作成
poetry run alembic revision --autogenerate -m "description"

# マイグレーションを適用
poetry run alembic upgrade head

# マイグレーションをロールバック
poetry run alembic downgrade -1
```

### 3. テストの実行

```bash
# フロントエンドのテスト（今後実装予定）
cd frontend
npm test

# バックエンドのテスト
cd backend
poetry run pytest
```

## 便利なコマンド

### Dockerコンテナ内でコマンドを実行

```bash
# フロントエンドコンテナ内でコマンド実行
docker-compose exec frontend npm install <package-name>

# バックエンドコンテナ内でコマンド実行
docker-compose exec backend poetry add <package-name>

# データベースコンテナ内でSQLを実行
docker-compose exec db psql -U whytrade_user -d whytrade
```

### コンテナの再ビルド

```bash
# 全サービスを再ビルド
docker-compose build

# 特定のサービスを再ビルド
docker-compose build backend

# キャッシュを使わずに再ビルド
docker-compose build --no-cache
```

## 次のステップ

開発環境のセットアップが完了したら、以下のドキュメントを参照してください:

- [アプリケーション設計書](../docs/app_design.md)
- [GitHub Issues](https://github.com/watanta/WhyTrade/issues)

開発を始める際は、Issue #1（ユーザー認証機能）から着手することをお勧めします。
