// Abhinav's own principles, in his words. Used by the Ideologies page, llms-full.txt and the Ask Abhinav knowledge set.
export const ideologies = [
  {
    id: "engineering-manager",
    title: "As an engineering manager",
    audience: "For senior engineers stepping into management, engineering managers striving to lead with impact, and tech leaders scaling teams and culture.",
    points: [
      ["You're no longer hired to solve technical problems. You're hired to empower your team to solve them.", "Your success is their success."],
      ["Your primary output is not code. It's people.", "The stronger your team, the better your results."],
      ["Your time is no longer your own.", "Meetings, one-on-ones and team alignment become your daily priorities."],
      ["Context switching is your new normal.", "Balancing technical discussions, team morale and strategic planning is the job."],
      ["You'll spend more time hiring than you ever thought.", "Building and retaining a great team is your number one job."],
      ["The hardest conversations are the most important.", "Giving honest feedback, managing underperformance and handling conflict are non-negotiable."],
      ["Trust is everything.", "If your team doesn't trust you, they won't follow your leadership. Earn it, and guard it fiercely."],
      ["Delegation is survival.", "You can't do everything. Your role is to guide, support and enable others to succeed."],
      ["You are the shield.", "Protect your team from distractions, unnecessary pressure and organizational chaos."],
      ["Your growth matters too.", "Don't get so busy managing others that you forget to invest in your own development."],
    ],
    closing: "Management isn't just a role. It's a transformation.",
  },
  {
    id: "senior-engineer",
    title: "As a senior engineer",
    audience: "For aspiring tech leads growing their influence, senior engineers aiming for staff or principal roles, and technical experts ready to shape engineering culture.",
    points: [
      ["You're no longer hired to write code. You're hired to make your team's code better.", "Your impact goes far beyond your commits."],
      ["Teaching is your superpower.", "The faster you can level up junior engineers, the more valuable you become."],
      ["Your technical opinions will shape products.", "With great influence comes the responsibility to back opinions with data."],
      ["Soft skills matter more than hard skills.", "Communication, empathy and influence make the difference between good and great engineers."],
      ["You're not just solving problems. You're anticipating them.", "Proactively identifying risks and gaps is your job now."],
      ["You need to unblock others.", "A senior engineer who can keep the team moving is worth their weight in gold."],
      ["Architectural decisions are expensive.", "Make them with care and consider future maintainability."],
      ["Delegation is a skill.", "Learn to let go and trust others. You can't do everything yourself anymore."],
      ["Your feedback defines the culture.", "The way you review code or guide a discussion sets the tone for the team."],
      ["You're not just building features. You're building systems that scale.", "Think beyond the current sprint and plan for the long term."],
    ],
    closing: "Seniority isn't just a title. It's a mindset shift.",
  },
] as const;
