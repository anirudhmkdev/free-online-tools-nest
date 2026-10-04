# Campus frontend assets

Self-hosted distributions copied from the approved preview packages. Upstream license texts are in `licenses/`; minified GSAP bodies retain their license banners. Icons use the regular Phosphor family. The stationery image is the previously approved generated asset and preserves its embedded generation prompt. No dependency or deployment configuration was changed.

The source image lives in `src/assets/campus-stationery.png`; Astro's existing image pipeline generates responsive WebP copies at build time. GSAP's package supplies its license notice in the distribution banner; `licenses/gsap-NOTICE.txt` records the [upstream license link](https://gsap.com/community/standard-license/).

- @fontsource-variable/outfit 5.3.0 (OFL-1.1)
- @fontsource-variable/noto-sans-devanagari 5.3.0 (OFL-1.1)
- @phosphor-icons/core 2.1.1 (MIT)
- gsap 3.15.0 (Standard 'no charge' license: https://gsap.com/standard-license.)
