<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import {
		colors,
		LETTER_PATTERNS,
		LETTER_WIDTH,
		LETTER_HEIGHT,
		LETTER_GAP,
		TITLE_TEXT
	} from '$lib/constants';
	import { GLIDER, getRandomPattern } from '$lib/patterns';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;

	// Colors derived from shared constants
	const ALIVE_COLOR = colors.light;
	const DEAD_COLOR = colors.dark;
	const GRID_COLOR = colors.grid;
	const FROZEN_COLOR = colors.light; // Same as normal cells (no blue distinction)
	const PADDING_CELL_COLOR = 'rgba(232, 232, 232, 0.15)'; // Subtle version of normal color

	// Responsive cell size - smaller on mobile (but not too small)
	let cellSize = $state(8);

	const LETTERS = TITLE_TEXT.split('');
	const TITLE_PADDING = 2; // Padding cells around the title

	// Title area bounds (computed on resize)
	let titleBounds = $state({ startX: 0, startY: 0, endX: 0, endY: 0 });

	let width = $state(0);
	let height = $state(0);
	let cols = $derived(Math.floor(width / cellSize));
	let rows = $derived(Math.floor(height / cellSize));

	let grid: boolean[][] = $state([]);
	let frozenCells = new SvelteSet<string>(); // Track frozen title cells
	let paddingCells = new SvelteSet<string>(); // Track padding area cells (collidable)
	let running = $state(true);
	let animationId: number;
	let lastUpdate = 0;
	let lastInteraction = 0;
	let lastWidth = 0; // Track last width to avoid unnecessary resize on mobile scroll
	const UPDATE_INTERVAL = 120; // ms between updates
	const INTERACTION_THROTTLE = 200; // ms between mouse interactions

	// Helper to create frozen cell key
	function cellKey(x: number, y: number): string {
		return `${x},${y}`;
	}

	// Helper to check if a cell is frozen
	function isFrozen(x: number, y: number): boolean {
		return frozenCells.has(cellKey(x, y));
	}

	// Helper to check if a cell is a padding cell
	function isPaddingCell(x: number, y: number): boolean {
		return paddingCells.has(cellKey(x, y));
	}

	// Initialize frozen title cells and set them alive in the grid
	function initializeTitleCells(c: number, r: number, g: boolean[][]): void {
		frozenCells.clear();
		paddingCells.clear();

		// Calculate title position (centered, near top)
		const titleWidth = LETTERS.length * LETTER_WIDTH + (LETTERS.length - 1) * LETTER_GAP;
		const startX = Math.floor((c - titleWidth) / 2);
		const startY = Math.floor(r * 0.18); // 18% from top

		// Store bounds including padding
		titleBounds = {
			startX: startX - TITLE_PADDING,
			startY: startY - TITLE_PADDING,
			endX: startX + titleWidth + TITLE_PADDING,
			endY: startY + LETTER_HEIGHT + TITLE_PADDING
		};

		// First, build a set of which cells are part of the letters
		const letterCells = new SvelteSet<string>();
		let currentX = startX;

		for (const letter of LETTERS) {
			const pattern = LETTER_PATTERNS[letter];

			for (let py = 0; py < LETTER_HEIGHT; py++) {
				for (let px = 0; px < LETTER_WIDTH; px++) {
					if (pattern[py][px] === 1) {
						const cellX = currentX + px;
						const cellY = startY + py;

						if (cellX >= 0 && cellX < c && cellY >= 0 && cellY < r) {
							letterCells.add(cellKey(cellX, cellY));
							frozenCells.add(cellKey(cellX, cellY));
							if (g[cellX]) {
								g[cellX][cellY] = true;
							}
						}
					}
				}
			}

			currentX += LETTER_WIDTH + LETTER_GAP;
		}

		// Now, all cells in the title bounds that are NOT letter cells become padding cells
		for (let py = titleBounds.startY; py < titleBounds.endY; py++) {
			for (let px = titleBounds.startX; px < titleBounds.endX; px++) {
				if (px >= 0 && px < c && py >= 0 && py < r) {
					const key = cellKey(px, py);
					if (!letterCells.has(key)) {
						paddingCells.add(key);
						if (g[px]) {
							g[px][py] = true;
						}
					}
				}
			}
		}
	}

	// Spaceship patterns are now imported from $lib/patterns

	function placePattern(
		g: boolean[][],
		pattern: number[][],
		startX: number,
		startY: number,
		c: number,
		r: number
	): void {
		for (let py = 0; py < pattern.length; py++) {
			for (let px = 0; px < pattern[py].length; px++) {
				const x = (startX + px + c) % c;
				const y = (startY + py + r) % r;
				if (g[x]) {
					// Unfreeze and remove padding for cells touched by the pattern
					const key = cellKey(x, y);
					frozenCells.delete(key);
					paddingCells.delete(key);
					g[x][y] = pattern[py][px] === 1;
				}
			}
		}
	}

	function createGrid(c: number, r: number): boolean[][] {
		const newGrid: boolean[][] = [];
		for (let i = 0; i < c; i++) {
			newGrid[i] = [];
			for (let j = 0; j < r; j++) {
				newGrid[i][j] = false;
			}
		}

		// Calculate title protected zone (avoid spawning near the title)
		const titleWidth = LETTERS.length * LETTER_WIDTH + (LETTERS.length - 1) * LETTER_GAP;
		const titleStartX = Math.floor((c - titleWidth) / 2);
		const titleStartY = Math.floor(r * 0.18);
		const titleEndX = titleStartX + titleWidth;
		const titleEndY = titleStartY + LETTER_HEIGHT;
		const titlePadding = 10; // Extra padding around title

		// Helper to check if a position is in the protected zone
		function isInTitleZone(x: number, y: number, patternWidth = 5, patternHeight = 5): boolean {
			return (
				x + patternWidth > titleStartX - titlePadding &&
				x < titleEndX + titlePadding &&
				y + patternHeight > titleStartY - titlePadding &&
				y < titleEndY + titlePadding
			);
		}

		// Pick one random pattern appropriate for screen size
		const chosen = getRandomPattern(c, r);
		const patternWidth = chosen.width;
		const patternHeight = chosen.height;

		// P70 and P72 are wide orthogonal patterns that need special handling
		const isWideOrthogonal = !chosen.diagonal && patternWidth > 15;

		// Calculate spacing based on pattern size - ensure multiple patterns visible
		// Minimum 3-4 patterns on each axis for a lively look
		const minPatternsX = isWideOrthogonal ? 2 : 4;
		const minPatternsY = 3;
		const baseSpacingX = patternWidth + (isWideOrthogonal ? 20 : 10);
		const baseSpacingY = patternHeight + (isWideOrthogonal ? 15 : 10);
		const maxSpacingX = Math.floor(c / minPatternsX);
		const maxSpacingY = Math.floor(r / minPatternsY);
		const spacingX = Math.min(baseSpacingX, maxSpacingX);
		const spacingY = Math.min(baseSpacingY, maxSpacingY);

		const lanesY = Math.floor(r / spacingY);
		const lanesX = Math.floor(c / spacingX);

		// Place patterns in a grid with some offset variation for visual interest
		for (let ly = 0; ly < lanesY; ly++) {
			for (let lx = 0; lx < lanesX; lx++) {
				// Stagger pattern positions to avoid straight lines
				// Wide orthogonal patterns need clean horizontal lanes - no vertical offset
				const offsetX = (ly % 3) * Math.floor(spacingX / 4);
				const offsetY = isWideOrthogonal ? 0 : (lx % 2) * Math.floor(spacingY / 3);
				const x = lx * spacingX + offsetX + 5;
				const y = ly * spacingY + offsetY + 5;

				if (
					x < c - patternWidth - 5 &&
					y < r - patternHeight - 5 &&
					!isInTitleZone(x, y, patternWidth, patternHeight)
				) {
					placePattern(newGrid, chosen.pattern, x, y, c, r);
				}
			}
		}

		return newGrid;
	}

	// Count neighbors, optionally ignoring frozen and padding cells
	function countNeighbors(
		g: boolean[][],
		x: number,
		y: number,
		c: number,
		r: number,
		ignoreFrozenAndPadding = false
	): number {
		let count = 0;
		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				if (i === 0 && j === 0) continue;
				const nx = (x + i + c) % c;
				const ny = (y + j + r) % r;
				if (g[nx]?.[ny]) {
					// Skip frozen and padding cells if ignoreFrozenAndPadding is true
					if (ignoreFrozenAndPadding && (isFrozen(nx, ny) || isPaddingCell(nx, ny))) continue;
					count++;
				}
			}
		}
		return count;
	}

	function nextGeneration(): void {
		if (cols <= 0 || rows <= 0) return;

		const newGrid: boolean[][] = [];
		const cellsToUnfreeze: string[] = [];
		const paddingToRemove: string[] = [];

		for (let i = 0; i < cols; i++) {
			newGrid[i] = [];
			for (let j = 0; j < rows; j++) {
				const frozen = isFrozen(i, j);
				const isPadding = isPaddingCell(i, j);
				const alive = grid[i]?.[j] ?? false;

				// Check if any neighbors are alive (collision detection for frozen/padding cells)
				let hasLiveNeighbor = false;
				if (frozen || isPadding) {
					for (let di = -1; di <= 1; di++) {
						for (let dj = -1; dj <= 1; dj++) {
							if (di === 0 && dj === 0) continue;
							const ni = (i + di + cols) % cols;
							const nj = (j + dj + rows) % rows;
							if (grid[ni]?.[nj] && !isFrozen(ni, nj) && !isPaddingCell(ni, nj)) {
								hasLiveNeighbor = true;
								break;
							}
						}
						if (hasLiveNeighbor) break;
					}
				}

				if (frozen) {
					// Frozen cell behavior
					if (hasLiveNeighbor) {
						// Unfreeze when collided with live cell
						cellsToUnfreeze.push(cellKey(i, j));
						// Now apply normal rules (count all neighbors including frozen)
						const neighbors = countNeighbors(grid, i, j, cols, rows);
						newGrid[i][j] = neighbors === 2 || neighbors === 3;
					} else {
						// Stay frozen and alive
						newGrid[i][j] = true;
					}
				} else if (isPadding) {
					// Padding cell behavior - can be collided and disappear
					if (hasLiveNeighbor) {
						// Remove from padding and apply normal rules (will likely die)
						paddingToRemove.push(cellKey(i, j));
						const neighbors = countNeighbors(grid, i, j, cols, rows);
						newGrid[i][j] = neighbors === 2 || neighbors === 3;
					} else {
						// Stay as padding cell
						newGrid[i][j] = true;
					}
				} else {
					// Normal Game of Life rules - ignore frozen and padding cells as neighbors
					const neighbors = countNeighbors(grid, i, j, cols, rows, true);
					if (alive) {
						newGrid[i][j] = neighbors === 2 || neighbors === 3;
					} else {
						newGrid[i][j] = neighbors === 3;
					}
				}
			}
		}

		// Unfreeze cells that were collided with
		for (const key of cellsToUnfreeze) {
			frozenCells.delete(key);
		}

		// Remove padding cells that were collided with
		for (const key of paddingToRemove) {
			paddingCells.delete(key);
		}

		grid = newGrid;
	}

	function draw(): void {
		if (!ctx || cols <= 0 || rows <= 0) return;

		ctx.fillStyle = DEAD_COLOR;
		ctx.fillRect(0, 0, width, height);

		// Draw grid lines (subtle)
		ctx.strokeStyle = GRID_COLOR;
		ctx.lineWidth = 0.5;
		for (let i = 0; i <= cols; i++) {
			ctx.beginPath();
			ctx.moveTo(i * cellSize, 0);
			ctx.lineTo(i * cellSize, height);
			ctx.stroke();
		}
		for (let j = 0; j <= rows; j++) {
			ctx.beginPath();
			ctx.moveTo(0, j * cellSize);
			ctx.lineTo(width, j * cellSize);
			ctx.stroke();
		}

		// Draw cells
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				if (grid[i]?.[j]) {
					// Use different color for frozen cells, padding cells, and normal cells
					if (isFrozen(i, j)) {
						ctx.fillStyle = FROZEN_COLOR;
					} else if (isPaddingCell(i, j)) {
						ctx.fillStyle = PADDING_CELL_COLOR;
					} else {
						ctx.fillStyle = ALIVE_COLOR;
					}
					ctx.fillRect(i * cellSize + 1, j * cellSize + 1, cellSize - 2, cellSize - 2);
				}
			}
		}
	}

	function gameLoop(timestamp: number): void {
		if (running && timestamp - lastUpdate >= UPDATE_INTERVAL) {
			nextGeneration();
			lastUpdate = timestamp;
		}
		draw();
		animationId = requestAnimationFrame(gameLoop);
	}

	function handleInteraction(clientX: number, clientY: number): void {
		const now = Date.now();
		if (now - lastInteraction < INTERACTION_THROTTLE) return;
		lastInteraction = now;

		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = Math.floor((clientX - rect.left) / cellSize);
		const y = Math.floor((clientY - rect.top) / cellSize);

		// Spawn a glider at the interaction point
		if (grid[x]) {
			placePattern(grid, GLIDER, x - 1, y - 1, cols, rows);
		}
	}

	let isDragging = $state(false);

	function handleMouseDown(e: MouseEvent): void {
		isDragging = true;
		handleInteraction(e.clientX, e.clientY);
	}

	function handleMouseMove(e: MouseEvent): void {
		// Only interact when dragging (mouse button pressed)
		if (isDragging) {
			handleInteraction(e.clientX, e.clientY);
		}
	}

	function handleMouseUp(): void {
		isDragging = false;
	}

	function handleClick(e: MouseEvent): void {
		// Single click spawns a glider
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = Math.floor((e.clientX - rect.left) / cellSize);
		const y = Math.floor((e.clientY - rect.top) / cellSize);

		if (grid[x]) {
			placePattern(grid, GLIDER, x - 1, y - 1, cols, rows);
		}
	}

	function handleDoubleClick(e: MouseEvent): void {
		// Double click spawns a random spaceship
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = Math.floor((e.clientX - rect.left) / cellSize);
		const y = Math.floor((e.clientY - rect.top) / cellSize);

		if (grid[x]) {
			// Randomly choose from patterns appropriate for screen size
			const chosen = getRandomPattern(cols, rows);
			placePattern(
				grid,
				chosen.pattern,
				x - Math.floor(chosen.width / 2),
				y - Math.floor(chosen.height / 2),
				cols,
				rows
			);
		}
	}

	function handleTouchMove(e: TouchEvent): void {
		e.preventDefault();
		const touch = e.touches[0];
		if (touch) {
			handleInteraction(touch.clientX, touch.clientY);
		}
	}

	function handleTouchStart(e: TouchEvent): void {
		const touch = e.touches[0];
		if (touch) {
			handleInteraction(touch.clientX, touch.clientY);
		}
	}

	function handleResize(): void {
		const newWidth = window.innerWidth;
		const newHeight = window.innerHeight;

		// On mobile, scrolling can trigger resize events when browser chrome shows/hides
		// Only reinitialize the grid if the width actually changed
		const widthChanged = newWidth !== lastWidth;
		lastWidth = newWidth;

		width = newWidth;
		height = newHeight;

		// Smaller cells on mobile (but not too small)
		cellSize = width < 480 ? 6 : width < 768 ? 7 : 8;

		if (canvas) {
			canvas.width = width;
			canvas.height = height;
		}

		// Only recreate grid if width changed (actual resize, not mobile scroll)
		if (widthChanged || grid.length === 0) {
			const newCols = Math.floor(width / cellSize);
			const newRows = Math.floor(height / cellSize);
			const newGrid = createGrid(newCols, newRows);
			initializeTitleCells(newCols, newRows, newGrid);
			grid = newGrid;
		}
	}

	export function resetGrid(): void {
		const newGrid = createGrid(cols, rows);
		initializeTitleCells(cols, rows, newGrid);
		grid = newGrid;
	}

	export function randomizeGrid(): void {
		const newGrid: boolean[][] = [];
		for (let i = 0; i < cols; i++) {
			newGrid[i] = [];
			for (let j = 0; j < rows; j++) {
				newGrid[i][j] = Math.random() < 0.15; // 15% chance of being alive
			}
		}
		grid = newGrid;
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		handleResize();
		animationId = requestAnimationFrame(gameLoop);

		window.addEventListener('resize', handleResize);
		window.addEventListener('mouseup', handleMouseUp);

		// Add touch listeners with passive: false to allow preventDefault
		canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
		canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mouseup', handleMouseUp);
			canvas.removeEventListener('touchstart', handleTouchStart);
			canvas.removeEventListener('touchmove', handleTouchMove);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="inset-0 fixed z-0 touch-none"
	onclick={handleClick}
	ondblclick={handleDoubleClick}
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
></canvas>
