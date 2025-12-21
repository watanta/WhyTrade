-- WhyTrade Database Initialization Script

-- データベースが存在しない場合は作成される（docker-entrypoint-initdb.dで自動実行）

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- タイムゾーンの設定
SET timezone = 'Asia/Tokyo';

-- 初期化完了メッセージ
SELECT 'WhyTrade database initialized successfully' AS status;
