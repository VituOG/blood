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
        gridSize: { rows: 12, cols: 16 },
        wordCount: 4,
        categories: ['senai']
    },
    medio: {
        gridSize: { rows: 15, cols: 20 },
        wordCount: 10,
        categories: ['senai', 'desenvolvimento']
    },
    dificil: {
        gridSize: { rows: 18, cols: 25 },
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
let isClickMode = false;
let clickModeCells = [];

// Sistema de ranking
let rankings = {
    facil: [],
    medio: [],
    dificil: []
};

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
    document.getElementById('completionMessage').classList.remove('active');
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
    currentGameWords = shuffleArray(selectRandomWords());
    createGrid(config.gridSize);
    placeWords(currentGameWords);
    fillEmptySpaces();
    renderGrid();
    renderWordList(currentGameWords);
    startTimer();
    foundWords.clear();
    clickModeCells = [];
    setupModeToggle();
}

function createGrid(size) {
    grid = Array(size.rows).fill().map(() => Array(size.cols).fill(''));
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
    gridElement.style.gridTemplateColumns = `repeat(${grid[0].length}, 30px)`;
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
            cell.addEventListener('touchstart', handleCellTouchStart);
            cell.addEventListener('touchmove', handleCellTouchMove);
            cell.addEventListener('touchend', handleCellTouchEnd);
            cell.addEventListener('click', handleCellClick);
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
    if (isClickMode) return;
    selectedCells = [];
    const cell = e.target;
    cell.classList.add('selected');
    selectedCells.push(cell);
    cell.setAttribute('aria-selected', 'true');
}

function handleCellMouseOver(e) {
    if (isClickMode || selectedCells.length === 0) return;
    const cell = e.target;

    // Evita adicionar a mesma célula múltiplas vezes ou células que não são 'cell'
    if (!cell.classList.contains('cell') || selectedCells.includes(cell)) {
        return;
    }

    const lastCell = selectedCells[selectedCells.length - 1];
    const lastRow = parseInt(lastCell.dataset.row);
    const lastCol = parseInt(lastCell.dataset.col);
    const newRow = parseInt(cell.dataset.row);
    const newCol = parseInt(cell.dataset.col);

    const rowDiff = newRow - lastRow;
    const colDiff = newCol - lastCol;

    // Se for a segunda célula, define a direção permitida
    if (selectedCells.length === 1) {
        // Verifica se a direção é horizontal, vertical ou diagonal
        if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
            return; // Não é uma direção válida
        }
    } else {
        // Para células subsequentes, verifica se seguem a mesma direção da primeira para a segunda célula
        const firstCell = selectedCells[0];
        const firstRow = parseInt(firstCell.dataset.row);
        const firstCol = parseInt(firstCell.dataset.col);

        const initialRowDiff = parseInt(lastCell.dataset.row) - firstRow; // Diferença da primeira para a última célula selecionada
        const initialColDiff = parseInt(lastCell.dataset.col) - firstCol;

        // Calcula a direção unitária da seleção inicial
        const initialRowDir = initialRowDiff === 0 ? 0 : initialRowDiff / Math.abs(initialRowDiff);
        const initialColDir = initialColDiff === 0 ? 0 : initialColDiff / Math.abs(initialColDiff);

        // Calcula a posição esperada da nova célula com base na direção inicial e no número de células selecionadas
        const expectedRow = parseInt(firstCell.dataset.row) + (selectedCells.length * initialRowDir);
        const expectedCol = parseInt(firstCell.dataset.col) + (selectedCells.length * initialColDir);

        // Verifica se a nova célula está na posição esperada
        if (newRow !== expectedRow || newCol !== expectedCol) {
             return; // Não segue a direção
        }
    }

    cell.classList.add('selected');
    cell.setAttribute('aria-selected', 'true');
    selectedCells.push(cell);

    const word = getSelectedWord();
    if (word) {
        const wordElement = Array.from(document.querySelectorAll('.word-item')).find(
            el => el.textContent === word && !el.classList.contains('found')
        );
        // Remover highlight anterior antes de adicionar um novo
        document.querySelectorAll('.word-item.highlight').forEach(el => {
            el.classList.remove('highlight');
        });
        if (wordElement) {
            wordElement.classList.add('highlight');
        }
    } else {
         // Remover highlight se a seleção atual não formar uma palavra válida
        document.querySelectorAll('.word-item.highlight').forEach(el => {
            el.classList.remove('highlight');
        });
    }
}

