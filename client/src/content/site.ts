export const profile = {
  name: "Abhinav Nigam",
  role: "Senior Software Engineer",
  company: "Google",
  experience: "12+ years",
  email: "abhinavnigam2207@gmail.com",
  phone: "+91-9999-230-962",
  github: "https://github.com/abhinavnigam2207",
  linkedin: "https://www.linkedin.com/in/abhinavnigam2207",
  devto: "https://dev.to/abhinavnigam2207",
  medium: "https://medium.com/@abhinavnigam2207",
  instagram: "https://www.instagram.com/abhinavnigam2207/",
  facebook: "https://www.facebook.com/abhinavnigam2207/",
};

export const experiences = [
  {
    company: "Google",
    role: "Senior Software Engineer",
    dates: "May 2025 — Present",
    team: "Leading 5 engineers",
    summary: "Google Cloud SecOps: custom scheduling for SIEM dashboard reports, a shared visualization library, and reliability improvements.",
    outcome: "Reduced flaky tests from 14 per week to 3 per week (78%).",
    technologies: ["TypeScript", "Angular", "Go", "ECharts"],
  },
  {
    company: "Observe.ai",
    role: "Software Development Engineer III",
    dates: "March 2023 — October 2024",
    team: "Led an 8-person team",
    summary: "Worked across the Platform team and APEX contact-center quality-assurance product.",
    outcome: "Built a shared web-component library and a Backend-for-Frontend layer; the retention/deletion-policy UI work helped lower monthly MongoDB storage cost by 14%.",
    technologies: ["TypeScript", "React", "Node.js", "MongoDB", "Jenkins"],
    details: [
      {
        title: "Platform and APEX",
        points: [
          "Designed and built a web component library from scratch to speed up UI development: wrapped Material UI components, moved them into their own repository, bundled them with Rollup so they tree-shake, and published them through AWS CodeArtifact with Jenkins.",
          "Led the Nazca design system revamp on top of that library, coordinating delivery across teams. It shipped with no bugs or rollbacks.",
          "Built the team hierarchy cascader on my own: a shared component that replaced a flat dropdown and is used in 10–12 places across the app.",
          "Introduced and architected a Backend-for-Frontend service for data shaping, proxying, caching, third-party allow-listing and frontend logging.",
          "Built the retention and deletion policy UI, which moves old conversations to cold storage and cut monthly MongoDB storage cost by 14%.",
          "Cleared yarn audit security issues: critical 9 → 0, high 28 → 6, moderate 10 → 3, low 2 → 0.",
          "Stepped up to manage the 8-person team, while still coding, to deliver a feature-heavy project in 1.5 months.",
        ],
      },
      {
        title: "Team and culture",
        points: [
          "Started the UI architecture guild and fortnightly UI learning sessions.",
          "Set up PR review guidelines, Jenkins checks for PR size, SonarQube and test count, and a two-review rule before merge.",
          "Wrote the most Confluence docs on the team, mentored through pair coding, ran the on-call rota, and helped hire and onboard engineers.",
          "Runner-up in the company hackathon.",
        ],
      },
    ],
  },
  {
    company: "Rapido",
    role: "Lead Product Engineer",
    dates: "September 2020 — February 2023",
    team: "Led pods of 14 and 8",
    summary: "Led two pods: Captain Acquisition, which takes a driver from app install to first ride, and Partnerships, the delivery-partner vertical.",
    outcome: "Production bugs fell from 71 to 9; the SLA dashboard reduced rejection from 19% to 7%; website first interactive time improved from 1.7s to 0.8s; order batching increased rides per rider by 40% in selected cities.",
    technologies: ["JavaScript", "React", "Next.js", "Angular"],
    details: [
      {
        title: "Captain Acquisition pod · 14 people",
        points: [
          "Owned the captain (driver) journey from installing the app to the first ride: authentication, KYC, referrals, learning modules and the lead-creation SDK, plus the Backend-for-Frontend for every driver-app API, at a scale of 8.5 million captains.",
          "Cut production bugs from 71 to 9 with task batching, taking the pod from the most bugs in the company to the third fewest. Received the Rapido Spot Award for it.",
          "Led the design and extraction of the KYC service from the monolith into a standalone microservice.",
          "Tracked down duplicate records in the data ingestion service with a colleague and wrote the script to backfill them.",
        ],
      },
      {
        title: "Partnerships pod · 8 people",
        points: [
          "Grew into a full-stack role leading the vertical behind 25% of revenue: tie-ups with delivery providers such as Swiggy, Zomato and Dotpe.",
          "Set up a React SLA dashboard to watch live rides and flag critical ones, cutting rejection from 19% to 7%. Introduced React and a Next.js starter kit to the company.",
          "Architected the Rewards and Penalty dashboard to raise captain quality.",
          "Improved the main website's first interactive time from 1.7s to 0.8s and took it from position 3 to 1 on Google search.",
          "Migrated domain-specific collections from the main MongoDB to a dedicated B2B MongoDB, which earned a second spot award.",
        ],
      },
    ],
  },
  {
    company: "Reliance Jio",
    role: "Team Lead",
    dates: "May 2019 — September 2020",
    team: "Led an 8-person team",
    summary: "Worked on Jio.com and helped establish the web platform and team.",
    outcome: "Contributed to route-based micro-frontend architecture, deployment pipelines, and web-component starter tooling.",
    technologies: ["React", "Next.js", "Gatsby", "JavaScript", "Webpack"],
  },
  {
    company: "IHS Markit",
    role: "Associate — Development",
    dates: "May 2017 — April 2019",
    team: "Financial applications",
    summary: "Worked on TradeServ Unification, an application for credit and FX trade confirmation, clearing, and regulatory reporting.",
    outcome: "Contributed to an Angular/TypeScript single-page application and its test and CI workflow.",
    technologies: ["TypeScript", "Angular", "RxJS", "Webpack", "Sass"],
  },
  {
    company: "MetaDesign Solutions",
    role: "Senior Software Engineer",
    dates: "September 2013 — April 2017",
    team: "Web product engineering",
    summary: "Worked on Medanta e-connect and Shivyog Portal web applications.",
    outcome: "Built web experiences for patient appointments, event registration, membership, and payment workflows.",
    technologies: ["JavaScript", "Ember.js", "AngularJS", "jQuery", "Bootstrap"],
  },
];

