import ExperienceCounter from "./ExperienceCounter";
import ProjectCounter from "./ProjectCounter";

const CounterSection = () => {
  return (
    // Agregamos las clases del footer: m-4, rounded-lg, bg-whiteHeadline-400
    // y el font-sans para consistencia.
    <div className="relative m-4 font-sans rounded-lg bg-whiteHeadline-400">
      {/* Esta es la capa semitransparente que le da el brillo */}
      <div className="absolute inset-0 rounded-lg bg-white/80"></div>

      {/* Este es el contenedor de contenido que tiene el mismo ancho que el footer */}
      <div className="relative w-full max-w-screen-xl p-4 mx-auto md:py-8">
        <div className="flex flex-col space-y-8 md:flex-row justify-evenly md:space-y-0">
          <ExperienceCounter />
          <ProjectCounter />
        </div>
      </div>
    </div>
  );
};

export default CounterSection;