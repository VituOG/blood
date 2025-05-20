const wordBank = {
    senai: [
        'SENAI', 'DESENVOLVIMENTO', 'SISTEMAS', 'MECANICA',
        'ELETROMECANICA', 'ELETROELETRONICA', 'LOGISTICA',
        'ADMINISTRACAO', 'QUALIDADE', 'SEGURANCA', 'EQUIPE',

    ],
    tecnologia: [
        'HTML', 'CSS', 'JAVASCRIPT', 'PYTHON', 'JAVA',
        'PHP', 'REACT', 'NODE', 'MYSQL', 'LINUX',
        'GIT', 'API', 'CLOUD', 'DEVOPS', 'FRONTEND',
        'BACKEND', 'MOBILE', 'DESKTOP', 'WEB', 'DATABASE'
    ],
    desenvolvimento: [
        'ALGORITMO', 'PROGRAMA', 'CODIGO', 'FRAMEWORK',
        'INTERFACE', 'ARQUITETURA', 'MICROSERVICOS',
        'CYBERSECURITY', 'INTELLIGENCE', 'ANALISE',
        'DESIGN', 'TESTE', 'DEPLOY', 'VERSIONAMENTO',
        'DOCUMENTACAO', 'REQUISITOS'
    ]
};

const gameConfig = {
    facil: {
        gridSize: 16,
        wordCount: 4,
        categories: ['senai']
    },
    medio: {
        gridSize: 20,
        wordCount: 10,
        categories: ['senai', 'desenvolvimento']
    },
    dificil: {
        gridSize: 25,
        wordCount: 14,
        categories: ['senai', 'tecnologia', 'desenvolvimento']
    }
};

let currentDifficulty = 'medio';
let grid = [];
let selectedCells = [];
let foundWords = new Set();
let gameStartTime = null;
let timerInterval = null;
let currentGameWords = []; 


function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function startGame(difficulty) {
    currentDifficulty = difficulty;
    showScreen('gameScreen');
    initGame();
}

function returnToMenu() {
    clearInterval(timerInterval);
    showScreen('bootScreen');
}


function selectRandomWords() {
    const config = gameConfig[currentDifficulty];
    const selectedWords = new Set();
    const categories = config.categories;
    
    while (selectedWords.size < config.wordCount) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const words = wordBank[category];
        const word = words[Math.floor(Math.random() * words.length)];
        selectedWords.add(word);
    }
    
    return Array.from(selectedWords);
}


function initGame() {
    const config = gameConfig[currentDifficulty];
    currentGameWords = selectRandomWords();
    createGrid(config.gridSize);
    placeWords(currentGameWords);
    fillEmptySpaces();
    renderGrid();
    renderWordList(currentGameWords);
    startTimer();
    foundWords.clear();
}

function createGrid(size) {
    grid = Array(size).fill().map(() => Array(size).fill(''));
}

function placeWords(words) {
    const directions = [
        [0, 1],   
        [1, 0],   
        [1, 1],  
        [1, -1]   
    ];

  
    words.sort((a, b) => b.length - a.length);

    words.forEach(word => {
        let placed = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!placed && attempts < maxAttempts) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            

            const maxRow = grid.length - (direction[0] * (word.length - 1));
            const maxCol = grid[0].length - (direction[1] * (word.length - 1));
            
            const row = Math.floor(Math.random() * maxRow);
            const col = Math.floor(Math.random() * maxCol);

            if (canPlaceWord(word, row, col, direction)) {
                placeWord(word, row, col, direction);
                placed = true;
            }
            
            attempts++;
        }

        if (!placed) {
            console.warn(`Não foi possível colocar a palavra: ${word}`);
        }
    });
}

function canPlaceWord(word, row, col, [dx, dy]) {

    const endRow = row + (word.length - 1) * dx;
    const endCol = col + (word.length - 1) * dy;
    
    if (endRow < 0 || endRow >= grid.length || endCol < 0 || endCol >= grid[0].length) {
        return false;
    }


    for (let i = 0; i < word.length; i++) {
        const currentRow = row + i * dx;
        const currentCol = col + i * dy;
        
        if (grid[currentRow][currentCol] !== '' && grid[currentRow][currentCol] !== word[i]) {
            return false;
        }
    }

    return true;
}

