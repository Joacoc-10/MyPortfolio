import { IProjects } from "@/types/Pojects";

export const projects: IProjects[] = [
  {
    id: 1,
    name: "Portfolio v1",
    imageSrc:
      "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM1.png?updatedAt=1758201256159",
    rol: "Front-end",
    description:
      "Desarrollé este proyecto durante el M1 del Bootcamp de Henry para aplicar los fundamentos del desarrollo front-end. El objetivo era construir un portafolio web estático y un formulario dinámico que permitiera a los usuarios agregar elementos a una sección personalizada.",
    technologies: {
      frontEnd: ["HTML", "CSS", "JavaScript"]},
    links: {
      gitHubFront: "https://github.com/Joacoc-10/PM1---Portfolio-v1",
      deploy: "https://portfolio-v1-orcin-eta.vercel.app/",
    },
  },

  {
    id: 2,
    name: "Movie Reel",
    imageSrc: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM2.png?updatedAt=1758201256321",
    rol: "Full-stack",
    description: "Este fue mi primer proyecto Full-stack, diseñado para poner en práctica la conexión entre el frontend y el backend. Creé una aplicación web que funciona como una cartelera de películas, permitiendo a los usuarios añadir nuevas películas a una base de datos a través de un formulario controlado en el frontend.",
     technologies: {
    frontEnd: ["HTML", "CSS", "JavaScript", "Axios"],
    backEnd: ["Node.js", "Express.js", "MongoDB", "Mongoose"],
  },
  links: {
    gitHubFront: "https://github.com/Joacoc-10/PM2---MovieeReel",
    deploy: "https://movieereelpm2.vercel.app/index.html"
  }
  },

  {
    id: 3,
    name: "Bodega Cepa Real",
    imageSrc: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM3.png?updatedAt=1758201256355",
    rol: "Full-stack",
    description: "Un proyecto personal enfocado en el manejo de turnos. La aplicación incluye autenticación de usuarios y funcionalidades CRUD para la gestión de citas, con los datos persistentes en una base de datos.",
    technologies: {
      frontEnd: ["React", "Vite" , "React Router Dom", "CSS Modules", "JavaScript", "Axios"],
      backEnd: ["Node.js", "TypeScript", " Express.js", "PostgreSQL", "TypeORM", "Bcrypt", "CORS"]
    },
    links: {
      gitHubFront: "https://github.com/Joacoc-10/PM3---Bodega-Cepa-Real",
      deploy: "https://bodega-cepa-real.vercel.app/home",
    }
  },

  {
    id: 4,
    name: "Futura Tech",
    imageSrc: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM4.png?updatedAt=1758201255537",
    rol: "Front-end",
    description: "En este proyecto, asumí el rol de Front-end Developer para construir un e-commerce de productos electrónicos. Mi principal desafío fue integrar y conectar un backend ya desarrollado, creando un flujo completo de usuario que incluyó registro, inicio de sesión, navegación de productos y un proceso de compra simulado. Este proyecto me permitió demostrar mi capacidad para consumir APIs y desarrollar una experiencia de usuario completa.",
    technologies: {
      frontEnd: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Axios", "Formik"],
      backEnd: ["Node.js", "TypeScript", "Express.js", "PostgreSQL", "TypeORM", "JWT"]
    },
    links: {
      gitHubFront: "https://github.com/Joacoc-10/PM4----Futura-Tech",
    }
  },

  {
    id: 5,
    name: "Lienzo Culinario",
    imageSrc: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PF.png?updatedAt=1758201256430",
    rol: "Front-end",
    description: "Como parte del proyecto final del bootcamp, colaboré con un equipo de 6 desarrolladores para construir un e-commerce de comida personalizado. Mi rol se centró en el desarrollo front-end y el diseño de la interfaz de usuario, con el objetivo de crear una experiencia intuitiva y fluida. Implementamos un flujo de trabajo completo que incluyó un robusto sistema de autenticación con Auth0 y una pasarela de pago simulada con Stripe. Este proyecto fue una experiencia invaluable en trabajo en equipo y comunicación, demostrando nuestra capacidad para gestionar un proyecto de principio a fin.",
    technologies: {
      frontEnd: ["Next.js","React","TypeScript","Tailwind CSS","Auth0","Stripe","Axios","Formik","Framer Motion"],
      backEnd: ["Node.js","TypeScript","NestJS","PostgreSQL","TypeORM","Auth0","Stripe","Cloudinary"]
    },
    links: {
      gitHubFront: "https://github.com/Joacoc-10/LienzoCulinarioFront",
      gitHubback: "https://github.com/Joacoc-10/LienzoCulinarioBack",
      deploy: "https://lienzofront.vercel.app/",
    }
  }
];
