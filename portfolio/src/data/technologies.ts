import type { Technology } from "./types";

export const technologies: Technology[] = [
  // Frontend
  { id: "html5", name: "HTML5", category: "frontend", brandColor: "#E34F26", url: "https://developer.mozilla.org/es/docs/Glossary/HTML5", inStack: true },
  { id: "css3", name: "CSS3", category: "frontend", brandColor: "#2965F1", url: "https://developer.mozilla.org/es/docs/Web/CSS", inStack: true },
  { id: "javascript", name: "JavaScript", category: "frontend", brandColor: "#F7DF1E", url: "https://developer.mozilla.org/es/docs/Web/JavaScript", inStack: true },
  { id: "typescript", name: "TypeScript", category: "frontend", brandColor: "#3B82DC", url: "https://www.typescriptlang.org/", inStack: true },
  { id: "react", name: "React", category: "frontend", brandColor: "#61DAFB", url: "https://react.dev/", inStack: true },
  { id: "nextjs", name: "Next.js", category: "frontend", url: "https://nextjs.org/", inStack: true },
  { id: "tailwindcss", name: "Tailwind CSS", category: "frontend", brandColor: "#06B6D4", url: "https://tailwindcss.com/", inStack: true },
  { id: "bootstrap", name: "Bootstrap", category: "frontend", brandColor: "#A07BDB", url: "https://getbootstrap.com/", inStack: true },
  { id: "vite", name: "Vite", category: "frontend", inStack: false },
  { id: "react-router", name: "React Router DOM", category: "frontend", inStack: false },
  { id: "css-modules", name: "CSS Modules", category: "frontend", inStack: false },
  { id: "axios", name: "Axios", category: "frontend", inStack: false },
  { id: "formik", name: "Formik", category: "frontend", inStack: false },
  { id: "react-icons", name: "React Icons", category: "frontend", url: "https://react-icons.github.io/react-icons/", inStack: false },
  { id: "framer-motion", name: "Framer Motion", category: "frontend", inStack: false },
  { id: "mui", name: "Material UI", category: "frontend", url: "https://mui.com/", inStack: false },

  // Backend
  { id: "nodejs", name: "Node.js", category: "backend", brandColor: "#5FA04E", url: "https://nodejs.org/", inStack: true },
  { id: "express", name: "Express.js", category: "backend", url: "https://expressjs.com/", inStack: true },
  { id: "java", name: "Java", category: "backend", brandColor: "#E76F00", inStack: true },
  { id: "spring-boot", name: "Spring Boot", category: "backend", brandColor: "#6DB33F", url: "https://spring.io/projects/spring-boot", inStack: true },
  { id: "nestjs", name: "NestJS", category: "backend", inStack: false },
  { id: "typeorm", name: "TypeORM", category: "backend", inStack: false },
  { id: "prisma", name: "Prisma", category: "backend", url: "https://www.prisma.io/", inStack: false },
  { id: "socketio", name: "Socket.IO", category: "backend", url: "https://socket.io/", inStack: false },
  { id: "mongoose", name: "Mongoose", category: "backend", inStack: false },
  { id: "jwt", name: "JWT", category: "backend", inStack: false },
  { id: "bcrypt", name: "Bcrypt", category: "backend", inStack: false },
  { id: "cors", name: "CORS", category: "backend", inStack: false },

  // Bases de datos
  { id: "postgresql", name: "PostgreSQL", category: "database", brandColor: "#5B8DEF", url: "https://www.postgresql.org/", inStack: true },
  { id: "mariadb", name: "MariaDB", category: "database", url: "https://mariadb.org/", inStack: true },
  { id: "mongodb", name: "MongoDB", category: "database", brandColor: "#47A248", url: "https://www.mongodb.com/", inStack: true },

  // DevOps e infraestructura
  { id: "docker", name: "Docker", category: "devops", brandColor: "#2496ED", url: "https://www.docker.com/", inStack: true },
  { id: "sqs", name: "SQS", category: "devops", brandColor: "#FF4F8B", inStack: true },
  { id: "vercel", name: "Vercel", category: "devops", url: "https://vercel.com/", inStack: true },
  { id: "railway", name: "Railway", category: "devops", url: "https://railway.com/", inStack: true },
  { id: "github-actions", name: "GitHub Actions", category: "devops", url: "https://github.com/features/actions", inStack: false },
  { id: "digitalocean", name: "DigitalOcean", category: "devops", url: "https://www.digitalocean.com/", inStack: false },

  // Herramientas
  { id: "git", name: "Git", category: "tools", brandColor: "#F05032", url: "https://git-scm.com/", inStack: true },
  { id: "github", name: "GitHub", category: "tools", url: "https://github.com/", inStack: true },

  // Servicios de terceros usados en proyectos
  { id: "auth0", name: "Auth0", category: "services", inStack: false },
  { id: "stripe", name: "Stripe", category: "services", inStack: false },
  { id: "cloudinary", name: "Cloudinary", category: "services", inStack: false },
  { id: "firebase", name: "Firebase", category: "services", url: "https://firebase.google.com/", inStack: false },
  { id: "whatsapp-cloud-api", name: "WhatsApp Cloud API", category: "services", url: "https://developers.facebook.com/docs/whatsapp/cloud-api", inStack: false },
];
