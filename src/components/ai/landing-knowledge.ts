export interface KnowledgeEntry {
  keywords: string[]
  answer: string
  sources?: { label: string; href: string }[]
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ['what is', 'this website', 'platform', 'about', 'jeeify', 'what does'],
    answer: `**JEEIFY** is an AI-powered personal JEE preparation platform designed to help students master Physics, Chemistry, and Mathematics for JEE Main & Advanced.

Unlike traditional coaching or generic study apps, JEEIFY combines:
- **Smart syllabus tracking** — real-time progress per chapter and topic
- **AI-powered tutoring** — personalized doubt-solving, concept explanations, and strategy
- **Advanced analytics** — pace tracking, mock test analysis, and error pattern detection
- **All-in-one tools** — timetable planner, Pomodoro timer, formula repository, and revision system

Everything syncs to the cloud so you can study across devices seamlessly.`,
    sources: [{ label: 'Features', href: '/#features' }, { label: 'About', href: '/about' }],
  },
  {
    keywords: ['pricing', 'price', 'cost', 'pro', 'plan', 'subscription', 'premium', 'free vs pro', 'compare'],
    answer: `**Free Plan** — ₹0/month
- Full syllabus tracker with chapter-wise progress
- Basic timetable planner and Pomodoro timer
- Progress dashboard and daily logs
- Cloud sync across devices

**Pro Plan** — ₹50/month
- Everything in Free, plus:
  - **AI Tutor** — unlimited doubt-solving, concept explanations, and personalized guidance
  - **Advanced analytics** — mock test analysis, error tracking, pace optimization
  - **PYQ library** — full access to previous year questions with solutions
  - **Formula repository** — upload and organize formula sheets
  - **Revision tools** — flashcards, quick summaries, and memory tricks
  - **Priority support** — fastest response time

All plans include cloud sync with end-to-end encryption. No hidden fees. Cancel anytime.`,
    sources: [{ label: 'View Pricing', href: '/pricing' }],
  },
  {
    keywords: ['features', 'what can', 'capabilities', 'tools', 'what do you offer'],
    answer: `JEEIFY comes with a comprehensive suite of tools:

**📊 Dashboard** — Your command center showing daily targets, progress metrics, and upcoming revisions

**📚 Syllabus Tracker** — Complete JEE syllabus organized by subject, division, and chapter with real-time progress

**🗺️ Smart Roadmap** — Adaptive study plan that adjusts based on your current pace and target exam date

**📅 Timetable Planner** — Drag-and-drop weekly schedule builder with pre-built templates

**📈 Progress Analytics** — Visual breakdown of completed vs pending topics per subject with pace indicators

**🍅 Pomodoro Timer** — Built-in focus timer with session logging

**✅ Completion Tracker** — End-to-end topic coverage with milestone celebrations

**❓ Practice Questions** — Log and track questions attempted with accuracy metrics

**📝 Test Analyzer** — Record mock test scores and analyze performance across subjects

**🧠 Revision System** — Upload notes, store formula sheets, and manage revision materials

**🤖 AI Tutor (Pro)** — Personal JEE mentor for doubt-solving, concept teaching, and exam strategy`,
    sources: [{ label: 'Features', href: '/#features' }],
  },
  {
    keywords: ['exam', 'jee', 'exams supported', 'which exams', 'main', 'advanced', 'iit', 'neet'],
    answer: `Currently, JEEIFY is purpose-built for **JEE Main** and **JEE Advanced** preparation.

The platform covers the complete Physics, Chemistry, and Mathematics syllabus as prescribed by NCERT and the latest JEE pattern.

We're exploring support for additional exams in the future. If you have a specific exam in mind, feel free to reach out via the Contact page.`,
  },
  {
    keywords: ['mobile', 'app', 'ios', 'android', 'phone', 'tablet', 'mobile friendly'],
    answer: `Yes! JEEIFY is fully **mobile-responsive** and works great on phones and tablets through any modern browser.

There's no native app to download — just open jeeify.app on your mobile browser and sign in. All features, including the AI Tutor, are accessible on mobile.

For the best experience, you can add JEEIFY to your home screen:
- **iOS**: Safari → Share → Add to Home Screen
- **Android**: Chrome → Menu → Add to Home Screen`,
  },
  {
    keywords: ['contact', 'support', 'help', 'reach', 'email', 'message', 'get in touch'],
    answer: `We're here to help! The best way to reach us:

- **📧 Email**: support@jeeify.app
- **💬 Contact Form**: Visit our [Contact page](/contact)

We typically respond within 24 hours, often sooner. Pro subscribers get priority support with faster response times.`,
    sources: [{ label: 'Contact Us', href: '/contact' }],
  },
  {
    keywords: ['refund', 'money back', 'cancel', 'cancellation', 'refund policy'],
    answer: `We offer a **7-day money-back guarantee** on all Pro subscriptions. If you're not satisfied within the first 7 days, we'll refund your payment — no questions asked.

After 7 days, cancellations take effect at the end of your current billing cycle. You'll retain Pro access until then.

To request a refund or cancel, email support@jeeify.app with your registered email address.`,
    sources: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }],
  },
  {
    keywords: ['different', 'unique', 'better than', 'vs', 'compared to', 'what makes', 'stand out'],
    answer: `What sets JEEIFY apart from other platforms:

**1. AI-First Architecture**
The AI isn't an add-on — it's woven into every part of the platform. From personalized study plans to intelligent doubt resolution, the AI understands your progress contextually.

**2. Complete Ecosystem**
Not just questions or videos — you get syllabus tracking, timetable planning, progress analytics, test analysis, revision tools, and an AI tutor, all in one place.

**3. Privacy-First Cloud Sync**
Your data syncs securely across devices with end-to-end encryption. No data sharing. No ads. Ever.

**4. Built for JEE Specifically**
Every feature is designed around the JEE curriculum, pattern, and timeline. No generic study tools — everything is calibrated for JEE Main & Advanced.

**5. Pro at ₹50/month**
Less than the cost of a coffee — unlimited AI tutoring, advanced analytics, PYQ library, and more.`,
  },
  {
    keywords: ['how to start', 'getting started', 'begin', 'sign up', 'register', 'create account', 'get started'],
    answer: `Getting started takes 30 seconds:

1. **Sign up** — Click "Get Started" or "Sign In" in the top navigation
2. **Set your target** — Choose JEE Main or Advanced and set your exam date
3. **Track your syllabus** — Mark what you've studied and what's pending
4. **Study with AI** — On the Pro plan, use the AI Tutor for doubts, concepts, and strategy

No credit card required to start. The Free plan gives you full access to the syllabus tracker, timetable, and progress dashboard. Upgrade to Pro anytime to unlock the AI Tutor and advanced features.`,
  },
  {
    keywords: ['pro features', 'ai tutor', 'ai assistant', 'ai features', 'ai capabilities'],
    answer: `The **AI Tutor** (Pro feature, ₹50/month) is your personal JEE mentor:

**🎓 Concept Teaching** — Ask "Explain Faraday's Law" and get a clear, step-by-step explanation with visual examples

**🧮 Numerical Solving** — "Solve a projectile motion problem where initial velocity is 20 m/s at 30°" — get worked solutions with formula breakdown

**📋 Error Analysis** — After mock tests, the AI analyzes your mistakes and identifies weak areas

**📚 Revision Help** — Generate quick summaries, formula lists, and memory tricks for any chapter

**🎯 Personalized Strategy** — Based on your progress data, the AI suggests what to focus on next

**💬 Conversation Memory** — The AI remembers your current chapter, last question, and learning history

The AI adapts to your level — beginner or advanced — and never dumps information.`,
    sources: [{ label: 'Pricing', href: '/pricing' }],
  },
  {
    keywords: ['privacy', 'data', 'secure', 'safe', 'encryption', 'security'],
    answer: `Your privacy and data security are fundamental to JEEIFY:

- **End-to-end encryption** for all cloud-synced data
- **No data sharing** — we never sell or share your study data
- **No ads** — ever
- **GDPR-compliant** data handling practices
- **SOC 2 compliant infrastructure**
- **Role-based access control** ensures your data is isolated from other users

You can export or delete all your data anytime from the Settings page.

Read our full [Privacy Policy](/privacy) and [Terms of Service](/terms) for details.`,
    sources: [{ label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms', href: '/terms' }],
  },
  {
    keywords: ['faq', 'common questions', 'help', 'answers'],
    answer: `Here are answers to frequently asked questions:

**Q: Is there a free trial for Pro?**
A: You can use the Free plan indefinitely. When you're ready, Pro is ₹50/month with a 7-day money-back guarantee.

**Q: Can I use JEEIFY offline?**
A: Most core features (tracker, timer, timetable) work offline. Cloud sync happens when you're back online.

**Q: What if I'm targeting JEE 2028 or later?**
A: JEEIFY works for any JEE timeline. Set your exam date and the platform adapts.

**Q: Can I share my account with friends?**
A: Each account is for individual use only. We don't support shared accounts for security and personalization reasons.

**Q: Do you have video lectures?**
A: JEEIFY is a study *tool* platform — tracking, analytics, AI tutoring, and practice. We recommend using it alongside your existing coaching or video resources.

Have more questions? Reach out at support@jeeify.app.`,
    sources: [{ label: 'Contact', href: '/contact' }],
  },
  {
    keywords: ['roadmap', 'upcoming', 'future', 'planned', 'coming soon'],
    answer: `Here's what we're building next:

**⚡ In Progress**
- Whiteboard / Canvas mode for the AI Tutor
- Voice input & output for AI interactions
- Handwritten notes recognition

**🔮 Coming Next**
- PDF upload for AI analysis
- Image-based doubt solving (snap a problem)
- Collaborative study rooms
- Advanced mock test engine with AI-generated questions

**🌍 Future**
- Native mobile apps (iOS & Android)
- Multi-language support (Hindi, regional languages)
- Community features: leaderboards, group study, peer reviews

Have suggestions? We'd love to hear them at support@jeeify.app.`,
  },
  {
    keywords: ['terms', 'terms of service', 'conditions', 'agreement', 'legal'],
    answer: `Our Terms of Service govern your use of JEEIFY. Key points:

- You must be 13+ to use the platform
- Your account is personal and non-transferable
- We provide the platform "as is" with a commitment to continuous improvement
- Pro subscriptions auto-renew unless cancelled
- Refunds available within 7 days of purchase
- We're not affiliated with IITs, JEE, or NCERT
- We reserve the right to update terms with notice

Read the full terms at [jeeify.app/terms](/terms).`,
  },
]

export const SUGGESTED_QUESTIONS = [
  'What does this platform offer?',
  'Compare Free vs Pro',
  'How does AI help me?',
  'What exams are supported?',
  'Show pricing',
]

export function findAnswer(query: string): { answer: string; sources?: { label: string; href: string }[] } | null {
  const lower = query.toLowerCase()
  let bestMatch: { entry: KnowledgeEntry; score: number } | null = null

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        score += kw.length
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { entry, score }
    }
  }

  if (bestMatch) {
    return { answer: bestMatch.entry.answer, sources: bestMatch.entry.sources }
  }

  return null
}