function handleCellMouseUp() {
    if (isClickMode) return;
    const word = getSelectedWord();
    if (word) {
        checkWord(word, selectedCells);
    }
    selectedCells.forEach(cell => {
        cell.classList.remove('selected');
        cell.removeAttribute('aria-selected');
    });
    selectedCells = [];
    document.querySelectorAll('.word-item.highlight').forEach(el => {
        el.classList.remove('highlight');
    });
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

// Add touch event handlers
let touchStartCell = null;

function handleCellTouchStart(e) {
    e.preventDefault();
    touchStartCell = e.target;
    selectedCells = [];
    touchStartCell.classList.add('selected');
    selectedCells.push(touchStartCell);
}

function handleCellTouchMove(e) {
    e.preventDefault();
    if (touchStartCell) {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.classList.contains('cell') && !selectedCells.includes(element)) {
            element.classList.add('selected');
            selectedCells.push(element);
        }
    }
}

function handleCellTouchEnd(e) {
    e.preventDefault();
    if (selectedCells.length > 0) {
        const word = getSelectedWord();
        if (word) {
            checkWord(word);
        }
        selectedCells.forEach(cell => cell.classList.remove('selected'));
        selectedCells = [];
    }
    touchStartCell = null;
}

// Add random color generation for found words
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
        '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', 
        '#2ECC71', '#F1C40F', '#1ABC9C', '#E74C3C',
        '#8E44AD', '#2980B9', '#D35400', '#27AE60'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function checkWord(word, cells) {
    if (currentGameWords.includes(word) && !foundWords.has(word)) {
        foundWords.add(word);
        const wordElement = Array.from(document.querySelectorAll('.word-item')).find(
            el => el.textContent === word
        );
        if (wordElement) {
            wordElement.classList.add('found');
            wordElement.setAttribute('aria-label', `${word} - Encontrada`);
            
            // Colorir as células permanentemente
            const color = getRandomColor();
            cells.forEach(cell => {
                cell.style.backgroundColor = color;
                cell.style.color = '#FFFFFF';
                cell.classList.add('word-found-cell'); // Adicionar uma classe para estilização futura se necessário
            });
        }
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
        const finalTime = Math.floor((new Date() - gameStartTime) / 1000);
        updateRanking(currentDifficulty, finalTime);
        showCompletionMessage();
    }
}

