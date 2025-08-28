# プロジェクト構造

```
taimaken-ayato-demo/
├── index.html           # メインHTML（ゲーム画面）
├── README.md           # プロジェクト説明書
├── PROGRESS.md         # 開発進捗管理
├── CHANGELOG.md        # 変更履歴
├── .gitignore          # Git除外設定
│
├── css/
│   └── battle.css      # バトル画面スタイルシート
│
├── js/
│   ├── game.js         # ゲーム全体制御・UI管理（GameControllerクラス）
│   ├── battle.js       # バトルシステムロジック（BattleSystemクラス）
│   └── csv-loader.js   # CSV読み込みユーティリティ
│
└── data/               # ゲームデータ（CSV形式）
    ├── config.csv          # ゲーム設定
    ├── ayato.csv           # 彩人（敵キャラ）データ
    ├── tells.csv           # 仕草データ
    ├── exposure_levels.csv # 露出度レベル設定
    ├── defeat_events.csv   # 敗北イベントデータ
    └── victory_events.csv  # 勝利イベントデータ
```

## 主要クラス構成

### GameController (game.js)
- ゲーム全体の制御
- UI更新・イベント管理
- ユーザー入力処理
- 戦闘結果の表示

### BattleSystem (battle.js)
- バトルロジック実装
- じゃんけん判定
- ダメージ計算
- 心理戦システム管理
- ゲーム終了判定

### CSV管理
- すべてのゲームデータをCSVで外部化
- カスタマイズ可能な設計
- BOM付きUTF-8で日本語対応