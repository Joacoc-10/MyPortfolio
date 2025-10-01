import { IProjects } from "@/types/Pojects";

export const projects: IProjects[] = [
  {
    id: 1,
    name: "Portfolio v1",
    imageSrc:
      "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM1.png?updatedAt=1758201256159",
    rol: "Front-end",
    description:
      "Desarrollé este proyecto durante el M1 del Bootcamp de Henry para aplicar los fundamentos del desarrollo front-end. El objetivo era construir un portafolio web estático e incorporar un formulario controlado para registrar una sección de cosas que me gustan hacer, con los datos guardados únicamente en LocalStorage.",
    technologies: {
      frontEnd: ["HTML", "CSS", "JavaScript"]},
    links: {
      // gitHubFront: "https://github.com/Joacoc-10/PM1---Portfolio-v1",
      deploy: "https://portfolio-v1-orcin-eta.vercel.app/",
    },
  },

  {
    id: 2,
    name: "Movie Reel",
    imageSrc: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM2.png?updatedAt=1758201256321",
    rol: "Full-stack",
    description: "Este fue mi primer proyecto Full-stack, diseñado para poner en práctica la conexión entre el frontend y el backend. El objetivo era construir una cartelera de películas funcional, donde los usuarios pudieran crear, almacenar y visualizar películas en una base de datos. Incluye un formulario controlado en el frontend y comunicación con el backend usando Axios.",
     technologies: {
    frontEnd: ["HTML", "CSS", "JavaScript", "Axios"],
    backEnd: ["Node.js", "Express.js", "MongoDB", "Mongoose"],
  },
  links: {
    // gitHubFront: "https://github.com/Joacoc-10/PM2---MovieeReel",
    deploy: "https://movieereelpm2.vercel.app/index.html"
  }
  },

  {
    id: 3,
    name: "Bodega Cepa Real",
    imageSrc: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM3.png?updatedAt=1758201256355",
    rol: "Full-stack",
    description: "El proyecto se centra en crear un flujo de datos completo que permite a los usuarios registrarse y autenticarse para, posteriormente, administrar sus propias reservas de cata de vinos. La solución garantiza la autonomía del usuario para la creación y cancelación de turnos y demuestra la capacidad de construir un sistema simple pero funcional.",
    technologies: {
      frontEnd: ["React", "Vite" , "React Router Dom", "CSS Modules", "JavaScript", "Axios"],
      backEnd: ["Node.js", "TypeScript", " Express.js", "PostgreSQL", "TypeORM", "Bcrypt", "CORS"]
    },
    links: {
      // gitHubFront: "https://github.com/Joacoc-10/PM3---Bodega-Cepa-Real",
      deploy: "https://bodega-cepa-real.vercel.app/",
    }
  },

  {
    id: 4,
    name: "Futura Tech",
    imageSrc: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM4.png?updatedAt=1758201255537",
    rol: "Front-end",
    description: "Proyecto de especialización en Front End para construir un e-commerce de tecnología, conectando con un backend ya proporcionado. Mi objetivo fue desarrollar un Front End completo y funcional, incluyendo registro de usuarios, navegación de productos, carrito de compras y flujo de checkout simulado, aplicando buenas prácticas, estilos consistentes y animaciones con React, Next.js y Tailwind CSS.",
    technologies: {
      frontEnd: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Axios", "Formik"],
      backEnd: ["Node.js", "TypeScript", "Express.js", "PostgreSQL", "TypeORM", "JWT"]
    },
    links: {
      // gitHubFront: "https://github.com/Joacoc-10/PM4----Futura-Tech",
      deploy: "https://futuratech.vercel.app/",
    }
  },

  {
    id: 5,
    name: "Lienzo Culinario",
    imageSrc: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PF.png?updatedAt=1758201256430",
    rol: "Front-end",
    description: "Como parte del proyecto final del bootcamp, realicé con un equipo de 6 desarrolladores para construir un e-commerce de comida personalizado. Mi rol se centró en el desarrollo front-end y el diseño de la interfaz de usuario, con el objetivo de crear una experiencia intuitiva y fluida. Implementamos un flujo de trabajo completo que incluyó un robusto sistema de autenticación con Auth0 y una pasarela de pago simulada con Stripe. Este proyecto fue una experiencia invaluable en trabajo en equipo y comunicación, demostrando nuestra capacidad para gestionar un proyecto de principio a fin.",
    technologies: {
      frontEnd: ["Next.js","React","TypeScript","Tailwind CSS","Auth0","Stripe","Axios","Formik","Framer Motion"],
      backEnd: ["Node.js","TypeScript","NestJS","PostgreSQL","TypeORM","Auth0","Stripe","Cloudinary"]
    },
    links: {
      // gitHubFront: "https://github.com/Joacoc-10/LienzoCulinarioFront",
      // gitHubback: "https://github.com/Joacoc-10/LienzoCulinarioBack",
      deploy: "https://lienzofront.vercel.app/",
    }
  }
];
