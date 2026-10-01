import { Project, SkillCategory, ServiceItem, ExperienceItem, EducationItem, CertificateItem, ReviewItem } from '../types';

export const PERSONAL_INFO = {
  name: "Suyash Bhovad",
  tagline: "Creative Frontend Developer & Software Engineer",
  roles: [
    "Web Developer",
    "Software Engineer",
    "UI/UX Designer",
    "Frontend Developer"
  ],
  bio: "I'm a passionate Web Developer and Software Engineer exploring UI/UX Design while building immersive web experiences. Bridging the gap between engineering rigor and award-winning digital aesthetics.",
  location: "Mumbai, India / Remote Worldwide",
  availability: "Open to Internship and Full-Time Opportunities",
  email: "suyashbhovad12@gmail.com",
  github: "https://github.com/suyashbhovad",
  linkedin: "https://linkedin.com/in/suyashbhovad",
  instagram: "https://instagram.com/_suyash_bhovad_",
  resumeUrl: "#resume-section"
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Frontend",
    categoryKey: "frontend",
    skills: [
      { name: "React", level: 95, iconName: "SiReact", description: "Hooks, Fiber, Context, State Architecture", highlight: true },
      { name: "Angular", level: 90, iconName: "SiAngular", description: "Components, Services, Routing, Responsive Web Apps", highlight: true },
      { name: "Ionic Framework",level: 85,iconName: "SiIonic",description: "Cross-Platform Mobile Apps, Capacitor, Native Device Features",highlight: true},
      { name: "JavaScript", level: 85, iconName: "SiJavascript", description: "ESNext, Event Loop, Async/Await, Web APIs",highlight: true },
      { name: "TypeScript", level: 85, iconName: "SiTypescript", description: "Generics, Utility Types, Strict Typing", highlight: true },
      { name: "Tailwind CSS", level: 50, iconName: "SiTailwindcss", description: "Design Systems, Responsive Architecture",highlight: true },
      { name: "Kotlin",level: 70,iconName: "SiKotlin",description: "Android Development, Image Capture, PDF Generation",highlight: true},
      { name: "HTML5 & Semantic Web", level: 98, iconName: "SiHtml5", description: "Microdata, Accessibility (a11y), SEO",highlight: true },
      { name: "CSS3 & Animations", level: 95, iconName: "SiCss3", description: "CSS Grid, Flexbox, Keyframes, Custom Properties" ,highlight: true}
    ]
  },
  {
    title: "Backend",
    categoryKey: "backend",
    skills: [
      { name: "Node.js", level: 88, iconName: "SiNodedotjs", description: "Microservices, Event-driven runtime, Streams", highlight: true },
    ]
  },
  {
    title: "Programming",
    categoryKey: "programming",
    skills: [
      { name: "Python", level: 88, iconName: "SiPython", description: "Data Structures, Automation, AI Integrations", highlight: true },
      { name: "Java", level: 70, iconName: "FaJava", description: "OOP, Concurrency, Algorithms" },
      { name: "Php", level: 70, iconName: "SiCplusplus", description: "System memory, Low-level pointers, DSA" }
    ]
  },
  {
    title: "Tools & Workflow",
    categoryKey: "tools",
    skills: [
      { name: "Git & GitHub", level: 92, iconName: "SiGit", description: "Version Control, CI/CD Actions, Rebase", highlight: true },
      { name: "Figma", level: 90, iconName: "SiFigma", description: "Design Systems, Auto-Layout, High-Fi Prototyping", highlight: true },
      { name: "VS Code", level: 96, iconName: "VscVscode", description: "Custom Configs, Debugging, Snippets" },
      { name: "Postman", level: 89, iconName: "SiPostman", description: "API Testing, Mock Servers, Test Suites" },
      { name: "Android Studio", level: 89, iconName: "SiAndroidstudio", description: "Android App Development, Debugging, Device Integration" }
    ]
  }
];

