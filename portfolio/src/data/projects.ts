import type { Project } from "./types";

/**
 * Proyectos profesionales (se muestran dentro de su empresa en Experiencia),
 * personales y del bootcamp Henry (se muestran en Proyectos independientes).
 * El orden del arreglo es el orden de visualización: más reciente primero.
 */
export const projects: Project[] = [
  // ───────────── Profesionales · Coralunity ─────────────
  {
    id: "order-a",
    kind: "professional",
    companyId: "coralunity",
    name: "Order-A",
    featured: true,
    inProduction: true,
    stage: "pilot",
    summary: {
      es: "Plataforma SaaS de gestión integral para restaurantes y comercios gastronómicos. Los clientes escanean un código QR, consultan el menú y piden desde su teléfono, sin instalar ninguna aplicación; el comercio gestiona pedidos, mesas, cocina, caja y reservas desde un sistema centralizado, con información en tiempo real.",
      en: "An all-in-one SaaS platform for restaurants and food businesses. Customers scan a QR code, browse the menu and order from their phones with no app to install, while the business manages orders, tables, kitchen, cashier and reservations from a single system with real-time information.",
    },
    problem: {
      es: "Digitaliza y simplifica la operación gastronómica, reduce errores y mejora la coordinación entre salón, cocina y caja.",
      en: "It digitizes and simplifies restaurant operations, reduces errors and improves coordination between the floor, kitchen and cashier.",
    },
    // Contribuciones verificadas con la auditoría del repositorio (historial de Git) y confirmadas por Joaquín.
    contributions: {
      es: [
        "Diseño de interfaces y experiencia de usuario, y desarrollo de gran parte del frontend y backend",
        "Módulos de pedidos, mesas, cocina, caja y reservas",
        "Suscripciones y facturación con Stripe",
        "Mecanismos antifraude y verificación de clientes",
        "Desarrollo de backoffice administrativo, APIs e integraciones externas, con participación en arquitectura, seguridad y despliegues",
      ],
      en: [
        "Interface and user experience design, and development of a large part of the frontend and backend",
        "Order, table, kitchen, cashier and reservation modules",
        "Subscriptions and billing with Stripe",
        "Anti-fraud mechanisms and customer verification",
        "Development of the administrative backoffice, APIs and external integrations, with involvement in architecture, security and deployments",
      ],
    },
    techIds: [
      "react",
      "typescript",
      "mui",
      "nestjs",
      "prisma",
      "postgresql",
      "socketio",
      "stripe",
      "firebase",
      "whatsapp-cloud-api",
      "github-actions",
      "digitalocean",
    ],
    links: { deploy: "https://order-a.com/" },
  },
  {
    id: "nexvia",
    kind: "professional",
    companyId: "coralunity",
    name: "Nexvia",
    inProduction: true,
    summary: {
      es: "Participación como Full Stack Developer desde las primeras etapas de la plataforma.",
      en: "Full Stack Developer on the platform from its early stages.",
    },
    contributions: {
      es: [
        "Migración de la landing",
        "Reestructuración de secciones y pantallas",
        "Desarrollo de formularios",
        "Implementación de funcionalidades de la plataforma",
      ],
      en: [
        "Landing page migration",
        "Restructuring of sections and screens",
        "Form development",
        "Implementation of platform features",
      ],
    },
    // PENDING: stack (auditoría del repo)
    techIds: [],
    links: { deploy: "https://nexvia.io/" },
  },
  {
    id: "ues-mercado-libre",
    kind: "professional",
    companyId: "coralunity",
    name: "UES × Mercado Libre",
    inProduction: true,
    summary: {
      es: "Integración de sistemas logísticos con Mercado Libre.",
      en: "Integration of logistics systems with Mercado Libre.",
    },
    contributions: {
      es: [
        "Desarrollo de funcionalidades frontend y backend",
        "APIs REST, webhooks, procesamiento asíncrono, OAuth y auditoría",
      ],
      en: [
        "Frontend and backend feature development",
        "REST APIs, webhooks, asynchronous processing, OAuth and auditing",
      ],
    },
    techIds: ["java", "spring-boot", "react", "typescript", "mariadb", "docker", "sqs"],
    // PENDING: URL pública (si existe). No se usan logos de UES ni de Mercado Libre.
    links: {},
  },

  // ───────────── Profesionales · ZatoBox ─────────────
  {
    id: "zatobox",
    kind: "professional",
    companyId: "zatobox",
    // Nombre descriptivo del proyecto dentro de la empresa; confirmar con Joaquín (ver PENDING.md)
    name: "ZatoBox POS",
    inProduction: true,
    summary: {
      es: "Plataforma POS y de gestión de inventario para pequeños comercios, con funcionalidades de ventas, productos, stock y seguimiento de operaciones.",
      en: "A POS and inventory management platform for small businesses, with features for sales, products, stock and operations tracking.",
    },
    // Contribuciones y tecnologías confirmadas por Joaquín a partir de la auditoría del repositorio (ZatoBox/main).
    // Formik no se incluye: pendiente de confirmar.
    contributions: {
      es: [
        "Interfaces de productos, inventario y perfil siguiendo diseños de Figma",
        "Adaptación responsive de las pantallas de productos, inventario y perfil",
        "Refactorización y modularización del formulario de productos",
        "Paginación del listado principal e integración con el endpoint correspondiente",
        "Unificación de estilos y encabezados",
      ],
      en: [
        "Product, inventory and profile interfaces following Figma designs",
        "Responsive adaptation of the product, inventory and profile screens",
        "Refactoring and modularization of the product form",
        "Pagination of the main listing and integration with its endpoint",
        "Unified styles and headers",
      ],
    },
    techIds: ["nextjs", "react", "typescript", "tailwindcss", "react-icons"],
    links: { deploy: "https://www.zatobox.io/" },
  },

  // ───────────── Personales ─────────────
  {
    id: "olibar",
    kind: "personal",
    name: "OliBar",
    summary: {
      es: "Menú digital responsive. Desarrollado de forma independiente, fuera de mi trabajo en Coralunity.",
      en: "Responsive digital menu. Built independently, outside my work at Coralunity.",
    },
    techIds: ["react", "typescript", "tailwindcss", "vercel"],
    links: { deploy: "https://oli-bar.vercel.app/" },
  },

  // ───────────── Bootcamp Henry ─────────────
  // PENDING: los repositorios de GitHub estaban comentados en la versión anterior (ver PENDING.md)
  {
    id: "lienzo-culinario",
    kind: "bootcamp",
    name: "Lienzo Culinario",
    summary: {
      es: "Como parte del proyecto final del bootcamp, realicé con un equipo de 6 desarrolladores para construir un e-commerce de comida personalizado. Mi rol se centró en el desarrollo front-end y el diseño de la interfaz de usuario, con el objetivo de crear una experiencia intuitiva y fluida. Implementamos un flujo de trabajo completo que incluyó un robusto sistema de autenticación con Auth0 y una pasarela de pago simulada con Stripe. Este proyecto fue una experiencia invaluable en trabajo en equipo y comunicación, demostrando nuestra capacidad para gestionar un proyecto de principio a fin.",
      en: "As part of the bootcamp final project, I worked with a team of 6 developers to build a custom food e-commerce. My role focused on front-end development and UI design, aiming to create an intuitive, smooth experience. We implemented a full workflow including a robust authentication system with Auth0 and a simulated Stripe payment gateway. This project was invaluable for teamwork and communication, demonstrating our ability to manage a project end-to-end.",
    },
    techIds: ["nextjs", "react", "typescript", "tailwindcss", "framer-motion", "formik", "axios", "auth0", "stripe", "nodejs", "nestjs", "postgresql", "typeorm", "cloudinary"],
    image: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PF.png?updatedAt=1758201256430",
    links: { deploy: "https://lienzofront.vercel.app/" },
  },
  {
    id: "futura-tech",
    kind: "bootcamp",
    name: "Futura Tech",
    summary: {
      es: "Proyecto de especialización en Front End para construir un e-commerce de tecnología, conectando con un backend ya proporcionado. Mi objetivo fue desarrollar un Front End completo y funcional, incluyendo registro de usuarios, navegación de productos, carrito de compras y flujo de checkout simulado, aplicando buenas prácticas, estilos consistentes y animaciones con React, Next.js y Tailwind CSS.",
      en: "A Front End specialization project to build a tech e-commerce connected to a provided backend. My goal was to develop a complete, functional Front End including user registration, product browsing, shopping cart and a simulated checkout flow, applying best practices, consistent styling and animations with React, Next.js and Tailwind CSS.",
    },
    techIds: ["nextjs", "react", "typescript", "tailwindcss", "formik", "axios", "nodejs", "express", "postgresql", "typeorm", "jwt"],
    image: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM4.png?updatedAt=1758201255537",
    links: { deploy: "https://futuratech.vercel.app/" },
  },
  {
    id: "bodega-cepa-real",
    kind: "bootcamp",
    name: "Bodega Cepa Real",
    summary: {
      es: "El proyecto se centra en crear un flujo de datos completo que permite a los usuarios registrarse y autenticarse para, posteriormente, administrar sus propias reservas de cata de vinos. La solución garantiza la autonomía del usuario para la creación y cancelación de turnos y demuestra la capacidad de construir un sistema simple pero funcional.",
      en: "The project focuses on creating a complete data flow that allows users to register and authenticate, and then manage their own wine tasting reservations. The solution ensures user autonomy for creating and cancelling bookings and demonstrates the ability to build a simple yet functional system.",
    },
    techIds: ["react", "vite", "react-router", "css-modules", "javascript", "axios", "nodejs", "typescript", "express", "postgresql", "typeorm", "bcrypt", "cors"],
    image: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM3.png?updatedAt=1758201256355",
    links: { deploy: "https://bodega-cepa-real.vercel.app/" },
  },
  {
    id: "movie-reel",
    kind: "bootcamp",
    name: "Movie Reel",
    summary: {
      es: "Este fue mi primer proyecto Full-stack, diseñado para poner en práctica la conexión entre el frontend y el backend. El objetivo era construir una cartelera de películas funcional, donde los usuarios pudieran crear, almacenar y visualizar películas en una base de datos. Incluye un formulario controlado en el frontend y comunicación con el backend usando Axios.",
      en: "This was my first Full-stack project, designed to practice connecting frontend and backend. The objective was to build a functional movie listing where users could create, store and view movies in a database. It includes a controlled form on the frontend and communication with the backend using Axios.",
    },
    techIds: ["html5", "css3", "javascript", "axios", "nodejs", "express", "mongodb", "mongoose"],
    image: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM2.png?updatedAt=1758201256321",
    links: { deploy: "https://movieereelpm2.vercel.app/index.html" },
  },
  {
    id: "portfolio-v1",
    kind: "bootcamp",
    name: "Portfolio v1",
    summary: {
      es: "Desarrollé este proyecto durante el M1 del Bootcamp de Henry para aplicar los fundamentos del desarrollo front-end. El objetivo era construir un portafolio web estático e incorporar un formulario controlado para registrar una sección de cosas que me gustan hacer, con los datos guardados únicamente en LocalStorage.",
      en: "I developed this project during Module 1 of the Henry Bootcamp to apply frontend development fundamentals. The goal was to build a static portfolio website and include a controlled form to record a list of things I enjoy, with data stored only in LocalStorage.",
    },
    techIds: ["html5", "css3", "javascript"],
    image: "https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/Captura%20de%20pantalla%20PM1.png?updatedAt=1758201256159",
    links: { deploy: "https://portfolio-v1-orcin-eta.vercel.app/" },
  },
];
