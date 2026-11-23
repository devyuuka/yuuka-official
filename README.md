# ゆうか — 個人公式サイト

開発者・ゆうかの公式サイトです。  
**React + TypeScript + Vite + Three.js + GSAP (ScrollTrigger) + Framer Motion + Lenis** で構築し、**Cloudflare Pages** への公開を前提としています。

## 特徴

- **写真ビジュアル × 角丸UI**: 青空・窓辺・水面プリズム・マジックアワー・夜更けのデスクといった透明感のある写真ビジュアルと、`rounded-[28px]`〜`rounded-[40px]` の角丸シートで構成。影や不要な機能・装飾を排しています。
- **スクロール連動アニメーションと緩急**: Lenis の慣性スクロールと GSAP ScrollTrigger を連動させ、ファーストビューの展開、文章の抑揚表現、左右で速度の異なる写真パララックス、夕暮れセクションの浮遊フォト、Three.js の光の粒子を緩急をつけて動かしています。
- **Cloudflare Pages 対応**: `public/_redirects`・`public/_headers` 同梱済み。

## ローカル開発

```bash
npm install
npm run dev
```

## プロフィール・リンク・画像の編集

- テキスト・SNSリンク: `src/data/profile.ts`
- ビジュアル画像: `public/images/`

## Cloudflare Pages へのデプロイ

- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`

```bash
npm run build
npx wrangler pages deploy dist --project-name yuuka-official
```