export const SERVICES: ServiceItem[] = [
  {
    id: "web-development",
    title: "Web Development",
    description:
      "Building responsive and user-focused web applications with Angular and TypeScript, turning ideas and requirements into practical digital experiences.",
    icon: "Code2",
    badge: "Frontend",
    deliverables: [
      "Angular Applications",
      "Responsive Interfaces",
      "Reusable Components",
      "REST API Integration"
    ]
  },

  {
    id: "mobile-development",
    title: "Mobile App Development",
    description:
      "Developing cross-platform mobile applications with Ionic and building native Android features with Kotlin for practical application workflows.",
    icon: "Smartphone",
    badge: "Mobile",
    deliverables: [
      "Ionic Applications",
      "Android Features",
      "API Integration",
      "Application Workflows"
    ]
  },

  {
    id: "frontend-engineering",
    title: "Frontend Engineering",
    description:
      "Creating structured, maintainable frontend interfaces with reusable components, responsive layouts, and a focus on usability.",
    icon: "Layout",
    badge: "Core Expertise",
    deliverables: [
      "Angular & TypeScript",
      "Component Development",
      "Responsive UI",
      "Frontend Integration"
    ]
  },

  {
    id: "ui-design",
    title: "UI Design",
    description:
      "Exploring modern interface design with a focus on visual hierarchy, typography, layout, and creating engaging digital experiences.",
    icon: "Palette",
    badge: "Creative",
    deliverables: [
      "Interface Concepts",
      "Figma Designs",
      "Typography & Layout",
      "Visual Exploration"
    ]
  },

  {
    id: "creative-web",
    title: "Creative Web Experiences",
    description:
      "Combining frontend development with an interest in visual design to create distinctive and interactive web experiences.",
    icon: "Sparkles",
    badge: "Exploring",
    deliverables: [
      "Creative Interfaces",
      "Interactive Concepts",
      "Visual Experiments",
      "3D Web Exploration"
    ]
  },

  {
    id: "api-integration",
    title: "API Integration",
    description:
      "Connecting frontend and mobile applications with REST APIs to support data-driven features and application workflows.",
    icon: "Globe",
    badge: "Integration",
    deliverables: [
      "REST API Integration",
      "Data Handling",
      "Application Workflows",
      "Postman Testing"
    ]
  }
];

export const PROJECTS: Project[] = [
  {
    id: "rto-vehicle-documentation",
    title: "Chassis Image Capture App",
    subtitle: "Android App for Vehicle Image Capture & PDF Generation",
    description:
      "An Android application developed for RTO-related vehicle documentation, allowing users to capture vehicle and chassis images and generate them as PDF documents.",
    longDescription:
      "Developed an Android application using Kotlin and Android Studio to capture two required vehicle images: the vehicle image and chassis image. The captured images are processed and compiled into a PDF document for structured documentation and submission.",
    category: "Mobile Development",
    image: "/projects/rto-app.png",
    tags: ["Kotlin", "Android Studio", "Android", "PDF", "Image Processing"],
    githubUrl: "",
    demoUrl: "https://appstore.saihorizon.org",
    featured: true,
    metrics: "2-Image Capture Workflow"
  },

  {
    id: "petrol-pump-management",
    title: "Petrol Pump Management Website",
    subtitle: "Angular Web Application & Business Forms",
    description:
      "Contributed to an Angular-based web application for petrol pump operations, working on interface design and business forms for customer, employee, and counter sales management.",
    longDescription:
      "Contributed to the development of a petrol pump management website using Angular. Worked on the user interface and implemented business forms including Customer Master, Employee Master, and Counter Sale workflows.",
    category: "Web Development",
    image: "/projects/petrol-pump.jpg",
    tags: ["Angular", "TypeScript", "HTML", "CSS", "Forms"],
    githubUrl: "",
    demoUrl: "",
    featured: true,
    metrics: "Multiple Business Workflows"
  },

  {
    id: "conference-booking-app",
    title: "Conference Hall Booking App",
    subtitle: "Ionic Mobile Booking Application",
    description:
      "A cross-platform Ionic application for booking and managing company conference halls and rooms.",
    longDescription:
      "Developed a mobile application using Ionic and Angular for managing company conference hall and room bookings. The application supports booking workflows and integrates with backend services to manage availability and booking information.",
    category: "Mobile Development",
    image: "/projects/conference-booking.png",
    tags: ["Ionic", "Angular", "TypeScript", "REST API", "Mobile"],
    githubUrl: "",
    demoUrl: "https://appstore.saihorizon.org",
    featured: true,
    metrics: "Conference & Room Booking"
  },

  {
    id: "document-upload-system",
    title: "Sai Capture App",
    subtitle: "Mobile Upload & Web Document Management",
    description:
      "A mobile and web workflow for uploading, managing, downloading, and sharing vehicle-related documents and images.",
    longDescription:
      "Worked on an Ionic mobile application that allows users to upload vehicle images and documents including Aadhaar cards, PAN cards, insurance documents, and FIR copies. Uploaded documents can be accessed and downloaded through the web application, with an option to send documents and images as email attachments.",
    category: "Mobile & Web",
    image: "/projects/document-upload.jpg",
    tags: [
      "Ionic",
      "Angular",
      "TypeScript",
      "Document Upload",
      "Email Integration"
    ],
    githubUrl: "",
    demoUrl: "https://appstore.saihorizon.org",
    featured: true,
    metrics: "Mobile-to-Web Document Workflow"
  }
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: "exp-1",
    period: "2025 — Present",
    role: "Software Engineer & Frontend Developer",
    company: "Sai Service Pvt Ltd",
    location: "On-site.Mumbai,India",
    description: [
      
  "Developed responsive web applications using Angular and TypeScript, building reusable components and user-focused interfaces.",

  "Built cross-platform mobile applications using Ionic and developed native Android features using Kotlin and Android Studio.",

  "Integrated REST APIs and collaborated with designers and backend developers to deliver scalable, reliable, and user-friendly applications."

    ],
    techStack: ["Angular", "TypeScript", "Ionic", "Android Studio", "Node.js"],
    isCurrent: true
  },
  {
    id: "exp-2",
    period: "2024 — 2025",
    role: "Healthcare Associate",
    company: "NDS Infoserve Pvt Ltd",
    location: "On-site",
    description: [
      "Processed healthcare information using OCR and manual verification.",

      "Reviewed data for accuracy and completeness.",

      "Followed quality standards and compliance procedures."
    ],
    techStack: [],
    isCurrent: false
  },
    {
    id: "exp-3",
    period: "2023 , During Final Year of College",
    role: "IT Intern",
    company: "Softmusk Info Pvt Ltd",
    location: "Remote",
    description: [
     " Worked on website development using PHP.",

    "Contributed to a small appointment booking project.",

    "Gained early exposure to web development and practical project workflows."
    ],
    techStack: ["Bootstrap","PHP","MySql","React",],
    isCurrent: false
  }
];

