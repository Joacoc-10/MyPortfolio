import ExperienceCounter from "./ExperienceCounter";
import ProjectCounter from "./ProjectCounter";

const CounterSection = () => {
  return (
    <div
      className="m-4 mt-40 font-sans rounded-lg bg-opacity-90 "
      style={{
        boxShadow: "0 -4px 7px 0 #7f5af0, 0 7px 15px 0 #7f5af0",
      }}
    >
      {/* Este es el contenedor de contenido que tiene el mismo ancho que el footer */}
      <div className="w-full max-w-screen-xl p-4 mx-auto md:py-8">
        <div className="flex flex-col space-y-8 md:flex-row justify-evenly md:space-y-0">
          <ExperienceCounter />
          <ProjectCounter />
        </div>
      </div>
    </div>
  );
};

export default CounterSection;