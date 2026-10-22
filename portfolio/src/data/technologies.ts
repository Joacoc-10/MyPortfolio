import type { Technology } from "./types";

export const technologies: Technology[] = [
  // Frontend
  { id: "html5", name: "HTML5", category: "frontend", url: "https://developer.mozilla.org/es/docs/Glossary/HTML5", inStack: true },
  { id: "css3", name: "CSS3", category: "frontend", url: "https://developer.mozilla.org/es/docs/Web/CSS", inStack: true },
  { id: "javascript", name: "JavaScript", category: "frontend", url: "https://developer.mozilla.org/es/docs/Web/JavaScript", inStack: true },
  { id: "typescript", name: "TypeScript", category: "frontend", url: "https://www.typescriptlang.org/", inStack: true },
  { id: "react", name: "React", category: "frontend", url: "https://react.dev/", inStack: true },
  { id: "nextjs", name: "Next.js", category: "frontend", url: "https://nextjs.org/", inStack: true },
  { id: "tailwindcss", name: "Tailwind CSS", category: "frontend", url: "https://tailwindcss.com/", inStack: true },
  { id: "bootstrap", name: "Bootstrap", category: "frontend", url: "https://getbootstrap.com/", inStack: true },
  { id: "vite", name: "Vite", category: "frontend", inStack: false },
  { id: "react-router", name: "React Router DOM", category: "frontend", inStack: false },
  { id: "css-modules", name: "CSS Modules", category: "frontend", inStack: false },
  { id: "axios", name: "Axios", category: "frontend", inStack: false },
  { id: "formik", name: "Formik", category: "frontend", inStack: false },
  { id: "react-icons", name: "React Icons", category: "frontend", url: "https://react-icons.github.io/react-icons/", inStack: false },
  { id: "framer-motion", name: "Framer Motion", category: "frontend", inStack: false },

  // Backend
  { id: "nodejs", name: "Node.js", category: "backend", url: "https://nodejs.org/", inStack: true },
  { id: "express", name: "Express.js", category: "backend", url: "https://expressjs.com/", inStack: true },
  { id: "java", name: "Java", category: "backend", inStack: true },
  { id: "spring-boot", name: "Spring Boot", category: "backend", url: "https://spring.io/projects/spring-boot", inStack: true },
  { id: "nestjs", name: "NestJS", category: "backend", inStack: false },
  { id: "typeorm", name: "TypeORM", category: "backend", inStack: false },
  { id: "mongoose", name: "Mongoose", category: "backend", inStack: false },
  { id: "jwt", name: "JWT", category: "backend", inStack: false },
  { id: "bcrypt", name: "Bcrypt", category: "backend", inStack: false },
  { id: "cors", name: "CORS", category: "backend", inStack: false },

  // Bases de datos
  { id: "postgresql", name: "PostgreSQL", category: "database", url: "https://www.postgresql.org/", inStack: true },
  { id: "mariadb", name: "MariaDB", category: "database", url: "https://mariadb.org/", inStack: true },
  { id: "mongodb", name: "MongoDB", category: "database", url: "https://www.mongodb.com/", inStack: true },

  // DevOps e infraestructura
  { id: "docker", name: "Docker", category: "devops", url: "https://www.docker.com/", inStack: true },
  { id: "sqs", name: "SQS", category: "devops", inStack: true },
  { id: "vercel", name: "Vercel", category: "devops", url: "https://vercel.com/", inStack: true },
  { id: "railway", name: "Railway", category: "devops", url: "https://railway.com/", inStack: true },

  // Herramientas
  { id: "git", name: "Git", category: "tools", url: "https://git-scm.com/", inStack: true },
  { id: "github", name: "GitHub", category: "tools", url: "https://github.com/", inStack: true },

  // Servicios de terceros usados en proyectos
  { id: "auth0", name: "Auth0", category: "services", inStack: false },
  { id: "stripe", name: "Stripe", category: "services", inStack: false },
  { id: "cloudinary", name: "Cloudinary", category: "services", inStack: false },
];
