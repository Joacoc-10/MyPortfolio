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
      es: "Plataforma SaaS para restaurantes y comercios gastronómicos. Los clientes escanean un código QR, consultan el menú y piden desde su teléfono, sin instalar ninguna aplicación. El comercio gestiona pedidos, mesas, cocina, caja y reservas desde un único sistema.",
      en: "A SaaS platform for restaurants and food businesses. Customers scan a QR code, browse the menu and order from their phones with no app to install. The business manages orders, tables, kitchen, cashier and reservations from a single system.",
    },
    problem: {
      es: "Digitaliza la operación gastronómica: reduce errores, mejora la coordinación entre salón, cocina y caja, y da al comercio información en tiempo real.",
      en: "It digitizes restaurant operations: it reduces errors, improves coordination between the floor, kitchen and cashier, and gives the business real-time information.",
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
    media: [
      {
        type: "image",
        src: "/images/projects/order-a/shot-01-inicio.webp",
        alt: { es: "Captura de Order-A: Inicio", en: "Screenshot of Order-A: Home" },
        caption: { es: "Inicio", en: "Home" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/order-a/shot-02-como-funciona.webp",
        alt: { es: "Captura de Order-A: Cómo funciona", en: "Screenshot of Order-A: How it works" },
        caption: { es: "Cómo funciona", en: "How it works" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/order-a/shot-03-rubros.webp",
        alt: { es: "Captura de Order-A: Rubros", en: "Screenshot of Order-A: Business types" },
        caption: { es: "Rubros", en: "Business types" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/order-a/shot-04-planes.webp",
        alt: { es: "Captura de Order-A: Planes", en: "Screenshot of Order-A: Plans" },
        caption: { es: "Planes", en: "Plans" },
        width: 1920,
        height: 1200,
      },
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
      es: "Marketplace de transporte y logística donde personas y empresas publican solicitudes de envío, reciben cotizaciones de transportistas disponibles y comparan ofertas.",
      en: "A transport and logistics marketplace where individuals and businesses post shipment requests, receive quotes from available carriers and compare offers.",
    },
    problem: {
      es: "Simplifica la contratación de transporte al reunir solicitudes, transportistas y cotizaciones en una sola plataforma que opera en Uruguay.",
      en: "It simplifies hiring transport by bringing requests, carriers and quotes together in a single platform that operates in Uruguay.",
    },
    // Auditoría de los repositorios (app, landing y API) y confirmación de Joaquín. Participación principalmente frontend:
    // sin backend. Las pantallas de vehículo y mudanza están en una rama de feature; no se afirma que estén desplegadas.
    contributions: {
      es: [
        "Migración de la landing de React a Astro, con mejoras de SEO y rendimiento móvil",
        "Interfaces responsive a partir de los diseños disponibles durante mi participación",
        "Formularios de registro de transportistas y de contacto, conectados con la API",
        "Historial de envíos y visualización de cotizaciones",
        "Login, borradores y parte del flujo de creación de envíos",
      ],
      en: [
        "Migration of the landing page from React to Astro, with SEO and mobile performance improvements",
        "Responsive interfaces built from the designs available during my time on the project",
        "Carrier registration and contact forms, connected to the API",
        "Shipment history and quote viewing",
        "Login, drafts and part of the shipment creation flow",
      ],
    },
    // JavaScript (JSX); TypeScript solo aparece de forma marginal (tema), por eso no se lista.
    techIds: ["astro", "react", "javascript", "mui", "formik", "yup", "axios", "framer-motion"],
    media: [
      {
        type: "image",
        src: "/images/projects/nexvia/shot-01-inicio.webp",
        alt: { es: "Captura de Nexvia: Inicio", en: "Screenshot of Nexvia: Home" },
        caption: { es: "Inicio", en: "Home" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/nexvia/shot-02-como-usar.webp",
        alt: { es: "Captura de Nexvia: Cómo usar la plataforma", en: "Screenshot of Nexvia: How to use the platform" },
        caption: { es: "Cómo usar la plataforma", en: "How to use the platform" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/nexvia/shot-03-formulario-envio.webp",
        alt: { es: "Captura de Nexvia: Formulario de envío", en: "Screenshot of Nexvia: Shipment form" },
        caption: { es: "Formulario de envío", en: "Shipment form" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/nexvia/shot-04-seguridad.webp",
        alt: { es: "Captura de Nexvia: Seguridad", en: "Screenshot of Nexvia: Security" },
        caption: { es: "Seguridad", en: "Security" },
        width: 1920,
        height: 1200,
      },
    ],
    links: { deploy: "https://nexvia.io/" },
  },
  {
    id: "ues-mercado-libre",
    kind: "professional",
    companyId: "coralunity",
    name: "UES × Mercado Libre",
    inProduction: true,
    summary: {
      es: "Hub de integración logística que conecta Mercado Libre con el sistema de paquetería de UES, automatizando la creación y gestión de envíos a partir de las operaciones del marketplace.",
      en: "A logistics integration hub connecting Mercado Libre with UES's shipping system, automating shipment creation and management from marketplace transactions.",
    },
    problem: {
      es: "Automatiza procesos logísticos que antes requerían intervención manual, evita operaciones duplicadas y mejora la trazabilidad de los envíos.",
      en: "Automates previously manual logistics processes, prevents duplicate operations and improves shipment traceability.",
    },
    // Auditoría de ues-meli-hub y confirmación de Joaquín. Trabajó bajo el liderazgo técnico de Alvin (estructura inicial del backend Java
    // y decisiones de arquitectura). Sistema interno de un cliente: sin enlace, métricas ni detalles técnicos confidenciales.
    contributions: {
      es: [
        "Desarrollo de servicios backend e integraciones con Java, Spring Boot y APIs externas",
        "Implementación de webhooks, colas de mensajes y procesamiento asíncrono",
        "Mecanismos de reintentos, recuperación de eventos y manejo de errores",
        "Interfaces administrativas para gestionar clientes, cuentas y auditoría de operaciones",
        "Participación en la migración del backend a Java y Spring Boot, y desarrollo de pruebas automatizadas",
      ],
      en: [
        "Development of backend services and integrations with Java, Spring Boot and external APIs",
        "Implementation of webhooks, message queues and asynchronous processing",
        "Retry, event recovery and error handling mechanisms",
        "Admin interfaces to manage clients, accounts and operation auditing",
        "Involved in migrating the backend to Java and Spring Boot, and in building automated tests",
      ],
    },
    techIds: ["java", "spring-boot", "hibernate", "flyway", "mariadb", "sqs", "react", "typescript", "docker"],
    // Sistema interno: sin URL pública. No se usan logos de UES ni de Mercado Libre.
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
    media: [
      {
        type: "image",
        src: "/images/projects/zatobox/shot-01-inicio.webp",
        alt: { es: "Captura de ZatoBox POS: Inicio", en: "Screenshot of ZatoBox POS: Home" },
        caption: { es: "Inicio", en: "Home" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/zatobox/shot-02-funciones.webp",
        alt: { es: "Captura de ZatoBox POS: Funciones", en: "Screenshot of ZatoBox POS: Features" },
        caption: { es: "Funciones", en: "Features" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/zatobox/shot-03-planes.webp",
        alt: { es: "Captura de ZatoBox POS: Planes", en: "Screenshot of ZatoBox POS: Plans" },
        caption: { es: "Planes", en: "Plans" },
        width: 1920,
        height: 1200,
      },
    ],
    links: { deploy: "https://www.zatobox.io/" },
  },

  // ───────────── Personales ─────────────
  {
    id: "fabio-producciones",
    kind: "personal",
    inProduction: true,
    name: "Fabio Producciones",
    summary: {
      es: "Sitio web para una empresa de producción de eventos: presenta sus servicios de audio, luces y escenario portátil, los tipos de evento, una galería multimedia y un formulario de presupuesto por pasos, con animaciones al desplazarse.",
      en: "Website for an event production company: it presents its audio, lighting and portable stage services, the types of events, a media gallery and a step-by-step quote form, with scroll animations.",
    },
    // Tecnologías verificadas en el repositorio (package.json) y en el sitio publicado.
    techIds: ["nextjs", "react", "typescript", "tailwindcss", "gsap", "lenis", "emailjs", "vercel"],
    media: [
      {
        type: "image",
        src: "/images/projects/fabio-producciones/shot-01-inicio.webp",
        alt: { es: "Captura de Fabio Producciones: Inicio", en: "Screenshot of Fabio Producciones: Home" },
        caption: { es: "Inicio", en: "Home" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/fabio-producciones/shot-02-eventos.webp",
        alt: { es: "Captura de Fabio Producciones: Tipos de evento", en: "Screenshot of Fabio Producciones: Event types" },
        caption: { es: "Tipos de evento", en: "Event types" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/fabio-producciones/shot-03-servicios.webp",
        alt: { es: "Captura de Fabio Producciones: Servicios", en: "Screenshot of Fabio Producciones: Services" },
        caption: { es: "Servicios", en: "Services" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/fabio-producciones/shot-04-escenario.webp",
        alt: { es: "Captura de Fabio Producciones: Armado del escenario", en: "Screenshot of Fabio Producciones: Stage assembly" },
        caption: { es: "Armado del escenario", en: "Stage assembly" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/fabio-producciones/shot-05-galeria.webp",
        alt: { es: "Captura de Fabio Producciones: Galería. Algunas imágenes están marcadas como ilustrativas en el sitio", en: "Screenshot of Fabio Producciones: Gallery. Some images are labeled as illustrative on the site" },
        caption: { es: "Galería", en: "Gallery" },
        width: 1920,
        height: 1200,
      },
    ],
    // Repositorio público confirmado con la API de GitHub.
    links: {
      deploy: "https://fabioproducciones.vercel.app/",
      repo: "https://github.com/Joacoc-10/FProducciones-",
    },
  },
  {
    id: "florencia-biaturi",
    kind: "personal",
    inProduction: true,
    name: "Dra. Florencia Biaturi",
    summary: {
      es: "Landing profesional para una abogada en Uruguay: presenta sus áreas de práctica (laboral, penal, civil y familia) y cuenta con un formulario de contacto, con diseño responsive y animaciones.",
      en: "Professional landing page for a lawyer in Uruguay: it presents her practice areas (labor, criminal, civil and family law) and includes a contact form, with a responsive design and animations.",
    },
    // Tecnologías verificadas en el repositorio (package.json) y en el sitio publicado.
    techIds: ["react", "vite", "tailwindcss", "mui", "emailjs", "vercel"],
    media: [
      {
        type: "image",
        src: "/images/projects/florencia-biaturi/shot-01-inicio.webp",
        alt: { es: "Captura de Dra. Florencia Biaturi: Inicio", en: "Screenshot of Dra. Florencia Biaturi: Home" },
        caption: { es: "Inicio", en: "Home" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/florencia-biaturi/shot-02-sobre-mi.webp",
        alt: { es: "Captura de Dra. Florencia Biaturi: Sobre mí", en: "Screenshot of Dra. Florencia Biaturi: About" },
        caption: { es: "Sobre mí", en: "About" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/florencia-biaturi/shot-03-areas-de-practica.webp",
        alt: { es: "Captura de Dra. Florencia Biaturi: Áreas de práctica", en: "Screenshot of Dra. Florencia Biaturi: Practice areas" },
        caption: { es: "Áreas de práctica", en: "Practice areas" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/florencia-biaturi/shot-04-movil.webp",
        alt: { es: "Captura de Dra. Florencia Biaturi: Versión móvil", en: "Screenshot of Dra. Florencia Biaturi: Mobile version" },
        caption: { es: "Versión móvil", en: "Mobile version" },
        width: 1920,
        height: 1200,
      },
    ],
    // El repositorio es privado: no se enlaza.
    links: { deploy: "https://dra.florenciabiaturi.com/" },
  },
  {
    id: "olibar",
    kind: "personal",
    name: "OliBar",
    summary: {
      es: "Carta digital para un bar y cocina, pensada para consultarse desde el teléfono: platos organizados por categorías con navegación fija, descripción y precio de cada uno. Desarrollada de forma independiente, fuera de mi trabajo en Coralunity.",
      en: "Digital menu for a bar and kitchen, designed to be read on a phone: dishes organized by category with sticky navigation, each with its description and price. Built independently, outside my work at Coralunity.",
    },
    // Vite confirmado en el package.json del repositorio.
    techIds: ["react", "vite", "typescript", "tailwindcss", "vercel"],
    media: [
      {
        type: "image",
        src: "/images/projects/olibar/shot-01-inicio.webp",
        alt: { es: "Captura de OliBar: Inicio", en: "Screenshot of OliBar: Home" },
        caption: { es: "Inicio", en: "Home" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/olibar/shot-02-carta.webp",
        alt: { es: "Captura de OliBar: Carta digital", en: "Screenshot of OliBar: Digital menu" },
        caption: { es: "Carta digital", en: "Digital menu" },
        width: 1920,
        height: 1200,
      },
      {
        type: "image",
        src: "/images/projects/olibar/shot-03-movil.webp",
        alt: { es: "Captura de OliBar: Versión móvil", en: "Screenshot of OliBar: Mobile version" },
        caption: { es: "Versión móvil", en: "Mobile version" },
        width: 1920,
        height: 1200,
      },
    ],
    links: {
      deploy: "https://oli-bar.vercel.app/",
      // Repositorio público confirmado con la API de GitHub.
      repo: "https://github.com/Joacoc-10/OliBar",
    },
  },

  // ───────────── Bootcamp Henry ─────────────
  // PENDING: los repositorios de GitHub estaban comentados en la versión anterior (ver PENDING.md)
  {
    id: "lienzo-culinario",
    kind: "bootcamp",
    name: "Lienzo Culinario",
    summary: {
      es: "Proyecto final del bootcamp: un e-commerce de comida personalizada desarrollado en un equipo de 6 desarrolladores. Mi rol se centró en el frontend y el diseño de la interfaz, buscando una experiencia intuitiva. Incluye autenticación con Auth0 y una pasarela de pago simulada con Stripe.",
      en: "Final project of the bootcamp: a custom food e-commerce built by a team of 6 developers. My role focused on frontend development and UI design, aiming for an intuitive experience. It includes authentication with Auth0 and a simulated payment gateway with Stripe.",
    },
    techIds: ["nextjs", "react", "typescript", "tailwindcss", "nestjs", "postgresql", "auth0", "stripe"],
    media: [
      {
        type: "image",
        src: "/images/projects/lienzo-culinario/shot-01-inicio.webp",
        alt: { es: "Captura del proyecto Lienzo Culinario", en: "Screenshot of the Lienzo Culinario project" },
        width: 1920,
        height: 1243,
      },
    ],
    links: { deploy: "https://lienzofront.vercel.app/" },
  },
  {
    id: "futura-tech",
    kind: "bootcamp",
    name: "Futura Tech",
    summary: {
      es: "Proyecto de especialización en Front End: un e-commerce de tecnología conectado a un backend ya provisto. Desarrollé un frontend completo con registro de usuarios, navegación de productos, carrito y un checkout simulado, con React, Next.js y Tailwind CSS, cuidando los estilos y las animaciones.",
      en: "Front End specialization project: a tech e-commerce connected to a provided backend. I built a complete frontend with user registration, product browsing, a shopping cart and a simulated checkout, using React, Next.js and Tailwind CSS, with careful styling and animations.",
    },
    techIds: ["nextjs", "react", "typescript", "tailwindcss", "formik", "axios"],
    media: [
      {
        type: "image",
        src: "/images/projects/futura-tech/shot-01-inicio.webp",
        alt: { es: "Captura del proyecto Futura Tech", en: "Screenshot of the Futura Tech project" },
        width: 1920,
        height: 1159,
      },
    ],
    links: { deploy: "https://futuratech.vercel.app/" },
  },
  {
    id: "bodega-cepa-real",
    kind: "bootcamp",
    name: "Bodega Cepa Real",
    summary: {
      es: "Aplicación donde los usuarios se registran, inician sesión y administran sus propias reservas de cata de vinos, creando y cancelando turnos. Un sistema simple pero funcional que cubre el flujo completo de datos, del frontend a la base de datos.",
      en: "An app where users sign up, log in and manage their own wine tasting reservations, creating and cancelling bookings. A simple but working system covering the full data flow, from the frontend to the database.",
    },
    techIds: ["react", "vite", "react-router", "typescript", "nodejs", "express", "postgresql", "typeorm"],
    media: [
      {
        type: "image",
        src: "/images/projects/bodega-cepa-real/shot-01-inicio.webp",
        alt: { es: "Captura del proyecto Bodega Cepa Real", en: "Screenshot of the Bodega Cepa Real project" },
        width: 1920,
        height: 1159,
      },
    ],
    links: { deploy: "https://bodega-cepa-real.vercel.app/" },
  },
  {
    id: "movie-reel",
    kind: "bootcamp",
    name: "Movie Reel",
    summary: {
      es: "Mi primer proyecto Full Stack, pensado para practicar la conexión entre frontend y backend. Es una cartelera de películas donde se pueden crear, guardar y ver películas en una base de datos, con un formulario controlado en el frontend y comunicación con el backend mediante Axios.",
      en: "My first Full Stack project, built to practice connecting frontend and backend. A movie listing where users can create, store and view movies in a database, with a controlled form on the frontend and backend communication through Axios.",
    },
    techIds: ["html5", "css3", "javascript", "axios", "nodejs", "express", "mongodb", "mongoose"],
    media: [
      {
        type: "image",
        src: "/images/projects/movie-reel/shot-01-inicio.webp",
        alt: { es: "Captura del proyecto Movie Reel", en: "Screenshot of the Movie Reel project" },
        width: 1920,
        height: 1243,
      },
    ],
    links: { deploy: "https://movieereelpm2.vercel.app/index.html" },
  },
  {
    id: "portfolio-v1",
    kind: "bootcamp",
    name: "Portfolio v1",
    summary: {
      es: "Desarrollado durante el Módulo 1 del bootcamp de Henry para aplicar los fundamentos del frontend: un portfolio web estático con un formulario controlado para registrar cosas que me gusta hacer, guardadas solo en LocalStorage.",
      en: "Built during Module 1 of the Henry Bootcamp to apply frontend fundamentals: a static portfolio website with a controlled form to record things I enjoy, stored only in LocalStorage.",
    },
    techIds: ["html5", "css3", "javascript"],
    media: [
      {
        type: "image",
        src: "/images/projects/portfolio-v1/shot-01-inicio.webp",
        alt: { es: "Captura del proyecto Portfolio v1", en: "Screenshot of the Portfolio v1 project" },
        width: 1920,
        height: 1243,
      },
    ],
    links: { deploy: "https://portfolio-v1-orcin-eta.vercel.app/" },
  },
];
