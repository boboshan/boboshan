// Game of Life spaceship patterns parsed from .cells files
// Patterns sourced from https://github.com/copy/life

// Helper to parse .cells format into number[][] pattern
function parseCells(cells: string): number[][] {
	const lines = cells.split('\n').filter((line) => !line.startsWith('!'));

	// Remove trailing empty lines only (keep internal empty lines - they represent dead rows)
	while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
		lines.pop();
	}

	// Find max width to normalize all rows
	const maxWidth = Math.max(...lines.map((l) => l.length), 1);

	return lines.map((line) => {
		const row = [...line].map((char) => (char === 'O' ? 1 : 0));
		// Pad to max width
		while (row.length < maxWidth) row.push(0);
		return row;
	});
}

// 58P5H1V1 - c/5 diagonal spaceship (moves down-right)
const P58_RAW = `....................OO
....................OO
...................O..O
................OO.O..O
......................O
..............OO...O..O
..............OO.....O
...............O.OOOOO
................O


.............OOO
.............O
...........OO
.....OO....O
.....OOO...O
...O....O
...O...O
.......O
..OO.O.O
OO.....O
OO....OO
..OOOO`;

// 70P5H2V0 - 2c/5 orthogonal spaceship (moves right)
const P70_RAW = `..O............O
.O.O..........O.O
OO.OO........OO.OO
OO..............OO
..O............O
..OOOO......OOOO
..O..OO....OO..O
...OO..O..O..OO
....OO.OOOO.OO
.....O.O..O.O
......O....O

.....O......O
...OO.OO..OO.OO
....O........O
....OO......OO`;

// 70P2H1V0.1 - c/2 orthogonal spaceship (fast!)
const P70C2_RAW = `O...........
OOOO........
..OO........
.....O......
OOOOOO......
......O.O...
O.O.OOOOOO..
O.OO.....OO.
....OO....OO
OOOOO....OO.
............
OOOOO....OO.
....OO....OO
O.OO.....OO.
O.O.OOOOOO..
......O.O...
OOOOOO......
.....O......
..OO........
OOOO........
O...........`;

// 72P6H2V0 - c/3 orthogonal spaceship
const P72_RAW = `......OOO.......OOO......
..O.OO...O.....O...OO.O..
.OOO...O.O.....O.O...OOO.
O...O....OO...OO....O...O
.O......O.OO.OO.O......O.
.......O...O.O...O.......
.......O..O...O..O.......
.........................
.........OO...OO.........
.........O.O.O.O.........
..........OO.OO..........
...........O.O...........
........OO.O.O.OO........
........O.O...O.O........`;

// 86P9H3V0 - c/3 orthogonal spaceship
const P86C3_RAW = `..............O.......O..............
..........OO.O.O.....O.O.OO..........
..........OO....O...O....OO..........
..........OO....O...O....OO..........
............OO.........OO............
.OO.OOO.OO...O.OOO.OOO.O...OO.OOO.OO.
.OO....O....O...........O....O....OO.
O..O.OO.......................OO.O..O
...............OOO.OOO...............
...............OOOOOOO...............
.............OO.......OO.............
.....................................
.............O..O.O.O..O.............`;

// B29 - c/4 diagonal spaceship
const B29_RAW = `...OO
..OO
....O
......OO
.....O

....O..O
.OO.O
OO....O
..O.O..O
.......O
....O..O
.....O.O
.....O.O
......OO
......O`;

// 60P3H1V0.3 - c/3 orthogonal spaceship (fast!)
const P60_RAW = `............O.OOO
....O......O.....O......OO.O
..OOOO....OO..O.OO...OO.O.OO.OOO
.OO...O.OO..OOOO.OOOOO..OO......O
O...O.OOOO........O...O...O...OO
....O..............O
.....O....O
.........O`;

// 77P6H1V1 - c/6 diagonal spaceship (large, desktop only)
const P77_RAW = `..................................O
.................................O.O
...............................OO..O

..............................O
...........................OO..OO
...........................OO
...........................O
.........................O.O
.........................OO
.......................O..O
......................O....O
.....................O.....O
..................O...O
.................O.O...OO
................OO.OO
...............OO....O.O
..............OO.......O
.............O.........O
..............OO
...............O
............O...O
...........O.O
..........O...O.OOO
..............O
........OO
.........OO
.....OOOO..OO
.....OO

....O
..O..O
..O..O
.O
O
.OO`;

