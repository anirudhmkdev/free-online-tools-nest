/** Decorative Campus enhancements. Content and tool workspaces stay readable and stable. */
type TweenValues = {
  scale?: number; x?: number; y?: number; duration?: number; ease?: string;
  yoyo?: boolean; repeat?: number;
  scrollTrigger?: { trigger: Element; start: string; once: boolean };
};
interface CampusMedia {
  add(query: string, effect: () => (() => void)): void;
  revert(): void;
}
interface CampusGsap {
  registerPlugin(plugin: object): void;
  matchMedia(): CampusMedia;
  fromTo(target: Element, from: TweenValues, to: TweenValues): void;
}
declare global {
  interface Window { gsap?: CampusGsap; ScrollTrigger?: object }
}

export function initCampusMotion() {
  let started = false;
  const start = () => {
    if (started) return;
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger) return;
    started = true;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const photo = document.querySelector('.campus-photo img');
      if (photo) gsap.fromTo(photo, { scale: 1.025 }, {
        scale: 1, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: photo, start: 'top 95%', once: true },
      });
      const browse = document.getElementById('campus-browse');
      const expand = () => {
        if (browse?.matches(':popover-open')) gsap.fromTo(browse, { scale: .985 }, { scale: 1, duration: .22, ease: 'power3.out' });
      };
      browse?.addEventListener('toggle', expand);
      const listeners: Array<[Element, () => void]> = [];
      document.querySelectorAll('.campus-collections a,.campus-wide-nav a,.campus-task-strip a').forEach(link => {
        const arrow = link.querySelector('.campus-icon');
        if (!arrow) return;
        const feedback = () => gsap.fromTo(arrow, { x: 0, y: 0 }, { x: 2, y: -2, duration: .16, yoyo: true, repeat: 1, ease: 'power2.out' });
        link.addEventListener('mouseenter', feedback);
        listeners.push([link, feedback]);
      });
      return () => {
        browse?.removeEventListener('toggle', expand);
        listeners.forEach(([link, listener]) => link.removeEventListener('mouseenter', listener));
      };
    });
    window.addEventListener('pagehide', () => media.revert(), { once: true });
  };
  if (document.readyState === 'complete') start();
  else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
    window.addEventListener('load', start, { once: true });
  }
}
