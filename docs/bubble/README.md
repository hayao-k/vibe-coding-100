# 🫧バブルゲーム🫧

シンプルで楽しいバブル消去パズルゲームです。同じ色のバブルを3個以上つなげて消去し、高スコアを目指しましょう！

## ゲーム概要

- **ジャンル**: パズルゲーム
- **プレイ人数**: 1人
- **難易度**: 初級〜中級
- **技術**: HTML5 + CSS3 + JavaScript (ES6+)
- **対応デバイス**: デスクトップ・タブレット・スマートフォン（レスポンシブ対応）

## ゲームルール

### 基本操作
1. 同じ色のバブルをクリックして選択
2. 隣接する同じ色のバブルを1個ずつ選択していく（隣接判定：80px以内）
3. 3個選択すると1秒の猶予時間が開始
4. 猶予時間中は追加で同じ色のバブルを選択可能
5. 猶予時間終了または異なる色をクリックで消去実行
6. バブルが上部の赤いライン（60px）に到達するとゲームオーバー

### バブル生成システム
- **初期配置**: 底部から4列のバブルでゲーム開始
- **新規生成**: 底部から一列ずつバブルが湧き出る
- **生成間隔**: 初期10秒、レベルアップで0.5秒ずつ短縮（最短3秒）
- **重力システム**: 支えを失ったバブルは自動的に落下
- **浮遊チェック**: 8秒ごとに浮遊バブルを検出して落下

### スコアシステム
- **基本点数**: 10点 × 消去個数
- **ボーナス点数**: (消去個数 - 3) × 5点 × 消去個数
- **例**: 5個消去の場合 → (10 + 2×5) × 5 = 100点

### レベルシステム
- **レベルアップ条件**: 300点ごと
- **速度変化**: レベルアップでバブル生成間隔が0.5秒短縮
- **最高速度**: 3秒間隔（レベル15以降）

### 特殊アイテム
- **爆弾💣**: 選択したバブルを中心に半径100px内のバブルを一括消去
- **初期個数**: 3個
- **獲得点数**: 消去1個につき15点
- **使用条件**: バブルを1個選択してから使用

## バブルの色（5色）

