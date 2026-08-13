# MyCar Maintenance

車・バイクの整備記録、次回整備の目安（走行距離・日付ベース）、整備費用を管理するアプリ。

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + `@libsql/client`（SQLite / Turso 互換のlibSQLドライバ）
- 認証はメールアドレス + パスワードのマルチユーザー対応（URLを知っていれば誰でも新規登録可能。各ユーザーのデータは完全に分離される）

## ローカルで動かす

```bash
npm install
cp .env.example .env.local
```

`.env.local` を編集:

- `SESSION_SECRET` — ログインセッションの署名用ランダム文字列（`openssl rand -hex 32` で生成）
- `DATABASE_URL` はローカルではそのまま `file:./local.db` でOK（Tursoアカウント不要）

DBの初期化（テーブル作成のみ。整備項目のデフォルトはユーザーごとにサインアップ時に作られる）:

```bash
npm run db:init
```

開発サーバー起動:

```bash
npm run dev
```

http://localhost:3000 を開き、`/signup` から新規登録。

## 本番デプロイ（Vercel + Turso）

ここから先はユーザー自身のVercel/Tursoアカウントでの操作が必要です。

### 1. Tursoでデータベースを作成

[Turso](https://turso.tech) のアカウントを作成し、CLIをセットアップ:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create mycar-maintenance
turso db show mycar-maintenance --url
turso db tokens create mycar-maintenance
```

`--url` で得られる `libsql://...` と、tokenの値を控えておく。

### 2. リモートDBにスキーマを適用

このリポジトリの `npm run db:init` はローカルファイルにもTursoにも同じスクリプトで使える
（`prisma/init-db.ts` が `DATABASE_URL` を見てテーブルを作成する）。

```bash
DATABASE_URL="libsql://<your-db>.turso.io" \
DATABASE_AUTH_TOKEN="<token>" \
npm run db:init
```

### 3. Vercelにデプロイ

1. [Vercel](https://vercel.com) でこのGitHubリポジトリ（`luluszk-spec/MyCar-Maintenance`）をインポート
2. Environment Variablesに以下を設定
   - `DATABASE_URL` = Tursoの `libsql://...` URL
   - `DATABASE_AUTH_TOKEN` = Tursoのトークン
   - `SESSION_SECRET` = ランダムな文字列（`openssl rand -hex 32`）
3. Deploy

デプロイ後のURLをiPhoneのSafariで開き、「ホーム画面に追加」するとアプリのように使えます。

## 主な機能

- メールアドレス + パスワードでのユーザー登録・ログイン（データはユーザーごとに完全分離）
- 車両（車・バイク、複数台）の登録・走行距離管理・写真登録
- 整備記録の記録（既定項目 + 自由入力、費用・メモ）
- 走行距離ベース／日付ベースのリマインダー（ダッシュボードに「あと◯km / ◯日」表示）
- 整備項目マスタのカスタマイズ（サインアップ時に既定項目がユーザー専用にコピーされ、以後自由に編集・追加・削除できる）
- 年別・車両別のコスト集計

## API

`src/app/api/` 配下にREST風のJSON APIがあり、画面はこれを経由してデータを更新します
（将来ネイティブアプリを作る場合も同じAPIを再利用できる想定）。すべてログイン中のユーザーのデータのみを対象とし、他ユーザーのリソースへのアクセスは404になります。

- `GET/POST /api/vehicles`, `GET/PATCH/DELETE /api/vehicles/:id`
- `GET/POST /api/maintenance-types`, `PATCH/DELETE /api/maintenance-types/:id`
- `GET/POST /api/maintenance-records`, `DELETE /api/maintenance-records/:id`

`proxy.ts`（Next.js 16のミドルウェア）でログインセッションのCookieをチェックし、各ページ・APIは`src/lib/session.ts`の`getCurrentUserId()`でリクエスト元のユーザーを特定してデータを絞り込んでいます。
