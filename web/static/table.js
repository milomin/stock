let selectedCell = null;
let focusMode = 'cursor';
window.addEventListener('message', function (event) {
    if (event.data === 'close_me') {
        closeDialog();
    }
    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.data)) {
        let cell = getAdjacentCell(selectedCell, event.data)
        if (cell) {
            let symbol = cell.getAttribute('symbol');
            if (symbol) {
                var iframe = document.getElementById('iframeContent');
                iframe.src = iframe.contentWindow.document.URL.replace(/\d{6}/, symbol);
                setSelectedCell(cell);
            }
        }
    }
});

document.addEventListener('keydown', function (event) {
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown' || event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        let cell = getAdjacentCell(selectedCell, event.code)
        if (cell) {
            focusMode = 'key'
            setSelectedCell(cell);
            let symbol = cell.getAttribute('symbol');
            show_tooltip(cell);
        }
    }
    if (event.code === 'Space') {
        if (selectedCell) {
            let symbol = selectedCell.getAttribute('symbol');
            if (symbol) {
                openDialog(`/?symbol=${symbol}&period=F5`);
            }
        }
    }
});

function renderGrid(data) {
    let table = document.getElementById('grid');
    table.innerHTML = '';

    // 添加表头
    let thead = document.createElement('thead');
    let headerRow = document.createElement('tr');
    for (let colName in data) {
        let headerCell = document.createElement('th');
        headerCell.textContent = colName;
        headerRow.appendChild(headerCell);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    let tbody = document.createElement('tbody');

    // 以最大列长度为标准，添加数据行
    let maxRows = Math.max(...Object.values(data).map(col => col.length));
    for (let i = 0; i < maxRows; i++) {
        let row = document.createElement('tr');
        for (let colName in data) {
            let cell = document.createElement('td');
            row.appendChild(cell);
            renderCell(cell, data[colName][i] || "", i)
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
}

function renderCell(cell, value, i) {
    value = value.split('|');
    cell.textContent = value[0];
    if (cell.textContent === "") {
        cell.classList.add("table-empty" + parseInt(i / 20));
        return;
    }
    addDotClass(cell, value[2])
    cell.setAttribute('v', `${value[2]} # ${value[3]}`);
    cell.setAttribute('symbol', value[1]);
    cell.addEventListener('click', function () {
        var cellRect = cell.getBoundingClientRect();

        var clickX = event.clientX - cellRect.left;

        if (clickX < cellRect.width / 2) {
            highlightCells(cell.textContent);
        } else {
            if (focusMode === 'cursor') {
                setSelectedCell(cell)
                openDialog(`/?symbol=${value[1]}&period=${KLINE_PERIOD}`);
            }
            focusMode = 'cursor';
        }
    });
    cell.addEventListener('mouseover', function () {
        if (focusMode === 'cursor') {
            show_tooltip(this)
            setSelectedCell(this)
        }

    });
}

function openDialog(url) {
    var iframe = document.getElementById('iframeContent');
    iframe.src = url;

    myDialog.showModal();

    document.addEventListener('click', handleClickOutside);
}

function closeDialog() {
    myDialog.close();
    document.removeEventListener('click', handleClickOutside);
}

function handleClickOutside(event) {
    if (event.target === myDialog) {
        closeDialog();
    }
}

function getAdjacentCell(cell, direction) {
    if (!cell) return;
    var row = cell.parentNode.rowIndex;
    var col = cell.cellIndex;

    var table = document.getElementById("grid");
    var numRows = table.rows.length;
    var numCols = table.rows[0].cells.length;

    switch (direction) {
        case "ArrowUp":
            return row > 0 ? table.rows[row - 1].cells[col] : null;
        case "ArrowRight":
            return col < numCols - 1 ? table.rows[row].cells[col + 1] : null;
        case "ArrowDown":
            return row < numRows - 1 ? table.rows[row + 1].cells[col] : null;
        case "ArrowLeft":
            return col > 0 ? table.rows[row].cells[col - 1] : null;
        default:
            return null;
    }
}

function setSelectedCell(cell) {
    if (selectedCell) {
        selectedCell.classList.remove('select-cell')
    }
    selectedCell = cell
    cell.classList.add('select-cell')
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 3; i++) {
        color += letters[Math.floor(Math.random() * 6) + 8]; // 从8到F中选择亮色
    }
    return color;
}

function highlightCells(value) {
    let cells = document.querySelectorAll('td');
    color = getRandomColor();
    for (let cell of cells) {
        if (cell.textContent === value) {
            cell.style.backgroundColor = cell.style.backgroundColor ? "" : color;
        }
    }
}