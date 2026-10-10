import { ideologies } from "../client/src/content/ideologies";

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
    content: "At Rapido from September 2020 to February 2023, Abhinav was Lead Product Engineer. He led two pods: the 14-person Captain Acquisition pod and the 8-person Partnerships pod. He introduced a React SLA dashboard; critical-ride rejection decreased from 19% to 7%. He improved the main website's first interactive time from 1.7 seconds to 0.8 seconds. Order batching in multiple cities increased rides per rider by 40% in those cities. Production bugs in his pod fell from 71 to 9. Technologies included JavaScript, React, Next.js, and Angular.",
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
    content: "Abhinav's website has a Google referral page at /google-refer. A candidate shares their name, email, optional phone, current company, previous companies, the link to the job they plan to apply for, and a resume (PDF or Word, up to 4 MB). Abhinav reviews requests personally and gets back if there is a fit. A referral is not guaranteed. If the form is unavailable, candidates can email the role link and resume to abhinavnigam2207@gmail.com.",
  },
  {
    id: "site-links",
    title: "Where to find Abhinav",
    url: "/knowme",
    category: "Site",
    content: "Abhinav's links: GitHub github.com/abhinavnigam2207, LinkedIn linkedin.com/in/abhinavnigam2207, articles on DEV.to at dev.to/abhinavnigam2207 and on Medium at medium.com/@abhinavnigam2207, email abhinavnigam2207@gmail.com. The website has a writing page at /blog, an ideologies page at /ideologies, and a page with all links at /knowme.",
  },
  {
    id: "cv-observe-platform",
    title: "Observe.ai in detail — component library, design system, BFF",
    url: "/#experience",
    category: "CV",
    content: "At Observe.ai Abhinav split his time between the Platform team, which improves developer productivity for the main web app and org-wide admin configuration, and APEX, a React application for contact-center quality-assurance workflows. It was his move from a B2C to a B2B SaaS company, where he learned SaaS priorities and build-versus-buy trade-offs. Web component library: to raise UI development velocity he designed and built it from scratch. Components were first imported straight from Material UI; he wrapped them in a shared folder, then moved them to a separate repository. For hosting he explored a private npm registry (paid) and built a proof of concept on Verdaccio (open source, but permissions and a database would be self-managed), then chose AWS CodeArtifact because Observe.ai already ran on AWS, combined with Jenkins jobs and AWS IAM for authorization. Material UI was the base and Rollup the bundler, so components are tree-shakable. Nazca design system: he led the revamp on top of that library, managing cross-team collaboration, delivery and conflict resolution, with no bugs or rollbacks. Team hierarchy cascader: built single-handedly; team selection changed from a dropdown to a hierarchy cascader where selecting a team includes everything below it; a shared component used in 10 to 12 places. Backend-for-Frontend microservice: he introduced and architected it because the same heavy APIs were reused in many places; it adds a data-massaging layer, proxying and caching, moved third-party whitelisting for client compliance out of nginx configuration, and gave the frontend a place to write logs. Retention and deletion policy UI: users set how long a conversation is kept before it is deleted or moved to cold storage; monthly MongoDB storage cost fell 14%. Security: yarn audit issues went from critical 9 to 0, high 28 to 6, moderate 10 to 3, low 2 to 0. Delivery: for a project due in 1.5 months he managed the 8-person team while coding, handling leave, work allocation, the production-support rota, MVP scope reduction and architecture.",
  },
  {
    id: "cv-observe-culture",
    title: "Observe.ai in detail — team culture, mentoring, processes",
    url: "/#experience",
    category: "CV",
    content: "Beyond code at Observe.ai, Abhinav worked on developer culture. He was heavily involved in PR code reviews, peer coding sessions, hiring and onboarding engineers, and product discussions with product managers. He introduced and ran UI architecture guild meetings to break problems into solvable modules, and UI learning meetings where teammates shared what they learned every two weeks. He wrote the most Confluence documentation on the team so people did not have to ask each other for procedures. He mentored teammates through pair coding and debugging. He created processes: PR review guidelines, Jenkins PR checks for size, SonarQube integration, a test-case count pipeline, a Bitbucket pipeline for restricted merges to master, a rule of two reviews before merge, and a high-level design in Confluence before presenting to the guild. He managed and served on the UI on-call support rota: production issues, backlog bugs, deployments, post-deployment monitoring and alerts. Teamwork example: when he was busy managing an urgent delivery, a junior teammate picked up the component library pipeline work, came with written questions, and Abhinav helped him finish it. He was runner-up in the company hackathon.",
  },
  {
    id: "cv-rapido-pods",
    title: "Rapido in detail — Captain Acquisition and Partnerships pods",
    url: "/#experience",
    category: "CV",
    content: "Captain Acquisition pod (14 members): Abhinav led the pod that acquires a captain (driver) at Rapido, from installing the app to the first ride, covering authentication, KYC, referral, learning modules and the lead-creation SDK. It owned the Backend-for-Frontend for all driver-app APIs at a scale of 8.5 million captains, with about 3.1 lakh (310,000) captain registrations and 1.53 lakh (153,000) activations. He reduced the production bug count from 71 to 9 using a task-batching technique, moving the pod from the most bugs in the company to the third fewest, and received the Rapido Spot Award. He led the architecture and extraction of the KYC service from the monolith to a standalone microservice, and fixed duplicate records in the data-ingestion service with a colleague, writing a backfill script. Partnerships pod (8 members): he grew into a full-stack engineer leading Rapido Partnerships, a vertical generating 25% of revenue, which handles tie-ups with delivery providers such as Swiggy, Zomato and Dotpe. He set up the React SLA dashboard (rejection 19% to 7%) and introduced React and a Next.js starter kit to the company, architected the Rewards and Penalty dashboard to improve captain quality, improved the main website's first interactive time from 1.7 to 0.8 seconds, raised the website from rank 3 to rank 1 on Google search, and migrated domain-specific collections from the main MongoDB to a dedicated B2B MongoDB, for which he received a spot award.",
  },
  // Abhinav's own principles, as published on /ideologies.
  ...ideologies.map((group): KnowledgeSource => ({
    id: `ideologies-${group.id}`,
    title: `Abhinav's ideologies and beliefs — ${group.title.toLowerCase()}`,
    url: "/ideologies",
    category: "Site",
    content: `Abhinav's principles, philosophy and advice on leadership and management, ${group.title.toLowerCase()}: ${group.points.map(([lead, body], index) => `${index + 1}. ${lead} ${body}`).join(" ")} ${group.closing} ${group.audience}`,
  })),
];
