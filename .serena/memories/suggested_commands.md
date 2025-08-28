# 推奨コマンドと起動方法

## ゲーム起動方法

### HTTPサーバー経由での起動（推奨）
CORS制限のため、必ずHTTPサーバー経由でアクセスしてください。

#### Python3を使用する場合
```bash
# プロジェクトディレクトリに移動
cd /Users/ms/Desktop/taimaken-ayato-demo

# HTTPサーバーを起動
python3 -m http.server 8000

# ブラウザで以下のURLにアクセス
# http://localhost:8000
```

#### Node.jsを使用する場合
```bash
# プロジェクトディレクトリに移動
cd /Users/ms/Desktop/taimaken-ayato-demo

# HTTPサーバーを起動
npx http-server -p 8000

# ブラウザで以下のURLにアクセス
# http://localhost:8000
```

### 直接開く場合（非推奨）
CSVファイル読み込みでCORSエラーが発生する可能性があります。
```bash
open index.html
```

## 開発用コマンド

### ファイル確認
```bash
# プロジェクト構造を確認
ls -la

# JavaScriptファイルを確認
ls js/

# CSVデータファイルを確認
ls data/
```

### Git操作（macOS）
```bash
# 状態確認
git status

# 変更を追加
git add .

# コミット
git commit -m "メッセージ"
```

## デバッグ
ブラウザの開発者ツール（F12またはCmd+Option+I）でコンソールログを確認

## 注意事項
- ビルドコマンドなし（純粋なHTML/CSS/JS）
- テストフレームワークなし
- リンター/フォーマッター未設定
- パッケージマネージャー未使用