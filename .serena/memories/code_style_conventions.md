# コードスタイルと規約

## JavaScript コーディング規約

### 全般
- ES6構文を使用（class, const/let, アロー関数等）
- インデント: スペース4つ
- セミコロン: 文末に必須
- 文字列: シングルクォートを基本使用

### 命名規則
- クラス名: PascalCase（例: `GameController`, `BattleSystem`）
- メソッド名: camelCase（例: `startNewRound`, `processRoundResult`）
- 変数名: camelCase（例: `playerHand`, `enemyHP`）
- 定数: 特に定数表記は使用せず、通常のcamelCase

### クラス構造
- コンストラクタで状態を初期化
- publicメソッドは明確な責務を持つ
- イベントリスナーは`setupEventListeners`メソッドで集約

### ファイル構成
- 1ファイル1クラスが基本
- 機能ごとにファイルを分割:
  - `game.js`: ゲーム全体の制御とUI管理
  - `battle.js`: バトルロジック
  - `csv-loader.js`: CSV読み込みユーティリティ

## CSS スタイル規約
- BEM命名規則の簡易版を使用
- レスポンシブ対応: vw/vh単位を活用
- カスタムプロパティ（CSS変数）で色管理
- グラデーション・グローエフェクトで幻想的UI表現

## HTML構造
- セマンティックHTML5を使用
- データ属性でJavaScript連携
- クラス名は機能を表す命名

## データ管理
- CSVファイルで全設定管理
- BOM付きUTF-8エンコーディング必須
- カラム名は英語（snake_case）