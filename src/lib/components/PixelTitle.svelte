<script lang="ts">
	// Condensed letters: 6 wide x 15 tall with 2-cell-wide strokes
	const LETTER_PATTERNS: Record<string, number[][]> = {
		b: [
			[1, 1, 1, 1, 1, 0],
			[1, 1, 1, 1, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 1, 1, 0],
			[1, 1, 1, 1, 0, 0],
			[1, 1, 1, 1, 1, 0],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 0]
		],
		o: [
			[0, 1, 1, 1, 1, 0],
			[1, 1, 1, 1, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 1, 1, 1, 1],
			[0, 1, 1, 1, 1, 0]
		],
		s: [
			[0, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1],
			[1, 1, 0, 0, 0, 0],
			[1, 1, 0, 0, 0, 0],
			[1, 1, 0, 0, 0, 0],
			[1, 1, 1, 0, 0, 0],
			[0, 1, 1, 1, 0, 0],
			[0, 0, 1, 1, 1, 0],
			[0, 0, 0, 1, 1, 1],
			[0, 0, 0, 0, 1, 1],
			[0, 0, 0, 0, 1, 1],
			[0, 0, 0, 0, 1, 1],
			[0, 0, 0, 0, 1, 1],
			[1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 0]
		],
		h: [
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1]
		],
		a: [
			[0, 0, 1, 1, 0, 0],
			[0, 1, 1, 1, 1, 0],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1]
		],
		n: [
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 1, 0, 1, 1],
			[1, 1, 1, 0, 1, 1],
			[1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1],
			[1, 1, 0, 1, 1, 1],
			[1, 1, 0, 1, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1],
			[1, 1, 0, 0, 1, 1]
		]
	};

	const LETTERS = ['b', 'o', 'b', 'o', 's', 'h', 'a', 'n'];
	const LETTER_WIDTH = 6;
	const LETTER_HEIGHT = 15;
	const LETTER_GAP = 1;
	const PADDING_X = 3; // Extra pixel columns on each side
	const PADDING_Y = 2; // Extra pixel rows on top and bottom

	interface Cell {
		row: number;
		col: number;
		active: boolean;
		original: boolean;
	}

	let cells: Cell[][] = $state([]);

	// Build a 2D grid: rows x cols (with padding pixels)
	function initCells(): Cell[][] {
		const contentCols = LETTERS.length * LETTER_WIDTH + (LETTERS.length - 1) * LETTER_GAP;
		const totalCols = contentCols + PADDING_X * 2;
		const totalRows = LETTER_HEIGHT + PADDING_Y * 2;
		const result: Cell[][] = [];

		for (let row = 0; row < totalRows; row++) {
			const rowCells: Cell[] = [];
			const contentRow = row - PADDING_Y;

			for (let col = 0; col < totalCols; col++) {
				const contentCol = col - PADDING_X;

				// Check if this cell is in the padding area
				const isPadding =
					row < PADDING_Y ||
					row >= totalRows - PADDING_Y ||
					col < PADDING_X ||
					col >= totalCols - PADDING_X;

				if (isPadding) {
					rowCells.push({
						row,
						col,
						active: false,
						original: false
					});
				} else {
					// Calculate which letter and position within letter
					let letterCol = contentCol;
					let isActive = false;

					let currentCol = 0;
					for (let letterIdx = 0; letterIdx < LETTERS.length; letterIdx++) {
						const letterStart = currentCol;
						const letterEnd = currentCol + LETTER_WIDTH;

						if (letterCol >= letterStart && letterCol < letterEnd) {
							// This column is within this letter
							const letter = LETTERS[letterIdx];
							const pattern = LETTER_PATTERNS[letter];
							const px = letterCol - letterStart;
							isActive = pattern[contentRow]?.[px] === 1;
							break;
						}

						currentCol += LETTER_WIDTH;

						// Check gap
						if (letterIdx < LETTERS.length - 1) {
							const gapEnd = currentCol + LETTER_GAP;
							if (letterCol >= currentCol && letterCol < gapEnd) {
								// This is in the gap
								isActive = false;
								break;
							}
							currentCol += LETTER_GAP;
						}
					}

					rowCells.push({
						row,
						col,
						active: isActive,
						original: isActive
					});
				}
			}

			result.push(rowCells);
		}

		return result;
	}

	cells = initCells();

	function toggleCell(row: number, col: number): void {
		cells[row][col].active = !cells[row][col].active;
	}

	const totalCols =
		LETTERS.length * LETTER_WIDTH + (LETTERS.length - 1) * LETTER_GAP + PADDING_X * 2;
</script>

<div class="pixel-title-container">
	<div class="pixel-grid" style="--cols: {totalCols};" role="img" aria-label="boboshan">
		{#each cells as rowCells, rowIdx (rowIdx)}
			{#each rowCells as cell, colIdx (rowIdx + '-' + colIdx)}
				<button
					class="pixel-cell"
					class:active={cell.active}
					onclick={() => toggleCell(rowIdx, colIdx)}
					aria-label="Toggle pixel at row {rowIdx}, col {colIdx}"
				></button>
			{/each}
		{/each}
	</div>
</div>

<style>
	.pixel-title-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.pixel-grid {
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		gap: 1px;
		background: rgba(10, 10, 10, 0.9);
	}

	.pixel-cell {
		width: 8px;
		height: 8px;
		box-sizing: border-box;
		background-color: rgba(26, 26, 26, 0.5);
		border: 1px solid rgba(50, 50, 50, 0.4);
		cursor: pointer;
		transition: background-color 0.05s;
	}

	/* Responsive cell sizes */
	@media (max-width: 480px) {
		.pixel-cell {
			width: 5px;
			height: 5px;
		}
	}

	@media (min-width: 481px) and (max-width: 640px) {
		.pixel-cell {
			width: 6px;
			height: 6px;
		}
	}

	.pixel-cell:hover {
		background-color: rgba(58, 58, 58, 0.6);
		border-color: rgba(70, 70, 70, 0.5);
	}

	.pixel-cell.active {
		background-color: #e8e8e8;
		border-color: #b4b4b4;
	}

	.pixel-cell.active:hover {
		background-color: #4a9eff;
		border-color: #4a9eff;
	}
</style>