export const EDUCATIONS: EducationItem[] = [
  {
    id: "edu-1",
    period: "2020 — 2023",
    degree: "Bachelor of Science in Information Technology",
    institution: "University of Mumbai",
    grade: "Cumulative GPA: 7.3 / 10",
    highlights: [
      "Built a foundation in software development and information technology",
      "Gained exposure to databases, programming concepts, and software development workflows"
    ]
  },
];

export const CERTIFICATES: CertificateItem[] = [
  {
    id: "cert-1",
    title: "Meta Certified Front-End Developer",
    issuer: "Meta (Coursera)",
    date: "2024",
    credentialId: "META-FED-98214B",
    credentialUrl: "https://coursera.org",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    skills: ["React", "JavaScript (ES6+)", "UI Architecture", "Testing & Jest"]
  },
  {
    id: "cert-2",
    title: "Three.js Journey & WebGL Creative Masterclass",
    issuer: "Bruno Simon - Three.js Journey",
    date: "2024",
    credentialId: "THREEJS-JRN-4401X",
    credentialUrl: "https://threejs-journey.com",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    skills: ["Three.js", "Shaders (GLSL)", "R3F", "Performance Optimization", "Physics"]
  },
  {
    id: "cert-3",
    title: "Google Cloud Certified Associate Cloud Engineer",
    issuer: "Google Cloud",
    date: "2023",
    credentialId: "GCP-ACE-77291Z",
    credentialUrl: "https://cloud.google.com/certification",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    skills: ["GCP Compute", "Cloud Run", "Identity & IAM", "Container Deployments"]
  },
  {
    id: "cert-4",
    title: "Advanced Figma UI/UX Design Systems Certification",
    issuer: "DesignX Academy",
    date: "2023",
    credentialId: "FIGMA-DS-10993C",
    credentialUrl: "https://figma.com",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
    skills: ["Design Tokens", "Auto-Layout 5", "Prototyping", "A11y Standards"]
  }
];

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    name: "Elena Rostova",
    role: "VP of Product Design",
    company: "Horizon Cybernetics",
    rating: 5,
    comment: "Suyash is that rare unicorn developer who possesses deep software engineering discipline while demonstrating an intuitive mastery of 3D motion, shaders, and micro-interactions. The robot mascot and smooth scroll interactions are genuinely world-class.",
    date: "September 2026"
  },
  {
    id: "rev-2",
    name: "Marcus Vance",
    role: "Founder & CEO",
    company: "CyberVolt Studios",
    rating: 5,
    comment: "Working with Suyash was phenomenal. He transformed our complex product idea into a cinematic cyberpunk web application that blew our investors away. Fast communication, immaculate TypeScript code, and unbelievable attention to detail.",
    date: "August 2026"
  },
  {
    id: "rev-3",
    name: "Priya Nair",
    role: "Lead Systems Architect",
    company: "Starlight Digital",
    rating: 5,
    comment: "His grasp of performance optimization in Three.js and React is top tier. He maintained rock-solid 60 FPS while rendering high-detail models and audio synthesizers. I'd hire him again in a heartbeat.",
    date: "July 2026"
  }
];
