import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentPropsWithoutRef<"div">;

/** Ancho máximo y gutters consistentes para todas las secciones. */
export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-page px-5 sm:px-8", className)}
      {...props}
    />
  );
}