export const featuredWork = [
  {
    title: "Google Cloud SecOps",
    period: "Current",
    description: "A cloud-native security operations platform. I engineered scheduled delivery for dashboard reports and contributed to a shared visualization library used across internal projects.",
    result: "14 → 3 flaky tests per week",
    tags: ["TypeScript", "Angular", "Go", "ECharts"],
  },
  {
    title: "Observe.ai Platform & APEX",
    period: "March 2023 — October 2024",
    description: "Designed a reusable web-component library, introduced a Backend-for-Frontend layer, and worked on the retention and deletion-policy interface.",
    result: "14% lower monthly MongoDB storage cost",
    tags: ["React", "TypeScript", "Node.js", "Design systems"],
  },
  {
    title: "Rapido Partnerships",
    period: "September 2020 — February 2023",
    description: "Built product features and operational dashboards for delivery partnerships, including an SLA dashboard and multi-city order batching.",
    result: "Rejection 19% → 7%; rides per rider +40% in selected cities",
    tags: ["React", "Next.js", "JavaScript", "Product engineering"],
  },
];

export const skillGroups = [
  { label: "Languages", items: ["JavaScript", "TypeScript", "Go", "HTML", "CSS"] },
  { label: "Frontend & product", items: ["React", "Angular", "Next.js", "AngularJS", "Ember.js", "RxJS", "Webpack"] },
  { label: "Platforms & delivery", items: ["Node.js", "Kubernetes", "Kafka", "Jenkins", "Azure DevOps", "SonarQube", "Grafana"] },
  { label: "Testing", items: ["Jest", "React Testing Library", "Cypress", "Mocha", "Karma", "Protractor"] },
];

export const blogPosts = [
  {
    title: "An approach to Micro-frontend Architecture (MVP) with NextJs",
    date: "June 21, 2020",
    updated: "Edited June 26, 2020",
    readTime: "5 min read",
    description: "A route-based approach to splitting a large frontend into smaller, independently owned applications, with trade-offs and monorepo considerations.",
    tags: ["Architecture", "React", "Micro-frontends"],
    url: "https://dev.to/abhinavnigam2207/an-approach-to-micro-frontend-architecture-mvp-with-nextjs-2l84",
  },
  {
    title: "Console is much more than .log()",
    date: "August 31, 2020",
    readTime: "3 min read",
    description: "A practical tour of browser-console tools including clear, table, assert, count, timers, groups, trace, and styled output.",
    tags: ["JavaScript", "Developer tools"],
    url: "https://dev.to/abhinavnigam2207/console-is-much-more-than-log-59mp",
  },
  {
    title: "Introduction (Abhinavnigam2207)",
    date: "June 13, 2020",
    readTime: "1 min read",
    description: "A short introduction to Abhinav's background and early web-development focus across JavaScript, TypeScript, React, and Angular.",
    tags: ["Introduction", "JavaScript", "React"],
    url: "https://dev.to/abhinavnigam2207/introduction-abhinavnigam2207-52jj",
  },
];

export const socialLinks = [
  { label: "GitHub", href: profile.github, note: "Code & projects" },
  { label: "LinkedIn", href: profile.linkedin, note: "Professional profile" },
  { label: "DEV.to", href: profile.devto, note: "Articles" },
  { label: "Medium", href: profile.medium, note: "Articles" },
  { label: "Instagram", href: profile.instagram, note: "Social" },
  { label: "Facebook", href: profile.facebook, note: "Social" },
];
