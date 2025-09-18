import { ISocialMedia } from "@/types/SocialMedia";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";


export const socialLinks: ISocialMedia[] = [
   {
      Icon: FaLinkedin, 
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/j-coding/",
   },
   {
      Icon: FaGithub, 
      name: "GitHub",
      href: "https://github.com/Joacoc-10",
   },
   {
      Icon: FaEnvelope, 
      name: "Email",
      href: "mailto:joacoc-10@hotmail.com",
   },
   {
      Icon: IoDocumentText, 
      name: "CV",
      subLinks: [
         { label: "CV - Español", href: "/CV_JCoding_ES.pdf" },
         { label: "CV - English", href: "/CV_JCoding_EN.pdf" },
      ],
   },
   
];