// 86P5H1V1 - c/5 diagonal spaceship (large, desktop only)
const P86_RAW = `.........OOO
........O
.......O
...........OO
........OO.O
..............OOO
...........O..OO..OO
..O........OO.O...OO
.O..O......O..OO
O...O
O...........O..O
O..OO.OOO...O...OO.OO
...O...O..OO..O..O
.................OO..O
.....OOOO...O.....O...O
.....OO.O.O..........O
.....O.....O......OO
...........OOO
......OO.....OO.O
......OO...O....O
...........O
.............O.O
..............O`;

// Classic patterns
export const GLIDER = [
	[0, 1, 0],
	[0, 0, 1],
	[1, 1, 1]
];

export const LWSS = [
	[1, 0, 0, 1, 0],
	[0, 0, 0, 0, 1],
	[1, 0, 0, 0, 1],
	[0, 1, 1, 1, 1]
];

export const MWSS = [
	[0, 0, 0, 1, 0, 0],
	[1, 0, 0, 0, 1, 0],
	[0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1],
	[0, 1, 1, 1, 1, 1]
];

// Parsed exotic patterns
export const P58 = parseCells(P58_RAW);
export const P70 = parseCells(P70_RAW);
export const P70C2 = parseCells(P70C2_RAW); // c/2 - very fast!
export const P72 = parseCells(P72_RAW);
export const P86C3 = parseCells(P86C3_RAW); // c/3 orthogonal
export const B29 = parseCells(B29_RAW);
export const P60 = parseCells(P60_RAW);
export const P77 = parseCells(P77_RAW);
export const P86 = parseCells(P86_RAW);

// Pattern info with metadata for smart selection
export interface PatternInfo {
	pattern: number[][];
	name: string;
	speed: string; // e.g., "c/4", "c/2"
	diagonal: boolean;
	width: number;
	height: number;
}

function makePatternInfo(
	pattern: number[][],
	name: string,
	speed: string,
	diagonal: boolean
): PatternInfo {
	return {
		pattern,
		name,
		speed,
		diagonal,
		width: pattern[0]?.length ?? 0,
		height: pattern.length
	};
}

// Categorized by size for responsive selection
export const SMALL_PATTERNS: PatternInfo[] = [
	makePatternInfo(GLIDER, 'Glider', 'c/4', true),
	makePatternInfo(LWSS, 'LWSS', 'c/2', false),
	makePatternInfo(MWSS, 'MWSS', 'c/2', false),
	makePatternInfo(B29, 'B29', 'c/4', true)
];

export const MEDIUM_PATTERNS: PatternInfo[] = [
	makePatternInfo(P70, 'P70', '2c/5', false),
	makePatternInfo(P70C2, 'P70C2', 'c/2', false),
	makePatternInfo(P72, 'P72', 'c/3', false),
	makePatternInfo(P60, 'P60', 'c/3', false)
];

export const LARGE_PATTERNS: PatternInfo[] = [
	makePatternInfo(P58, 'P58', 'c/5', true),
	makePatternInfo(P86C3, 'P86C3', 'c/3', false),
	makePatternInfo(P77, 'P77', 'c/6', true),
	makePatternInfo(P86, 'P86', 'c/5', true)
];

export const ALL_PATTERNS: PatternInfo[] = [
	...SMALL_PATTERNS,
	...MEDIUM_PATTERNS,
	...LARGE_PATTERNS
];

// Get a random pattern appropriate for screen size
export function getRandomPattern(screenCols: number, screenRows: number): PatternInfo {
	const isMobile = screenCols < 60;
	const isSmallScreen = screenCols < 100 || screenRows < 80;

	// On mobile, only use small patterns
	if (isMobile) {
		return SMALL_PATTERNS[Math.floor(Math.random() * SMALL_PATTERNS.length)];
	}

	// On small screens, use small or medium
	if (isSmallScreen) {
		const available = [...SMALL_PATTERNS, ...MEDIUM_PATTERNS];
		return available[Math.floor(Math.random() * available.length)];
	}

	// On large screens, use any pattern
	return ALL_PATTERNS[Math.floor(Math.random() * ALL_PATTERNS.length)];
}
