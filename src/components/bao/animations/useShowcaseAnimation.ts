import { useEffect } from 'react';
import { MotionValue } from 'framer-motion';
import { ShowcaseAnimationId } from '../../../config/showcaseAnimations';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ShowcaseMotionValues {
  squishX: MotionValue<number>;
  squishY: MotionValue<number>;
  idleY: MotionValue<number>;
  idleRotate: MotionValue<number>;
}

interface UseShowcaseAnimationOptions {
  motionValues: ShowcaseMotionValues;
  animationId: ShowcaseAnimationId | null;
  onComplete: () => void;
}

export function useShowcaseAnimation({
  motionValues,
  animationId,
  onComplete,
}: UseShowcaseAnimationOptions) {
  useEffect(() => {
    if (!animationId) return;
    let cancelled = false;
    const { squishX, squishY, idleY, idleRotate } = motionValues;

    const reset = () => {
      squishX.set(1);
      squishY.set(1);
      idleY.set(0);
      idleRotate.set(0);
    };

    const run = async () => {
      switch (animationId) {
        // ---- Common ----
        case 'squish':
          squishX.set(1.15);
          squishY.set(0.82);
          await delay(100);
          if (cancelled) return;
          squishX.set(0.9);
          squishY.set(1.12);
          await delay(120);
          if (cancelled) return;
          squishX.set(1.05);
          squishY.set(0.96);
          await delay(130);
          if (cancelled) return;
          reset();
          break;

        // ---- Uncommon ----
        case 'spin':
          squishX.set(0.85);
          squishY.set(1.1);
          await delay(100);
          if (cancelled) return;
          idleRotate.set(180);
          await delay(200);
          if (cancelled) return;
          idleRotate.set(360);
          squishX.set(1.1);
          squishY.set(0.9);
          await delay(200);
          if (cancelled) return;
          reset();
          break;

        case 'peek':
          squishY.set(0.3);
          idleY.set(15);
          await delay(400);
          if (cancelled) return;
          squishY.set(1.15);
          squishX.set(0.9);
          idleY.set(-5);
          await delay(200);
          if (cancelled) return;
          reset();
          await delay(200);
          break;

        // ---- Rare ----
        case 'powerUp':
          for (let i = 0; i < 6 && !cancelled; i++) {
            squishX.set(1 + (i % 2 ? 0.03 : -0.03));
            idleRotate.set(i % 2 ? 2 : -2);
            await delay(60);
          }
          if (cancelled) return;
          squishX.set(1.25);
          squishY.set(0.75);
          idleY.set(-12);
          idleRotate.set(0);
          await delay(200);
          if (cancelled) return;
          squishX.set(0.9);
          squishY.set(1.1);
          idleY.set(0);
          await delay(150);
          if (cancelled) return;
          reset();
          await delay(190);
          break;

        case 'flex':
          squishX.set(1.2);
          squishY.set(0.85);
          await delay(500);
          if (cancelled) return;
          reset();
          await delay(200);
          break;

        // ---- Epic ----
        case 'shadowCloak':
          squishX.set(0.95);
          squishY.set(0.95);
          await delay(200);
          if (cancelled) return;
          squishX.set(1.05);
          squishY.set(1.05);
          await delay(400);
          if (cancelled) return;
          squishX.set(1.08);
          squishY.set(0.92);
          await delay(300);
          if (cancelled) return;
          reset();
          await delay(300);
          break;

        case 'rainbowShift':
          for (let i = 0; i < 7 && !cancelled; i++) {
            idleRotate.set(i % 2 ? 3 : -3);
            await delay(200);
          }
          if (cancelled) return;
          reset();
          break;

        case 'elementalFlip':
          idleRotate.set(180);
          await delay(300);
          if (cancelled) return;
          await delay(400);
          if (cancelled) return;
          idleRotate.set(360);
          await delay(300);
          if (cancelled) return;
          reset();
          await delay(100);
          break;

        // ---- Legendary: Long Bao ----
        case 'dragonTransform':
          squishY.set(0.6);
          squishX.set(1.15);
          await delay(200);
          if (cancelled) return;
          squishY.set(1.4);
          squishX.set(0.8);
          await delay(400);
          if (cancelled) return;
          // Hold transformed
          await delay(800);
          if (cancelled) return;
          // Return
          squishY.set(1.1);
          squishX.set(0.95);
          await delay(300);
          if (cancelled) return;
          reset();
          await delay(300);
          break;

        case 'fireBreath':
          idleRotate.set(-8);
          squishX.set(1.05);
          await delay(200);
          if (cancelled) return;
          // Hold lean
          await delay(600);
          if (cancelled) return;
          squishX.set(0.95);
          idleRotate.set(-4);
          await delay(300);
          if (cancelled) return;
          reset();
          await delay(400);
          break;

        case 'dragonRoar':
          for (let i = 0; i < 8 && !cancelled; i++) {
            squishX.set(i % 2 ? 1.05 : 0.95);
            await delay(50);
          }
          if (cancelled) return;
          squishY.set(1.15);
          squishX.set(0.92);
          idleY.set(-15);
          await delay(200);
          if (cancelled) return;
          idleY.set(0);
          squishX.set(1.1);
          squishY.set(0.88);
          await delay(150);
          if (cancelled) return;
          reset();
          await delay(400);
          break;

        // ---- Legendary: Feng Huang ----
        case 'phoenixWings':
          idleY.set(-8);
          await delay(300);
          if (cancelled) return;
          // Hold floating
          squishX.set(1.1);
          await delay(1000);
          if (cancelled) return;
          squishX.set(1);
          idleY.set(0);
          await delay(500);
          break;

        case 'featherBurst':
          squishY.set(0.85);
          squishX.set(1.08);
          await delay(150);
          if (cancelled) return;
          squishY.set(1.1);
          squishX.set(0.95);
          idleY.set(-10);
          await delay(200);
          if (cancelled) return;
          idleY.set(0);
          await delay(200);
          if (cancelled) return;
          reset();
          await delay(850);
          break;

        case 'phoenixFlame':
          for (let i = 0; i < 8 && !cancelled; i++) {
            squishX.set(i % 2 ? 1.05 : 0.95);
            squishY.set(i % 2 ? 0.95 : 1.05);
            await delay(200);
          }
          if (cancelled) return;
          reset();
          break;

        // ---- Legendary: Lexicon ----
        case 'warriorStance':
          squishX.set(1.08);
          squishY.set(0.9);
          await delay(200);
          if (cancelled) return;
          idleRotate.set(-5);
          await delay(100);
          if (cancelled) return;
          // Hold stance
          await delay(800);
          if (cancelled) return;
          reset();
          await delay(400);
          break;

        case 'calligraphyFlourish':
          for (let i = 0; i < 6 && !cancelled; i++) {
            idleRotate.set(i % 2 ? 2 : -2);
            await delay(300);
          }
          if (cancelled) return;
          reset();
          break;

        case 'pepperStorm':
          for (let i = 0; i < 13 && !cancelled; i++) {
            idleRotate.set(i % 2 ? 6 : -6);
            squishX.set(i % 2 ? 1.04 : 0.96);
            await delay(100);
          }
          if (cancelled) return;
          reset();
          break;

        // ---- Legendary: Mishi ----
        case 'megaPuppyEyes':
          idleY.set(-3);
          await delay(300);
          if (cancelled) return;
          // Hold floating with big eyes
          await delay(1400);
          if (cancelled) return;
          idleY.set(0);
          await delay(300);
          break;

        case 'heartBurst':
          squishY.set(0.85);
          squishX.set(1.08);
          await delay(100);
          if (cancelled) return;
          idleY.set(-10);
          squishY.set(1.1);
          squishX.set(0.95);
          await delay(200);
          if (cancelled) return;
          idleY.set(0);
          await delay(200);
          if (cancelled) return;
          reset();
          await delay(1000);
          break;

        case 'mishiWink':
          idleRotate.set(-5);
          await delay(200);
          if (cancelled) return;
          // Hold wink
          await delay(600);
          if (cancelled) return;
          reset();
          await delay(400);
          break;
      }

      if (!cancelled) {
        reset();
        onComplete();
      }
    };

    run();
    return () => {
      cancelled = true;
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationId]);
}
