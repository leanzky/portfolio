/**
 * ============================================================
 *  EDIT THIS FILE TO PUT IN YOUR OWN INFORMATION.
 *  Every piece of text on the site comes from here.
 *  Project/timeline images go in /public (e.g. /public/projects/my-app.png)
 *  and are referenced by path (e.g. image: "/projects/my-app.png").
 *  Leave `image` as undefined to show a clean placeholder instead.
 * ============================================================
 */

export type Project = {
  name: string;
  description: string;
  tags: string[];
  url?: string; // live site link (optional)
  image?: string; // e.g. "/projects/my-app.png" — optional, placeholder shown if missing
};

export type TimelineEntry = {
  year: string;
  title: string;
  text: string;
  image?: string;
  caption?: string; // small label under the image
};

export type Capability = {
  title: string;
  text: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const site = {
  // ---------- Basics ----------
  name: "Leandro Francia",
  role: "Developer",
  email: "personal.emailleandro552@gmail.com",
  location: "Goa, Camarines Sur, Philippines",
  // "#contact" opens the built-in contact form modal (sends to `email` above).
  // You can also use a Calendly link or "mailto:you@domain.com" instead.
  ctaLink: "#contact",
  ctaLabel: "Let's Talk",
  // RECOMMENDED: get a free access key at https://web3forms.com (enter your
  // email, the key arrives instantly, no account needed) and paste it here.
  // With a key, contact form messages are delivered via Web3Forms.
  // Without one, the form falls back to formsubmit.co (less reliable).
  web3formsKey: "662bfc45-ac37-4531-b289-68e95cd725d2",
  // Put your resume PDF in /public and reference it here.
  // A download button appears in the hero and footer.
  resume: "/Leandro-Francia-Resume.pdf",
  resumeLabel: "Download Resume",
  // Portrait photo: save your photo as /public/portrait.jpg (or .png)
  // and it will appear in the hero automatically.

  socials: [
    // TODO: replace with your actual profile URLs
    { label: "LinkedIn", url: "https://www.linkedin.com/in/leandro-francia" },
    { label: "GitHub", url: "https://github.com/" },
  ],

  // ---------- Hero ----------
  hero: {
    // The giant display name behind the portrait (keep it short and punchy)
    displayName: "LEANDRO",
    // Each entry renders as its own line of the big white headline
    headlineLines: ["Development,", "Applied", "Differently."],
    subheadline:
      "Computer Science graduate (Cum Laude) and developer building web platforms, mobile apps, and tools end to end, from first commit to deployment.",
    // Bottom-left signature lines
    tagline: ["The Developer.", "That's Leandro."],
  },

  // ---------- About / Journey ----------
  about: {
    heading: "About me & my journey",
    intro:
      "A few years ago I wrote my first lines of code at Bicol University. What happened after that is easier to show than explain.",
    timeline: [
      {
        year: "2020",
        title: "Starting out",
        text: "Began my Bachelor of Science in Computer Science at Bicol University, coming from a science-oriented curriculum where I was a Best Research Awardee. Python and C were the first languages I wrestled with, and lost to, repeatedly, until I didn't.",
      },
      {
        year: "2023",
        title: "First taste of real work",
        text: "Joined Bicol University as a Research Assistant. Office operations, paperwork, data entry. Not glamorous, but it taught me how organizations actually run, and where software could quietly remove the boring parts.",
      },
      {
        year: "2024",
        title: "Graduating Cum Laude, and shipping my thesis",
        text: "Designed and built a mobile app for skin disease detection using YOLOv8 and GANs, with an anatomy chatbot and job search via the Indeed API. Deep learning stopped being a lecture topic and became something I could deploy.",
      },
      {
        year: "2025",
        title: "Creative detour",
        text: "Worked as a freelance video editor for Magnetic Media in New York. Promotional videos, commercials, and digital ads. Editing sharpened an eye for pacing and detail that still shows up in how I build interfaces.",
      },
      {
        year: "2026",
        title: "Engineering for real stakes",
        text: "As a Systems Engineer at Quanby Solutions, I built systems that automate procurement and bidding workflows, including scraping PhilGEPS, significantly reducing manual overhead for the team.",
      },
      {
        year: "Today",
        title: "The journey continues",
        text: "Building products end to end: Payformers, an OpenClaw website builder, a marketing agency site, and a real-time weather platform. The best software is the kind nobody has to think about.",
      },
    ] as TimelineEntry[],
  },

  // ---------- Projects ----------
  projects: {
    heading: "Selected work",
    subheading: "A few projects I'm proud of.",
    items: [
      {
        name: "Payformers",
        description:
          "A platform connecting event organizers with singers, DJs, and live performers. Verified profiles, secure GCash, Maya, and card payments, and real-time booking updates, all in one app. Designed, built, and coded by me.",
        tags: ["Full-stack", "Payments", "Real-time"],
        url: "https://payformers.com",
        image: "/projects/payformers.png",
      },
      {
        name: "OpenClaw Website Builder",
        description:
          "An OpenClaw-powered website builder where every project gets its own isolated agent, chat, and GitHub repository, generating and deploying full web apps like document management and inventory systems from conversation.",
        tags: ["OpenClaw", "Full-stack", "CI/CD"],
        image: "/projects/website-builder.png",
      },
      {
        name: "Sagana Digital",
        description:
          "Marketing site for a Philippines-based digital agency, a supercharged virtual assistant that takes day-to-day work off clients' plates.",
        tags: ["Web Design", "Marketing", "Landing Page"],
        image: "/projects/sagana.png",
      },
      {
        name: "Weather Tracking App",
        description:
          "A real-time public environmental hub for Caraycayon, PH. Live heat index, UV skin-burn risk, humidity, wind, and rainfall analytics presented as a clean, glanceable dashboard.",
        tags: ["Real-time", "Data Viz", "API"],
        image: "/projects/weather.png",
      },
    ] as Project[],
  },

  // ---------- What you get ----------
  capabilities: {
    heading: "What you get",
    subheading: "Beyond the code, this is how working with me actually feels.",
    items: [
      {
        title: "Full-stack development",
        text: "Python, TypeScript, JavaScript, React, Flask, Tauri. Comfortable across the stack from UI to API.",
      },
      {
        title: "End-to-end ownership",
        text: "I take projects from rough idea to deployed product, and stay accountable for the whole build.",
      },
      {
        title: "Workflow automation",
        text: "Deep, hands-on domain knowledge of procurement and bidding workflows, and how to streamline them with software.",
      },
      {
        title: "Machine learning",
        text: "Hands-on with TensorFlow, PyTorch, and Ultralytics for building, training, and deploying deep learning models.",
      },
      {
        title: "DevOps mindset",
        text: "Docker and GitHub Actions pipelines for fully automated build-and-deploy workflows.",
      },
      {
        title: "Fast learner, clear communicator",
        text: "Recognized for adaptability. I pick up new tools quickly and keep everyone in the loop while I do.",
      },
    ] as Capability[],
  },

  // ---------- FAQ ----------
  faq: {
    heading: "FAQ",
    subheading: "Answers to the questions I get most often.",
    items: [
      {
        question: "What kind of work are you looking for?",
        answer:
          "Software development and IT roles where I can build: web platforms, mobile apps, and internal tools. I'm equally happy contributing to a team or owning a project end to end.",
      },
      {
        question: "What's your strongest technical area?",
        answer:
          "Full-stack development around real business processes. At Quanby Solutions I automated parts of procurement and bidding workflows, including PhilGEPS scraping, work that directly reduced manual overhead. On my own time I built and shipped Payformers.",
      },
      {
        question: "Which technologies do you use day to day?",
        answer:
          "Python, TypeScript/JavaScript, and HTML/CSS as a base; React, Flask, and Tauri v2 for building; TensorFlow, PyTorch, and Ultralytics for ML; Docker, Git/GitHub, and GitHub Actions for shipping.",
      },
      {
        question: "Do you work remotely?",
        answer:
          "Yes. I've worked remotely with clients as far away as New York, and I'm based in Camarines Sur, Philippines. On-site or hybrid within the Bicol region also works.",
      },
      {
        question: "Can you handle design as well as development?",
        answer:
          "I care a lot about how things look and feel. My background in video editing trained my eye for pacing and detail, so I can take a project from rough idea to polished interface.",
      },
      {
        question: "How do I get in touch?",
        answer:
          "Email is best: personal.emailleandro552@gmail.com. I usually reply within one business day. You can also download my resume right from this site.",
      },
    ] as FaqItem[],
  },

  // ---------- Footer ----------
  footer: {
    heading: "Let's build something great.",
    subheading:
      "Tell me about your project or team. I usually reply within one business day.",
  },
} as const;

export type Site = typeof site;
