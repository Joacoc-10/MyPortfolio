import EffectsWrapper from "../EffectsWrapper";
import ScrollFloat from "../ScrollFloat";
import ExperienceCounter from "./ExperienceCounter";
import ProjectCounter from "./ProjectCounter";

const CounterSection = () => {
  return (
    <ScrollFloat
      animationDuration={1.8}
      ease="power3.out"
      scrollStart="top bottom-=150"
    >
      <div
        className="m-4 mt-40 font-sans rounded-lg bg-opacity-90 "
        style={{
          boxShadow: "0 0 15px rgba(1, 130, 138, 0.5), 0 0 30px rgba(1, 170, 180, 0.4)",
        }}
      >
        <EffectsWrapper>
        {/* Este es el contenedor de contenido que tiene el mismo ancho que el footer */}
        <div className="w-full max-w-screen-xl p-4 mx-auto md:py-8">
          <div className="flex flex-col space-y-8 md:flex-row justify-evenly md:space-y-0">
            <ScrollFloat
              animationDuration={1.5}
              ease="power3.out"
              scrollStart="top bottom-=170"
            >
              <ExperienceCounter />
            </ScrollFloat>

            <ScrollFloat
              animationDuration={1.5}
              ease="power3.out"
              scrollStart="top bottom-=200"
            >
              <ProjectCounter />
            </ScrollFloat>
          </div>
        </div>
        </EffectsWrapper>
      </div>
    </ScrollFloat>
  );
};

export default CounterSection;