function placeWord(word, row, col, [dx, dy]) {
    for (let i = 0; i < word.length; i++) {
        grid[row + i * dx][col + i * dy] = word[i];
    }
}

function fillEmptySpaces() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

function renderGrid() {
    const gridElement = document.getElementById('wordGrid');
    gridElement.style.gridTemplateColumns = `repeat(${grid.length}, 30px)`;
    gridElement.innerHTML = '';

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = grid[i][j];
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('mousedown', handleCellMouseDown);
            cell.addEventListener('mouseover', handleCellMouseOver);
            cell.addEventListener('mouseup', handleCellMouseUp);
            gridElement.appendChild(cell);
        }
    }
}

function renderWordList(words) {
    const wordListElement = document.getElementById('wordList');
    wordListElement.innerHTML = '';
    words.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word-item';
        wordElement.textContent = word;
        wordListElement.appendChild(wordElement);
    });
}

function handleCellMouseDown(e) {
    selectedCells = [];
    const cell = e.target;
    cell.classList.add('selected');
    selectedCells.push(cell);
}

function handleCellMouseOver(e) {
    if (selectedCells.length > 0) {
        const cell = e.target;
        if (!selectedCells.includes(cell)) {
            cell.classList.add('selected');
            selectedCells.push(cell);
        }
    }
}

function handleCellMouseUp() {
    if (selectedCells.length > 0) {
        const word = getSelectedWord();
        if (word) {
            checkWord(word);
        }
        selectedCells.forEach(cell => cell.classList.remove('selected'));
        selectedCells = [];
    }
}

function getSelectedWord() {
    if (selectedCells.length < 2) return null;

    const sortedCells = [...selectedCells].sort((a, b) => {
        const rowA = parseInt(a.dataset.row);
        const colA = parseInt(a.dataset.col);
        const rowB = parseInt(b.dataset.row);
        const colB = parseInt(b.dataset.col);
        
        if (rowA !== rowB) return rowA - rowB;
        return colA - colB;
    });

    const firstCell = sortedCells[0];
    const lastCell = sortedCells[sortedCells.length - 1];
    const firstRow = parseInt(firstCell.dataset.row);
    const firstCol = parseInt(firstCell.dataset.col);
    const lastRow = parseInt(lastCell.dataset.row);
    const lastCol = parseInt(lastCell.dataset.col);

    const rowDiff = lastRow - firstRow;
    const colDiff = lastCol - firstCol;
    

    if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
        const rowDir = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
        const colDir = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
        
        const letters = [];
        let currentRow = firstRow;
        let currentCol = firstCol;
        

        while (true) {
            const cell = document.querySelector(`.cell[data-row="${currentRow}"][data-col="${currentCol}"]`);
            if (!cell) break;
            
            letters.push(cell.textContent);
            
            if (currentRow === lastRow && currentCol === lastCol) break;
            
            currentRow += rowDir;
            currentCol += colDir;
        }
        
        return letters.join('');
    }
    
    return null;
}

function checkWord(word) {
    if (currentGameWords.includes(word) && !foundWords.has(word)) {
        foundWords.add(word);
        updateWordList();
        checkGameComplete();
    }
}

function updateWordList() {
    const wordElements = document.querySelectorAll('.word-item');
    wordElements.forEach(element => {
        if (foundWords.has(element.textContent)) {
            element.classList.add('found');
        }
    });
}

function checkGameComplete() {
    if (foundWords.size === currentGameWords.length) {
        clearInterval(timerInterval);
        showCompletionMessage();
    }
}

function showCompletionMessage() {
    const finalTime = document.getElementById('time').textContent;
    document.getElementById('finalTime').textContent = finalTime;
    document.getElementById('completionMessage').classList.add('active');
}

function startTimer() {
    gameStartTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const now = new Date();
    const diff = Math.floor((now - gameStartTime) / 1000);
    const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
    const seconds = (diff % 60).toString().padStart(2, '0');
    document.getElementById('time').textContent = `${minutes}:${seconds}`;
}


window.onload = () => {
    showScreen('bootScreen');
}; 