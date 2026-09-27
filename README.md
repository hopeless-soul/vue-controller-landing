<div align="center">

<img src="src/assets/logo.png" alt="Customs logo" height="64" />

# YOUR CONTROLLER. CHROMED.

**Landing page for Customs, a mirror-polished chrome shell for game controllers.**

![Vue](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![anime.js](https://img.shields.io/badge/anime.js-4-1a1a1c?style=flat-square)

**[Live Demo](https://vue-controller-landing.vercel.app/) is hosted on Vercel.** 

</div>

---

> [!NOTE]
> **3D models (Blender)** by Herashchenko Vladyslav.
>
> **Landing design (Figma)** by Herashchenko Vladyslav.

## Highlights

<table>
  <tr>
    <td width="50%" valign="top">
      <sub><code>01 / HERO</code></sub>
      <h3>360° product spinner</h3>
      16 pre-rendered frames decoded into <code>ImageBitmap</code>s and drawn to a <code>&lt;canvas&gt;</code>. Drag to inspect, flick for inertia.
    </td>
    <td width="50%" valign="top">
      <sub><code>02 / BACKGROUND</code></sub>
      <h3>Parallax starfield</h3>
      Seeded, deterministic two-layer star orbits that speed up and drift with your scroll velocity.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <sub><code>03 / MOTION</code></sub>
      <h3>Choreographed intro</h3>
      An anime.js timeline reveals the chrome hero type and kicks off an intro spin.
    </td>
    <td width="50%" valign="top">
      <sub><code>04 / PLAY</code></sub>
      <h3>Playable Minigane</h3>
      A tiny tank near the footer follows your pointer and fires at a row of targets.
    </td>
  </tr>
</table>

## Quick start

Requires Node `^22.18.0` or `>=24.12.0`.

```sh
npm install
npm run dev
```

## Project layout

```
src/
  components/    page sections (Hero, Spec Sheet, Preorder, FAQ, Game, ...)
  composables/   spinner, intro timeline, scroll reveal, scroll velocity, tank controls
  starfield/     canvas starfield engine, config and seeded PRNG
  content/       copy and data for features and spinner frames
  lib/           frame loader and helpers
  assets/        controller renders, sprites and artwork
```