1. **紫** (#8C4FFF → #7A3FE6) - グラデーション
2. **ピンク** (#E7157B → #D10A6B) - グラデーション  
3. **ティール** (#01A88D → #00967D) - グラデーション
4. **オレンジ** (#ED7100 → #D46300) - グラデーション
5. **緑** (#7AA116 → #6B8F14) - グラデーション

## 攻略ポイント

### 🎯 基本戦略

#### 1. 大きな塊を狙う
- 3個より4個、5個以上の消去を狙う
- ボーナス点数が大幅に増加（5個消去で100点！）
- 1秒の猶予時間を活用して追加選択

#### 2. 底部から消去する
- 下の方のバブルを消すと上のバブルが落下
- 連鎖的な消去が発生しやすい
- 重力を活用した戦略的プレイ

#### 3. 色のバランスを観察
- 5色のうち偏りがある色を優先的に消去
- 同じ色が集中している箇所を見つける
- 将来的な大きな塊形成を予測

### 🚀 上級テクニック

#### 1. 浮遊バブル活用
- 支えを失ったバブルは自動的に落下
- 意図的に支えを取り除いて配置を調整
- 8秒ごとの浮遊チェックを活用

#### 2. 爆弾の効果的使用
- 密集地帯での使用で最大効果
- 1個15点なので7個以上巻き込めば元が取れる
- ゲーム終盤の緊急回避に温存

#### 3. レベル管理
- 早期レベルアップは危険
- 300点手前で大きな消去を狙う
- 速度増加に備えた盤面整理

### ⚡ 危機回避テクニック

#### 1. 上部危険ライン対策
- 上部（60px以下）にバブルが来たら最優先で処理
- 横一列の消去で一気に高さを下げる
- 爆弾を使った緊急回避

#### 2. 落下バブル対応
- 落下中のバブルはクリック不可
- 落下完了を待ってから次の手を考える
- 落下による新しい配置パターンを予測

#### 3. 色の偏り対処
- 特定の色が少ない時は温存
- 多い色から積極的に消去
- バランス崩壊前の早期対応

### 🎮 実践的なコツ

#### 序盤（レベル1-3）
- 大きな塊作りに集中
- 爆弾は温存
- 盤面の色分布を把握

#### 中盤（レベル4-7）
- 効率的な消去パターンを確立
- 浮遊バブルを積極活用
- 危険ライン監視を強化

#### 終盤（レベル8以上）
- 生存最優先
- 爆弾の戦略的使用
- 小さな消去でも積極的に実行

## 技術仕様

### フロントエンド技術
- **HTML5**: セマンティックマークアップ
- **CSS3**: 
  - Flexbox/Grid レイアウト
  - CSS変数（カスタムプロパティ）
  - アニメーション（@keyframes）
  - レスポンシブデザイン
- **JavaScript (ES6+)**:
  - クラスベース設計
  - モジュラー構造
  - イベント駆動プログラミング
  - 非同期処理（setTimeout/setInterval）

### ゲームエンジン機能
- **物理演算**: 重力システム、衝突判定
- **アニメーション**: バブル落下、消去エフェクト、爆発演出
- **状態管理**: ゲーム状態、スコア、レベル管理
- **UI/UX**: リアルタイムフィードバック、視覚的効果

### パフォーマンス最適化
- **効率的な描画**: CSS transformを活用
- **メモリ管理**: 不要な要素の適切な削除
- **イベント最適化**: デバウンス処理
- **レスポンシブ対応**: モバイル・デスクトップ両対応

## ファイル構成

```
├── index.html      # メインHTMLファイル（UI構造）
├── styles.css      # スタイルシート（デザイン・アニメーション）
├── game.js         # ゲームロジック（メインエンジン）
└── README.md       # このファイル（ドキュメント）
```

### 各ファイルの役割

#### index.html
- ゲーム画面の基本構造
- スコア表示、コントロールボタン
- ゲームボード領域の定義

#### styles.css
- AWS風デザインシステム
- バブルの色とグラデーション
- アニメーション定義
- レスポンシブレイアウト

#### game.js
- `BubbleGame`クラス（メインゲームエンジン）
- バブル生成・管理システム
- 物理演算（重力・衝突）
- スコア・レベル管理
- 特殊アイテム処理

## 遊び方

1. `index.html` をブラウザで開く
2. 「新しいゲーム」ボタンをクリック
3. バブルをクリックして同じ色を1個ずつ選択し、3個以上で消去
4. 高スコアを目指してプレイ！

### 操作方法
- **バブル選択**: 左クリック
- **選択解除**: 選択済みバブルを再クリック
- **爆弾使用**: バブル1個選択後、爆弾ボタンをクリック
- **選択クリア**: 「選択解除」ボタンをクリック

## ブラウザ要件

### 推奨ブラウザ
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### 必要な機能
- ES6+ JavaScript サポート
- CSS Grid/Flexbox サポート
- CSS アニメーション サポート
- HTML5 Canvas（将来の拡張用）

## 開発情報

### アーキテクチャ
- **MVC パターン**: Model（データ）、View（表示）、Controller（制御）の分離
- **イベント駆動**: ユーザー操作とゲーム状態の非同期処理
- **オブジェクト指向**: クラスベースの設計

### 主要クラス・メソッド
```javascript
class BubbleGame {
    // ゲーム初期化・状態管理
    startGame()
    
    // バブル生成・管理
    createBubble()
    generateInitialBubbles()
    bubbleLineFromBottom()
    
    // 物理演算
    applyGravity()
    animateBubbleFall()
    hasSupport()
    
    // ゲームロジック
    handleBubbleClick()
    removeBubbles()
    useBombItem()
    
    // UI更新
    updateScore()
    showMessage()
}
```

### 拡張可能性
- 新しいバブル色の追加
- 特殊アイテムの追加
- サウンド効果の実装
- マルチプレイヤー機能
- ランキングシステム

---

**楽しいバブルゲームライフを！** 🎮✨
