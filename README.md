# 数学Ⅰ デジタル教材

**公開URL：https://taichi9445-jpg.github.io/taichi_math/**

- トップページ（`index.html`）… 先生が GAS・Canva で作った元の教材31本へのリンク集
- 作り直し版（`remake.html`）… 同じ31本を作り直した試作版。`m/` 以下が各教材

高校数学Ⅰ の教材 31 本を、1 つのサイトにまとめたものです。
GAS・Canva でバラバラに作られていたものを、素の HTML / CSS / JavaScript で作り直しています。

- **外部サービスに一切つながりません。** ライブラリも読み込みません（合計 472KB）。
- **ビルド作業は不要です。** フォルダをそのまま置けば動きます。
- スマホ・Chromebook・PC のどれでも、横スクロールなしで表示されます。

---

## すぐ試す（公開する前に手元で確認）

`index.html` をダブルクリックするだけで動きます。インターネットにつながっていなくても動きます。

---

## GitHub Pages で公開する

生徒が URL から誰でも開ける形にする手順です。1 回だけやれば、あとは差し替えるだけです。

### 1. GitHub のアカウントを作る

[github.com](https://github.com) で無料アカウントを作ります。ユーザー名は URL の一部になります
（例：ユーザー名が `tanaka-math` なら `https://tanaka-math.github.io/...`）。

### 2. リポジトリ（置き場所）を作る

1. 右上の「+」→「New repository」
2. **Repository name** に `math1` と入力
3. **Public** を選ぶ（Private だと公開できません）
4. 「Create repository」

### 3. ファイルをアップロードする

1. 作られたページの「uploading an existing file」をクリック
2. この `math1` フォルダの**中身**（`index.html`、`assets`、`data`、`m`）を
   まとめてドラッグ＆ドロップする
   - ※ `math1` フォルダごとではなく、**中身**を入れてください
3. 下の「Commit changes」を押す

### 4. Pages を有効にする

1. リポジトリの「Settings」→ 左メニューの「Pages」
2. **Source** を `Deploy from a branch` に
3. **Branch** を `main` 、フォルダは `/ (root)` にして「Save」
4. 1〜2 分待つと、ページの上部に公開 URL が出ます

```
https://taichi9445-jpg.github.io/taichi_math/
```

この URL を生徒に配れば、誰でもアクセスして遊べます。

### 5. 個別の教材の URL

一覧を経由しなくても、教材ごとに直接リンクできます。授業で 1 つだけ使うときに便利です。

```
https://taichi9445-jpg.github.io/taichi_math/m/tenkai-koushiki.html   ← 展開の公式
https://taichi9445-jpg.github.io/taichi_math/m/root-tower.html        ← 平方根タワー
```

ファイル名は下の一覧表を見てください。

### 更新するとき

直したファイルを GitHub 上で同じ場所にアップロードし直すだけです。URL は変わりません。

---

## 教材の一覧

| # | 教材 | ファイル |
|---|------|---------|
| **式の計算** | | |
| 01 | 文字式のルール | `m/moji-rule.html` |
| 02 | 次数と係数 | `m/jisu-keisu.html` |
| 03 | 多項式の計算 | `m/takoushiki.html` |
| 04 | 九九の練習 | `m/kuku.html` |
| 05 | 正負の九九 | `m/seifu-kuku.html` |
| 06 | 文字式の計算 | `m/moji-keisan.html` |
| 07 | 展開の練習（クエスト） | `m/tenkai-quest.html` |
| 08 | 指数法則 | `m/shisu.html` |
| 09 | 展開マスター | `m/tenkai-master.html` |
| 10 | 展開の公式 | `m/tenkai-koushiki.html` |
| 11 | 因数分解を段階的に学ぶ | `m/insu-step.html` |
| 12 | 因数分解の練習 | `m/insu-master.html` |
| 13 | 共通因数の練習 | `m/kyotsu-insu.html` |
| **実数** | | |
| 14 | ルートの基礎 | `m/root-basic.html` |
| 15 | ルートの計算（アルケミスト） | `m/root-alchemist.html` |
| 16 | ルートの計算全般（平方根タワー） | `m/root-tower.html` |
| 17 | 1次方程式・不等式 | `m/houteishiki-step.html` |
| 18 | 2次方程式 | `m/nijihouteishiki.html` |
| **2次関数** | | |
| 19 | x＝○のときのyの値 | `m/nijikansu-zahyou.html` |
| 20 | 2次関数の平行移動 | `m/heikou-idou.html` |
| 21 | 最大値・最小値 | `m/saidai-saishou.html` |
| 22 | 2次関数と共有点 | `m/kyouyuuten.html` |
| 23 | 不等式の意味 | `m/futoushiki-imi.html` |
| 24 | 2次不等式 | `m/niji-futoushiki.html` |
| **三角比** | | |
| 25 | 三角比の値 | `m/sankakuhi-quiz.html` |
| 26 | 有名角の三角比の値 | `m/yuumeikaku.html` |
| 27 | 相互関係の計算 | `m/sougo-kankei.html` |
| 28 | 面積の計算 | `m/menseki.html` |
| 29 | 正弦定理 | `m/seigen-teiri.html` |
| 30 | 三角比（座標） | `m/sankakuhi-zahyou.html` |
| 31 | 三角比の値（総合） | `m/sankakuhi-value.html` |

---

## 中身のしくみ（直すときのために）

教材ごとにバラバラに作らず、**共通の部品**の上に載せてあります。
同じバグが 31 か所に散らばらないようにするためです。

| ファイル | 役割 |
|---------|------|
| `assets/mathcore.js` | **採点エンジン。** 入力を数式として解釈して正誤を判定する |
| `assets/quiz.js` | 出題エンジン（4択・記述・穴埋め・つなげる／スコア／結果画面） |
| `assets/steps.js` | 途中式を順に埋めていく形式のエンジン |
| `assets/algebra.js` | 展開・因数分解の式を作る部品 |
| `assets/graph.js` | 2次関数のグラフ・数直線を SVG で描く |
| `assets/base.css` | 全教材共通の見た目とレイアウト |
| `data/*.js` | 元教材から移した問題データ |

各教材の HTML は「問題をどう作るか」だけを書いています。
画面の作り方・採点・エラー処理は共通部品が受け持つので、教材ごとに壊れることがありません。

### 採点について

もっとも重要な変更点です。従来は入力された文字列をそのまま比べていたため、

- `2x+3` と書くべきところを `3+2x` と書くと不正解
- 全角で `２ｘ＋３` と入れると不正解
- 逆に `2x+30` のような答えが正解として通ってしまう

といったことが起きていました。

`assets/mathcore.js` では、入力を数式として解析し、変数にいくつもの値を代入して
両者が完全に一致するかどうかで判定しています（多項式恒等性テスト）。
このため、書き方が違っても数学的に同じなら正解、少しでも違えば不正解になります。

さらに「因数分解して答えよ」「分母を有理化せよ」のように *形* が問われる問題では、
値が合っているだけでは正解にせず、積の形になっているか・分母にルートが残っていないかも
確かめています。

### 問題を増やしたいとき

教材の HTML を開くと、問題を作る関数がそのまま書いてあります。
たとえば `m/tenkai-koushiki.html` の `modes` に 1 行足せば、新しい練習メニューが増えます。
問題データを持っている教材（`data/*.js`）は、そのファイルに項目を足すだけです。
