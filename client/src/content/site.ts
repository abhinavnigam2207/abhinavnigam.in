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
  },
  {
    company: "Rapido",
    role: "Lead Product Engineer",
    dates: "September 2020 — February 2023",
    team: "Led a 14-person pod",
    summary: "Led product engineering for Rapido Partnerships, a delivery-partner vertical.",
    outcome: "The SLA dashboard reduced rejection from 19% to 7%; website first interactive time improved from 1.7s to 0.8s; order batching increased rides per rider by 40% in selected cities.",
    technologies: ["JavaScript", "React", "Next.js", "Angular"],
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
