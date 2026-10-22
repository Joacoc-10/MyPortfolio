import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-brand-ink hover:bg-brand-strong",
  secondary:
    "border border-line-strong bg-surface text-ink hover:border-brand/60 hover:bg-surface-raised",
  ghost: "text-ink-muted hover:text-ink",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
};

type ButtonAsLink = CommonProps &
  Omit<React.ComponentPropsWithoutRef<"a">, "href"> & {
    href: string;
    /** Abre en una pestaña nueva con rel seguro. */
    external?: boolean;
  };

type ButtonAsButton = CommonProps &
  React.ComponentPropsWithoutRef<"button"> & { href?: undefined };

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "md", className, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in rest && rest.href !== undefined) {
    const { external, ...anchorProps } = rest as Omit<ButtonAsLink, keyof CommonProps | "className">;
    return (
      <a
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...anchorProps}
      />
    );
  }

  return (
    <button
      type="button"
      className={classes}
      {...(rest as Omit<ButtonAsButton, keyof CommonProps | "className">)}
    />
  );
}
