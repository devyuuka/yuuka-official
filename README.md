# ゆうか 公式サイト

個人開発者・ゆうかの公式サイトのソースコードです。

## 技術スタック

- React / TypeScript / Vite
- Tailwind CSS
- Three.js
- GSAP (ScrollTrigger)
- Framer Motion
- Lenis

## 構成

- `src/data/profile.ts` — テキスト・得意な言語・制作予定・リンクの定義
- `src/components/PhotoGallerySite.tsx` — メインレイアウトおよびスクロール連動アニメーション
- `src/components/ThreeAtmosphere.tsx` — Three.js による背景パーティクル・ウェーブ演出
- `public/images/` — サイト内で使用しているビジュアル画像
- `public/favicon.webp` — ファビコン

## ローカル開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

ビルド成果物は `dist/` に出力されます（Cloudflare Pages / GitHub Pages のどちらでも動作するよう `base: './'` を設定しています）。

## リンク

- GitHub: https://github.com/devyuuka
- X: https://x.com/yuukadev
- Mail: yuuka@mail.yuuka.click
