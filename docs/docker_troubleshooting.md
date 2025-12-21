# Docker環境のトラブルシューティング

WhyTradeプロジェクトでDocker起動時に問題が発生した場合の対処方法です。

## エラー1: Permission denied (docker.sock)

### エラーメッセージ
```
permission denied while trying to connect to the Docker daemon socket
```

### 原因
ユーザーがdockerグループに属していない、またはDockerデーモンが起動していません。

### 解決方法

#### 1. Dockerデーモンの起動確認
```bash
sudo systemctl status docker
```

起動していない場合:
```bash
sudo systemctl start docker
sudo systemctl enable docker  # 自動起動を有効化
```

#### 2. ユーザーをdockerグループに追加
```bash
sudo usermod -aG docker $USER
```

その後、**ログアウトして再ログイン**するか、以下のコマンドを実行:
```bash
newgrp docker
```

#### 3. 確認
```bash
docker ps
```

---

## エラー2: Not supported URL scheme http+docker

### エラーメッセージ
```
urllib3.exceptions.URLSchemeUnknown: Not supported URL scheme http+docker
```

### 原因
古いバージョンの`docker-compose`（V1）を使用しています。

### 解決方法

#### オプション1: Docker Compose V2を使用（推奨）

`docker-compose`の代わりに`docker compose`（スペース区切り）を使用:

```bash
# docker-compose.ymlがあるディレクトリで
docker compose up -d
docker compose down
docker compose logs -f
```

#### オプション2: Docker Compose V2をインストール

```bash
# Docker Compose プラグインのインストール
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 確認
docker compose version
```

#### オプション3: 古いdocker-composeを更新

```bash
# 古いバージョンを削除
sudo apt-get remove docker-compose

# 最新版をダウンロード
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 確認
docker-compose --version
```

---

## エラー3: ポートが既に使用されている

### エラーメッセージ
```
Bind for 0.0.0.0:3000 failed: port is already allocated
```

### 解決方法

#### 使用中のポートを確認
```bash
sudo lsof -i :3000
sudo lsof -i :8000
sudo lsof -i :5432
```

#### docker-compose.ymlのポートを変更
```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # ホスト側のポートを変更
  backend:
    ports:
      - "8001:8000"
  db:
    ports:
      - "5433:5432"
```

---

## クイックスタート（修正版）

### 1. Docker権限の設定
```bash
# ユーザーをdockerグループに追加
sudo usermod -aG docker $USER

# 新しいグループ設定を適用
newgrp docker

# Dockerデーモンを起動
sudo systemctl start docker
```

### 2. 環境変数の設定
```bash
cd WhyTrade
cp .env.example .env
```

### 3. Docker Compose V2で起動
```bash
docker compose up -d
```

または、古いバージョンの場合:
```bash
docker-compose up -d
```

### 4. 動作確認
```bash
# コンテナの状態確認
docker compose ps

# ログ確認
docker compose logs -f

# アクセス
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
```

---

## よくある質問

### Q: `docker compose`と`docker-compose`の違いは？

- **`docker compose`** (V2): Dockerの公式プラグイン、推奨
- **`docker-compose`** (V1): 古いスタンドアロン版、非推奨

### Q: sudoなしでdockerコマンドを実行したい

```bash
sudo usermod -aG docker $USER
newgrp docker
```

実行後、ログアウト→ログインが必要な場合があります。

### Q: コンテナが起動しない

```bash
# ログを確認
docker compose logs backend
docker compose logs frontend
docker compose logs db

# コンテナを再ビルド
docker compose build --no-cache
docker compose up -d
```

---

## 参考リンク

- [Docker公式ドキュメント](https://docs.docker.com/)
- [Docker Compose V2](https://docs.docker.com/compose/cli-command/)
- [セットアップガイド](./setup_guide.md)