function showCompletionMessage() {
    const message = document.getElementById('completionMessage');
    const finalTime = document.getElementById('finalTime');
    finalTime.textContent = document.getElementById('time').textContent;
    message.classList.add('active');
    message.setAttribute('aria-hidden', 'false');
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

function setupModeToggle() {
    const gameContainer = document.querySelector('.game-container');
    const modeBtn = document.createElement('button');
    modeBtn.className = 'mode-btn';
    modeBtn.textContent = 'Modo Clique';
    modeBtn.setAttribute('aria-label', 'Alternar modo de seleção');
    modeBtn.setAttribute('aria-pressed', 'false');
    
    modeBtn.addEventListener('click', () => {
        isClickMode = !isClickMode;
        modeBtn.textContent = isClickMode ? 'Modo Arrastar' : 'Modo Clique';
        modeBtn.setAttribute('aria-pressed', isClickMode.toString());
        modeBtn.classList.toggle('active');
        
        // Limpar seleções ao trocar de modo
        selectedCells.forEach(cell => {
            cell.classList.remove('selected');
            cell.removeAttribute('aria-selected');
        });
        selectedCells = [];
        clickModeCells.forEach(cell => {
            cell.classList.remove('selected');
            cell.removeAttribute('aria-selected');
        });
        clickModeCells = [];
    });
    
    document.querySelector('.game-controls').prepend(modeBtn);
}

function handleCellClick(e) {
    if (!isClickMode) return;
    const cell = e.target;
    
    if (clickModeCells.includes(cell)) {
        cell.classList.remove('selected');
        cell.removeAttribute('aria-selected');
        clickModeCells = clickModeCells.filter(c => c !== cell);
    } else {
        cell.classList.add('selected');
        cell.setAttribute('aria-selected', 'true');
        clickModeCells.push(cell);
    }
    
    if (clickModeCells.length >= 2) {
        const word = getSelectedWordFromCells(clickModeCells);
        if (word) {
            checkWord(word, clickModeCells);
            clickModeCells.forEach(cell => {
                cell.classList.remove('selected');
                cell.removeAttribute('aria-selected');
            });
            clickModeCells = [];
        }
    }
}

function getSelectedWordFromCells(cells) {
    if (cells.length < 2) return null;

    const sortedCells = [...cells].sort((a, b) => {
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

function shuffleGame() {
    // Limpar o timer atual
    clearInterval(timerInterval);
    
    // Limpar palavras encontradas
    foundWords.clear();
    
    // Limpar seleções
    selectedCells.forEach(cell => {
        cell.classList.remove('selected');
        cell.removeAttribute('aria-selected');
    });
    selectedCells = [];
    clickModeCells.forEach(cell => {
        cell.classList.remove('selected');
        cell.removeAttribute('aria-selected');
    });
    clickModeCells = [];
    
    // Embaralhar as palavras atuais
    currentGameWords = shuffleArray([...currentGameWords]);
    
    // Recriar o grid com as palavras embaralhadas
    const config = gameConfig[currentDifficulty];
    createGrid(config.gridSize);
    placeWords(currentGameWords);
    fillEmptySpaces();
    renderGrid();
    
    // Embaralhar a ordem das palavras na lista
    const wordListElement = document.getElementById('wordList');
    const wordElements = Array.from(wordListElement.children);
    const shuffledElements = shuffleArray(wordElements);
    
    // Limpar a lista e adicionar as palavras embaralhadas
    wordListElement.innerHTML = '';
    shuffledElements.forEach(element => {
        wordListElement.appendChild(element);
    });
    
    // Reiniciar o timer
    startTimer();
    
    // Remover highlight das palavras
    document.querySelectorAll('.word-item.highlight').forEach(el => {
        el.classList.remove('highlight');
    });
    
    // Remover classe found das palavras
    document.querySelectorAll('.word-item.found').forEach(el => {
        el.classList.remove('found');
    });
    
    // Adicionar efeito visual de embaralhamento
    const wordList = document.querySelector('.word-list');
    wordList.classList.add('shuffling');
    setTimeout(() => {
        wordList.classList.remove('shuffling');
    }, 500);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateRanking(difficulty, time) {
    const ranking = rankings[difficulty];
    ranking.push(time);
    ranking.sort((a, b) => a - b);
    if (ranking.length > 5) {
        ranking.pop();
    }
    saveRankings();
    displayRankings();
}

function saveRankings() {
    localStorage.setItem('wordSearchRankings', JSON.stringify(rankings));
}

function loadRankings() {
    const saved = localStorage.getItem('wordSearchRankings');
    if (saved) {
        rankings = JSON.parse(saved);
    }
    displayRankings();
}

function displayRankings() {
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = '';
    
    Object.entries(rankings).forEach(([difficulty, times]) => {
        const difficultyTitle = document.createElement('h4');
        difficultyTitle.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        rankingList.appendChild(difficultyTitle);
        
        times.forEach((time, index) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            const minutes = Math.floor(time / 60).toString().padStart(2, '0');
            const seconds = (time % 60).toString().padStart(2, '0');
            item.textContent = `${index + 1}º lugar: ${minutes}:${seconds}`;
            rankingList.appendChild(item);
        });
    });
}

window.onload = () => {
    showScreen('bootScreen');
    loadRankings();
}; 