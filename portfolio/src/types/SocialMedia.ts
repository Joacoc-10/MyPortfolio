import { IconType } from "react-icons";

export interface ILinkItem {
   label: string;
   href: string;
}

export interface ISocialMedia {
   Icon: IconType;
   name: string;
   href?: string; 
   subLinks?: ILinkItem[]; 
}
