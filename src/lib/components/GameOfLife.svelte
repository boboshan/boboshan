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

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;

	// Colors derived from shared constants
	const ALIVE_COLOR = colors.light;
	const DEAD_COLOR = colors.dark;
	const GRID_COLOR = colors.grid;
	const FROZEN_COLOR = colors.light; // Same as normal cells (no blue distinction)
	const PADDING_CELL_COLOR = 'rgba(232, 232, 232, 0.15)'; // Subtle version of normal color
	const TITLE_BG_COLOR = 'rgba(20, 20, 20, 0.3)';
	const TITLE_BORDER_COLOR = 'rgba(40, 40, 40, 0.3)';

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

	// Spaceship patterns (all moving RIGHT)
	// Glider moving down-right
	const GLIDER = [
		[0, 1, 0],
		[0, 0, 1],
		[1, 1, 1]
	];

	// LWSS moving right (flipped horizontally)
	const LWSS = [
		[1, 0, 0, 1, 0],
		[0, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[0, 1, 1, 1, 1]
	];

	// MWSS moving right (flipped horizontally)
	const MWSS = [
		[0, 0, 0, 1, 0, 0],
		[1, 0, 0, 0, 1, 0],
		[0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 1],
		[0, 1, 1, 1, 1, 1]
	];

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

		// Dense pattern placement for a lively simulation
		// Scale with screen size - all moving RIGHT
		// Key: use separate horizontal "lanes" to avoid collisions
		// Use higher base density on mobile (smaller screens)
		const isMobile = c < 60;
		const baseDensity = isMobile ? 1.5 : 1;
		const density = (Math.max(c, r) / 100) * baseDensity;

		// Glider streams on dedicated lanes (gliders move diagonally down-right)
		// Stagger starting X positions so they don't catch up
		const gliderSpacing = isMobile ? 12 : 18;
		const gliderLanes = Math.floor(r / gliderSpacing);
		for (let lane = 0; lane < gliderLanes; lane++) {
			const y = lane * gliderSpacing + 8;
			// Multiple gliders per lane across full width
			const glidersInLane = Math.floor((isMobile ? 8 : 5) * density);
			for (let i = 0; i < glidersInLane; i++) {
				// Spread across entire width
				const xSpacing = isMobile ? 20 : 30;
				const x = i * xSpacing + (lane % 5) * 6 + 5;
				if (x < c - 10 && y < r - 10 && !isInTitleZone(x, y, 3, 3)) {
					placePattern(newGrid, GLIDER, x, y, c, r);
				}
			}
		}

		// LWSS on separate horizontal lanes (they move straight right)
		const lwssLanes = Math.floor(r / 35);
		for (let lane = 0; lane < lwssLanes; lane++) {
			const y = lane * 35 + 20;
			const lwssInLane = Math.floor(4 * density);
			for (let i = 0; i < lwssInLane; i++) {
				// Spread across full width
				const x = i * 35 + (lane % 4) * 8 + 5;
				if (x < c - 15 && y < r - 15 && !isInTitleZone(x, y, 5, 4)) {
					placePattern(newGrid, LWSS, x, y, c, r);
				}
			}
		}

		// MWSS scattered on their own lanes - more of them
		const mwssLanes = Math.floor(r / 45);
		for (let lane = 0; lane < mwssLanes; lane++) {
			const y = lane * 45 + 30;
			const mwssInLane = Math.floor(3 * density);
			for (let i = 0; i < mwssInLane; i++) {
				const x = i * 40 + (lane % 3) * 12 + 10;
				if (x < c - 20 && y < r - 25 && !isInTitleZone(x, y, 6, 5)) {
					placePattern(newGrid, MWSS, x, y, c, r);
				}
			}
		}

		// Additional diagonal glider waves across the screen
		for (let wave = 0; wave < Math.floor(4 * density); wave++) {
			const startY = wave * 40 + 10;
			for (let i = 0; i < 5; i++) {
				const x = wave * 20 + i * 35 + 15;
				const y = startY + i * 15;
				if (x < c - 10 && y < r - 10 && y > 5 && !isInTitleZone(x, y, 3, 3)) {
					placePattern(newGrid, GLIDER, x, y, c, r);
				}
			}
		}

		// Extra gliders on the right side
		for (let i = 0; i < Math.floor(r / 25); i++) {
			const y = i * 25 + 12;
			for (let j = 0; j < 3; j++) {
				const x = c * 0.6 + j * 30 + (i % 3) * 10;
				if (x < c - 10 && y < r - 10 && !isInTitleZone(x, y, 3, 3)) {
					placePattern(newGrid, GLIDER, x, y, c, r);
				}
			}
		}

		// Extra LWSS on the right
		for (let i = 0; i < Math.floor(r / 50); i++) {
			const y = i * 50 + 25;
			for (let j = 0; j < 2; j++) {
				const x = c * 0.5 + j * 40 + (i % 2) * 15;
				if (x < c - 15 && y < r - 15 && !isInTitleZone(x, y, 5, 4)) {
					placePattern(newGrid, LWSS, x, y, c, r);
				}
			}
		}

		// Scatter some random cells for extra chaos and spontaneous patterns
		// Avoid the title zone
		const randomCells = Math.floor(c * r * 0.003); // 0.3% random fill
		for (let i = 0; i < randomCells; i++) {
			const x = Math.floor(Math.random() * c);
			const y = Math.floor(Math.random() * r);
			if (!isInTitleZone(x, y, 1, 1)) {
				newGrid[x][y] = true;
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

		// Draw title padding area background (only if there are frozen cells)
		if (frozenCells.size > 0) {
			const padX = titleBounds.startX * cellSize;
			const padY = titleBounds.startY * cellSize;
			const padW = (titleBounds.endX - titleBounds.startX) * cellSize;
			const padH = (titleBounds.endY - titleBounds.startY) * cellSize;

			ctx.fillStyle = TITLE_BG_COLOR;
			ctx.fillRect(padX, padY, padW, padH);

			ctx.strokeStyle = TITLE_BORDER_COLOR;
			ctx.lineWidth = 1;
			ctx.strokeRect(padX, padY, padW, padH);
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
		// Double click spawns a spaceship
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = Math.floor((e.clientX - rect.left) / cellSize);
		const y = Math.floor((e.clientY - rect.top) / cellSize);

		if (grid[x]) {
			// Randomly choose between LWSS and MWSS
			const pattern = Math.random() > 0.5 ? LWSS : MWSS;
			placePattern(grid, pattern, x - 2, y - 2, cols, rows);
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
		width = window.innerWidth;
		height = window.innerHeight;

		// Smaller cells on mobile (but not too small)
		cellSize = width < 480 ? 6 : width < 768 ? 7 : 8;

		if (canvas) {
			canvas.width = width;
			canvas.height = height;
		}
		const newCols = Math.floor(width / cellSize);
		const newRows = Math.floor(height / cellSize);
		const newGrid = createGrid(newCols, newRows);
		initializeTitleCells(newCols, newRows, newGrid);
		grid = newGrid;
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

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mouseup', handleMouseUp);
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
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
></canvas>
