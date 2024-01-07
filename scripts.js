//create the sudoku grid in html with cells
function createSudokuGrid() {
	const grid = document.getElementById("sudoku-grid");
	for (let i=0; i<81; ++i) {
		const cell = document.createElement("input");
		cell.type="text";
		cell.maxLength="1";
		cell.size="20";
		grid.appendChild(cell);
	}
}
createSudokuGrid();

//keep track of cells in html
let allValidCells = true;
const cells = Array.from(document.querySelectorAll('#sudoku-grid input'));

//add event listeners to cells
cells.forEach((cell,index) => {
	cell.addEventListener('focus', (event) => {
		clearHighlights();
		highlightRowColBox(event.target);
	});

	cell.addEventListener('blur', clearHighlights);

	cell.addEventListener('input', () => {
		const value = cell.value;
		const board = readBoard();
		const row = Math.floor(index / 9);
		const col = index % 9;

		if (value && (value < 1 || value > 9 || !Number.isInteger(Number(value)))) {
			cell.style.backgroundColor = 'red';
			allValidCells=false;
		} else if (checkCellValidity(board, row, col)) {
			cell.style.backgroundColor = '';
			allValidCells=true;
		} else {
			cell.style.backgroundColor = 'red';
			allValidCells=false;
		}
	});
});

//add event listener to solve button
document.getElementById('solve-button').addEventListener('click', async () => {
	const board = readBoard();
	if (!allValidCells) {
		window.alert("Invalid input detected. Please enter numbers between 1 and 9.");
	} else if (!isBoardValid(board)) {
		window.alert("This is not a valid board.");
	} else if (await solveSudoku(board)) {
		writeBoard(board);
	} else {
		window.alert("No solution exists for the given board.");
	}
});

//clear all cell highlights
function clearHighlights() {
	cells.forEach(cell => {
		cell.classList.remove("highlighted");
	});
}

//highlight a single cell
function highlightCell(cell) {
	cell.classList.add('highlighted');
}

//highlight row, column, and box that a selected cell is in
function highlightRowColBox(selectedCell) {
	const selectedRow = Math.floor(cells.indexOf(selectedCell)/9);
	const selectedCol = cells.indexOf(selectedCell)%9

	cells.forEach((cell,index)=> {
		const row = Math.floor(index / 9);
		const col = index % 9 ;
		const boxStartRow = selectedRow - selectedRow % 3;
		const boxStartCol = selectedCol - selectedCol % 3;

		if (row === selectedRow || col === selectedCol ||
			(row >= boxStartRow && row < boxStartRow + 3 &&
			 col >= boxStartCol && col < boxStartCol + 3)) {
		highlightCell(cell);
		}
	});
}

//read values of the puzzle
function readBoard() {
	let board = [];
	let row = [];
	cells.forEach((cell, index) => {
		row.push(cell.value || '');
		if ((index) % 9 == 8) {
			board.push(row);
			row = [];
		}
	});
	return board;
}

//write current puzzle values to html
function writeBoard(board, row, col) {
	const index = row * 9 + col;
	cells[index].value = board[row][col];
	highlightCell(cells[index]);
}

//check if cell is valid
function checkCellValidity(board, row, col) {
	let num = board[row][col];
	if (num === '') return true;

	board[row][col] = '';
	let isEntryValidNum = isEntryValid(board, row, col, num);
	board[row][col] = num;

	return isEntryValidNum;
}

//check if a new entry is valid for the board
function isEntryValid(board, row, col, num) {
	for (let x = 0; x < 9; x++) {
		if (board[row][x] == num || board[x][col] == num || 
			board[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3] == num) {
			return false;
		}
	}
	return true;
}

//check if the whole board is valid
function isBoardValid(board) {
	for (let row = 0; row < 9; row++) {
		for (let col = 0; col < 9; col++) {
			if (board[row][col] != '') {
				let num = board[row][col];
				board[row][col] = '';
				if (!isEntryValid(board, row, col, num)) {
					board[row][col] = num;
					return false;
				}
				board[row][col] = num;
			}
		}
	}
	return true;
}

//solve the puzzle
async function solveSudoku(board) {
	for (let row = 0; row < board.length; row++) {
		for (let col = 0; col < board[row].length; col++) {
			if (board[row][col] == '') {

				for (let num = 1; num <= 9; num++) {
					if (isEntryValid(board, row, col, num)) {
						board[row][col] = `${num}`;
						writeBoard(board, row, col);
						await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay

						if (!allValidCells) {
							return false;
						}

						if (await solveSudoku(board)) {
							return true;
						} else {
							board[row][col] = '';
							writeBoard(board, row, col);
						}
					}
				}
				return false;
			}

		}
	}
	return true;
}