import dinoRex from '../assets/dinos/dino-green-rex.png';
import dinoSpiky from '../assets/dinos/dino-pink-spiky.png';
import dinoLongneck from '../assets/dinos/dino-purple-longneck.png';
import dinoTrike from '../assets/dinos/dino-teal-trike.png';
import dinoStego from '../assets/dinos/dino-green-stego.png';
import dinoBabyTrike from '../assets/dinos/dino-orange-baby-trike.png';
import dinoRoar from '../assets/dinos/dino-orange-roar.png';
import dinoEgg from '../assets/dinos/dino-green-egg.png';

const FLOATING_CONFIGS = [
  { img: dinoRex, top: '8%', left: '4%', size: 48, duration: 14, delay: 0, opacity: 0.16 },
  { img: dinoSpiky, top: '18%', right: '5%', size: 42, duration: 18, delay: -4, opacity: 0.14 },
  { img: dinoLongneck, top: '35%', left: '2%', size: 52, duration: 22, delay: -8, opacity: 0.13 },
  { img: dinoTrike, top: '48%', right: '3%', size: 46, duration: 16, delay: -2, opacity: 0.15 },
  { img: dinoStego, top: '62%', left: '5%', size: 44, duration: 20, delay: -6, opacity: 0.14 },
  { img: dinoBabyTrike, top: '75%', right: '6%', size: 38, duration: 15, delay: -9, opacity: 0.17 },
  { img: dinoRoar, top: '88%', left: '3%', size: 48, duration: 19, delay: -5, opacity: 0.12 },
  { img: dinoEgg, top: '28%', right: '8%', size: 36, duration: 17, delay: -11, opacity: 0.18 },
  { img: dinoSpiky, top: '94%', right: '7%', size: 40, duration: 21, delay: -3, opacity: 0.13 },
];

/**
 * Ambient floating dinosaur icons drifting softly in the background.
 * Low opacity (faded), pointer-events disabled, zero layout shifting.
 */
export const FloatingDinosBackground = () => {
  return (
    <div className="floating-dinos-background-root" aria-hidden="true">
      {FLOATING_CONFIGS.map((dino, idx) => (
        <div
          key={`ambient-dino-${idx}`}
          className="ambient-floating-dino"
          style={{
            top: dino.top,
            left: dino.left,
            right: dino.right,
            width: `${dino.size}px`,
            height: `${dino.size}px`,
            opacity: dino.opacity,
            animationDuration: `${dino.duration}s`,
            animationDelay: `${dino.delay}s`,
          }}
        >
          <img src={dino.img} alt="" className="ambient-dino-img" />
        </div>
      ))}
    </div>
  );
};

export default FloatingDinosBackground;
