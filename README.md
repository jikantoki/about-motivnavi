# About Motivnavi OS

Motivnavi OS の紹介ページ（PWA対応）を Docker の Apache で配信します。

## 起動

```bash
docker compose up -d --build
```

ブラウザで http://localhost:13080/ を開きます。

停止は `docker compose down` です。

## ファイル構成

```
.
├── Dockerfile               # httpd:2.4-alpine ベース
├── docker-compose.yml       # 13080 → 80 にポート割り当て
├── apache/
│   └── motivnavi.conf       # MIMEタイプ・圧縮・キャッシュ制御
└── htdocs/
    ├── index.html
    ├── manifest.webmanifest # PWA マニフェスト
    ├── sw.js                # Service Worker（オフライン対応）
    ├── css/style.css
    ├── js/app.js            # SW登録・インストールボタン
    ├── icons/               # favicon / 192 / 512 / maskable / apple-touch / エノキ電気ロゴ
    └── images/              # 背景画像（webp / jpg）
        └── photos/          # 取り付けイメージ写真（800px / 1600px）
```

## PWAとしてインストールする

- Chrome / Edge でページを開くと、右上に「アプリをインストール」ボタンが出ます（アドレスバーのインストールアイコンからも可）。
- 一度開けば、オフラインでも表示できます。

### 注意：別の端末からアクセスする場合

Service Worker は **HTTPS か localhost** でしか動きません。
`http://192.168.x.x:13080/` のようにLAN内の別端末から開くと、ページは表示されますがPWAとしてはインストールできません。

別端末からインストールしたい場合は、次のどちらかを使ってください。

1. リバースプロキシ（Caddy / nginx など）や Cloudflare Tunnel で HTTPS 化する
2. テスト用途なら、Chrome の `chrome://flags/#unsafely-treat-insecure-origin-as-secure` に `http://<IPアドレス>:13080` を登録する

## 内容を更新したとき

`htdocs/sw.js` の `CACHE_VERSION`（例: `'v1'` → `'v2'`）を上げてから再ビルドすると、インストール済みのアプリにも新しい内容が反映されます。

```bash
docker compose up -d --build
```
