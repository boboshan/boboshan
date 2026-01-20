---
title: Conway's Game of Life
date: '2026-01-16'
excerpt: A deep dive into cellular automata and why the Game of Life is endlessly fascinating.
---

Conway's Game of Life is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves.

The rules are surprisingly simple:

- Any live cell with 2-3 neighbors survives
- Any dead cell with exactly 3 neighbors becomes alive
- All other live cells die, all other dead cells stay dead

What emerges from these simple rules is breathtaking complexity. Patterns that move, oscillate, and even replicate themselves. The Game of Life is Turing complete, meaning it can simulate any computation.

On this site, I've integrated the Game of Life as the background canvas. The pixel title "boboshan" starts as frozen cells that only begin following the rules when they collide with moving patterns. Click anywhere to spawn gliders and watch them interact with the frozen letters.

This cellular automaton demonstrates a fundamental principle: complex systems can emerge from simple rules. It's a perfect metaphor for how small interactions in code can create something beautiful and unexpected.
