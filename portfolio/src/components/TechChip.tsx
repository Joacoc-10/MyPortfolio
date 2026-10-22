import type { IconType } from "react-icons";
import { FaJava } from "react-icons/fa";
import {
  SiAmazonsqs,
  SiAuth0,
  SiAxios,
  SiBootstrap,
  SiCloudinary,
  SiCss3,
  SiCssmodules,
  SiDocker,
  SiExpress,
  SiFormik,
  SiFramer,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiJsonwebtokens,
  SiMariadb,
  SiMongodb,
  SiMongoose,
  SiNestjs,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiRailway,
  SiReact,
  SiReactrouter,
  SiSpringboot,
  SiStripe,
  SiTailwindcss,
  SiTypeorm,
  SiTypescript,
  SiVercel,
  SiVite,
} from "react-icons/si";
import { cn } from "@/lib/utils";
import type { Technology } from "@/data";

/** Íconos de marca por id de tecnología. Las que no tienen ícono se muestran solo con texto. */
const icons: Record<string, IconType> = {
  html5: SiHtml5,
  css3: SiCss3,
  javascript: SiJavascript,
  typescript: SiTypescript,
  react: SiReact,
  nextjs: SiNextdotjs,
  tailwindcss: SiTailwindcss,
  bootstrap: SiBootstrap,
  vite: SiVite,
  "react-router": SiReactrouter,
  "css-modules": SiCssmodules,
  axios: SiAxios,
  formik: SiFormik,
  "framer-motion": SiFramer,
  nodejs: SiNodedotjs,
  express: SiExpress,
  java: FaJava,
  "spring-boot": SiSpringboot,
  nestjs: SiNestjs,
  typeorm: SiTypeorm,
  mongoose: SiMongoose,
  jwt: SiJsonwebtokens,
  postgresql: SiPostgresql,
  mariadb: SiMariadb,
  mongodb: SiMongodb,
  docker: SiDocker,
  sqs: SiAmazonsqs,
  vercel: SiVercel,
  railway: SiRailway,
  git: SiGit,
  github: SiGithub,
  auth0: SiAuth0,
  stripe: SiStripe,
  cloudinary: SiCloudinary,
};

type TechChipProps = {
  tech: Technology;
  size?: "sm" | "md";
  className?: string;
};

export function TechChip({ tech, size = "sm", className }: TechChipProps) {
  const Icon = icons[tech.id];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-line bg-canvas/40 text-ink-muted",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
        className,
      )}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} aria-hidden="true" />}
      {tech.name}
    </span>
  );
}
