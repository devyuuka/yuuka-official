export interface SkillVisual {
  id: 'python' | 'javascript' | 'csharp' | 'other';
  name: string;
  caption: string;
  image: string;
  darkOverlay: boolean;
}

export interface PlannedVisual {
  id: 'desktop' | 'web';
  title: string;
  status: string;
  caption: string;
  stack: string;
  image: string;
}

export const SITE_CONTENT = {
  name: 'ゆうか',
  heroCaption: 'Python・JavaScript・C# などで開発しています。',
  skills: [
    {
      id: 'python',
      name: 'Python',
      caption: 'ツール作成・自動化・試作',
      image: './images/desk-craft.jpg',
      darkOverlay: false,
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      caption: 'Web画面・動きと表現（React / Three.js）',
      image: './images/water-prism.jpg',
      darkOverlay: false,
    },
    {
      id: 'csharp',
      name: 'C#',
      caption: 'デスクトップアプリ開発',
      image: './images/night-desk.jpg',
      darkOverlay: true,
    },
    {
      id: 'other',
      name: 'そのほか',
      caption: 'TypeScript・CSS・気になった技術をいろいろ',
      image: './images/twilight-sky.jpg',
      darkOverlay: true,
    },
  ] as SkillVisual[],
  planned: [
    {
      id: 'desktop',
      title: 'デスクトップアプリ',
      status: '制作中',
      caption: '作業のそばに置いておける軽快なツール。',
      stack: 'C# / Python',
      image: './images/night-desk.jpg',
    },
    {
      id: 'web',
      title: 'Webサービス',
      status: '計画中',
      caption: 'ブラウザからそのまま使えるサービス。',
      stack: 'JavaScript / React',
      image: './images/twilight-sky.jpg',
    },
  ] as PlannedVisual[],
  links: [
    { label: 'GitHub', href: 'https://github.com/devyuuka' },
    { label: 'X', href: 'https://x.com/yuukadev' },
    { label: 'メール', href: 'mailto:yuuka@mail.yuuka.click' },
  ],
};
