export type KnowledgeSource = {
  id: string;
  title: string;
  url: string;
  category: "CV" | "Article" | "Site";
  date?: string;
  content: string;
};

export const knowledgeSources: KnowledgeSource[] = [
  {
    id: "cv-google",
    title: "Abhinav Nigam CV — Google",
    url: "/#experience",
    category: "CV",
    content: "Abhinav Nigam is a Senior Software Engineer at Google from May 2025 to present, leading 5 engineers. On Google Cloud SecOps from May 2026, he engineered a custom scheduling service for SIEM dashboard reports delivered as CSV, PDF, and PNG; owned a shared ECharts-based visualization library; and reduced flaky tests from 14 per week to 3 per week, a 78% reduction. Technology includes TypeScript, Angular, and Go.",
  },
  {
    id: "cv-observe",
    title: "Abhinav Nigam CV — Observe.ai",
    url: "/#experience",
    category: "CV",
    content: "At Observe.ai from March 2023 to October 2024, Abhinav was a Software Development Engineer III and led an 8-person team across Platform and APEX. He designed a web component library, introduced a Backend-for-Frontend microservice layer for UI data massaging, proxying, and caching, and worked on the Quash Retention and Deletion Policy UI, contributing to a 14% monthly MongoDB storage-cost decrease. Technologies included TypeScript, React, Node.js, and MongoDB.",
  },
  {
    id: "cv-rapido",
    title: "Abhinav Nigam CV — Rapido",
    url: "/#experience",
    category: "CV",
    content: "At Rapido from September 2020 to February 2023, Abhinav was Lead Product Engineer on Rapido Partnerships and led a 14-person pod. He introduced a React SLA dashboard; critical-ride rejection decreased from 19% to 7%. He improved the main website's first interactive time from 1.7 seconds to 0.8 seconds. Order batching in multiple cities increased rides per rider by 40% in those cities. Technologies included JavaScript, React, Next.js, and Angular.",
  },
  {
    id: "cv-jio",
    title: "Abhinav Nigam CV — Reliance Jio",
    url: "/#experience",
    category: "CV",
    content: "At Reliance Jio from May 2019 to September 2020, Abhinav was a Team Lead on Jio.com. His CV describes React and Next.js work, route-based micro-frontend architecture, environment artifacts, and reusable web component tooling. Technologies included React, JavaScript, Next.js, Gatsby, Angular, Webpack, and Jest.",
  },
  {
    id: "cv-early-career",
    title: "Abhinav Nigam CV — Earlier experience and education",
    url: "/#experience",
    category: "CV",
    content: "Abhinav worked at IHS Markit from May 2017 to April 2019 on TradeServ Unification, a credit and FX trade-confirmation, clearing, and regulatory-reporting application. Before that, at MetaDesign Solutions from September 2013 to April 2017, he worked on Medanta e-connect and Shivyog Portal. His education is a B.Tech in Computer Science, 2009–2013, from Guru Gobind Singh Indraprastha University. The CV states 12+ years of experience.",
  },
  {
    id: "blog-intro",
    title: "Introduction (Abhinavnigam2207)",
    url: "https://dev.to/abhinavnigam2207/introduction-abhinavnigam2207-52jj",
    category: "Article",
    date: "June 13, 2020",
    content: "In his June 2020 DEV.to introduction, Abhinav described himself as an enthusiastic web developer with more than seven years of experience across application ecosystems and domains. He listed JavaScript, TypeScript, React, Angular, HTML5, CSS3, and Webpack among his areas of expertise and linked his GitHub, LinkedIn, Instagram, and Facebook profiles.",
  },
  {
    id: "blog-console",
    title: "Console is much more than .log()",
    url: "https://dev.to/abhinavnigam2207/console-is-much-more-than-log-59mp",
    category: "Article",
    date: "August 31, 2020",
    content: "In this JavaScript article, Abhinav surveys browser console methods beyond console.log: console.clear, console.table, console.assert, console.count and countReset, console.time/timeLog/timeEnd, console.group/groupEnd/groupCollapsed, console.trace, and CSS-styled console output using %c. The article is a practical collection of browser-console tips.",
  },
  {
    id: "blog-microfrontends",
    title: "An approach to Micro-frontend Architecture (MVP) with NextJs",
    url: "https://dev.to/abhinavnigam2207/an-approach-to-micro-frontend-architecture-mvp-with-nextjs-2l84",
    category: "Article",
    date: "June 21, 2020",
    content: "In this architecture article, Abhinav describes dividing a large web application into smaller route-based mini-apps or MVPs. He discusses when faster, independent delivery may justify micro-frontends, their business-centric ownership, framework flexibility and resilience, and the choice between monorepo and multirepo approaches. He also provides a Next.js-oriented route and build example.",
  },
  {
    id: "site-referral",
    title: "Google referral page",
    url: "/google-refer",
    category: "Site",
    content: "Abhinav's website has a Google referral page at /google-refer. A candidate shares their name, email, optional phone, current company, previous companies, the link to the job they plan to apply for, and a resume (PDF or Word, up to 5 MB). Abhinav reviews requests personally and gets back if there is a fit. A referral is not guaranteed. Until the form is open, candidates can email the role link and resume to abhinavnigam2207@gmail.com.",
  },
  {
    id: "site-links",
    title: "Where to find Abhinav",
    url: "/knowme",
    category: "Site",
    content: "Abhinav's links: GitHub github.com/abhinavnigam2207, LinkedIn linkedin.com/in/abhinavnigam2207, articles on DEV.to at dev.to/abhinavnigam2207 and on Medium at medium.com/@abhinavnigam2207, email abhinavnigam2207@gmail.com. The website has a writing page at /blog, an ideologies page at /ideologies, and a page with all links at /knowme.",
  },
];
