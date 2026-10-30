# 👕 Wardrobe Run: Clothes & Demonstratives

A cooperative platform game for practicing English vocabulary (**clothes**) and the **demonstratives** (*this, that, these, those*) with children from 6 to 15.

The vocabulary comes from the activity sheets for the "Clothes and Demonstratives" lesson of Turmas 1, 2 and 3 (Centro Comunitário Sal da Terra).

![Turma 1: "I want these hats!"](docs/img/turma1.png)

## How it works

- A **shop assistant** stands on the left side of the screen and gives orders: *"Bring me **those** boots!"*. She speaks them aloud too.
- Everything **near her (HERE ✋)** takes **this/these**. Everything **far away (OVER THERE 👉)** takes **that/those**.
- Two children play **together**, on the same keyboard, picking up the right item. If they grab the wrong one, they lose a heart and the game explains the mistake.
- Each pair plays for **90 seconds**. Then it's the **next pair's** turn. Everyone's correct answers add up to the **class goal**.

| Turma | Mode | What it practices |
|---|---|---|
| 1 | Clothes Shop | Words first (*Get the hat!*), then *this/that*, then all four. Picture hint. |
| 2 | Shop with Colours | Colours + demonstratives (*I like those red shoes!*) |
| 3 | Question Blocks | Full vocabulary, moving platforms, and blocks **THIS IS / THESE ARE / THAT'S / THOSE ARE** |

| Turma 2 | Turma 3 |
|---|---|
| ![Turma 2](docs/img/turma2.png) | ![Turma 3](docs/img/turma3.png) |

## How to open it (no installation, no internet)

1. On this GitHub page, click the green **Code** button → **Download ZIP**.
2. Extract the ZIP file (right-click → "Extrair tudo").
3. Open the folder and **double-click `index.html`**. It opens in Chrome or Edge.

That's it. The game works **offline**, so you can download it at home and take it to class on the laptop or a USB stick.

> Tip: connect the computer to the projector/TV and press **F** in the game to go full screen.

## Controls

| Who | Keys |
|---|---|
| Player 1 | **A / D** move · **W** jump · **S** drop down from a platform |
| Player 2 | **← / →** move · **↑** jump · **↓** drop down from a platform |
| Teacher | **ENTER** start / next pair · **SPACE** pause · **R** repeat the sentence · **N** skip the order · **M** voice on/off · **F** full screen · **ESC** menu |

USB game controllers also work.

## Documentation

- [docs/COMO-USAR.md](docs/COMO-USAR.md): step-by-step guide for class (setup, rotating pairs, "Say it!" mode).
- [docs/EDITAR-VOCABULARIO.md](docs/EDITAR-VOCABULARIO.md): how to add or change words.

## For whoever is going to change the code

Plain HTML + CSS + JavaScript. No frameworks, no build step, no dependencies. The scripts are classic `<script>` tags (no ES modules or `fetch`), so the game runs straight from `file://`.

```
index.html            menu (turma, players, options)
game.html             game screen
css/style.css
js/vocabulary.js      vocabulary by turma (editable)
js/sentences.js       all sentences: orders, correct answers, error feedback
js/clothes-art.js     clothing drawings (SVG generated in code, recolorable)
js/levels.js          turma settings and platform layouts
js/engine.js          controls (keyboard/gamepad) and physics
js/round.js           round rules (orders, decoys, points, hearts)
js/draw.js            canvas rendering
js/audio.js           voice (speechSynthesis) and sound effects (Web Audio)
js/main.js            game screen loop and overlays
js/menu.js            menu
```

## License

MIT. See [LICENSE](LICENSE).
