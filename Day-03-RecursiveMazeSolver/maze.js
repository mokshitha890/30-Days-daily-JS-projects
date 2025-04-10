let mazedata = null;

// console.log(mazedata);
function SolveMaze(maze, x, y) {

    if (x < 0 || y < 0 || x > (maze.length - 1) || y > (maze[0].length - 1) || maze[x][y] === 1) {
        console.log(x, y + "not in range")
        return false;
    }
    if (maze[x][y] === 'E') {
        console.log(x, y + "reached end")
        return true;
    }

    // if (document.getElementById(`cell-${x}-${y}`).style.backgroundColor === 'yellow') {
    if (parseInt(document.getElementById(`cell-${x}-${y}`).getAttribute('data-visited'))) {
        console.log(x, y + "already visted")
        return false
    }
    // document.getElementById(`cell-${x}-${y}`).style.backgroundColor = "yellow";
    document.getElementById(`cell-${x}-${y}`).setAttribute('data-visited', 1)
    if (
        SolveMaze(maze, x + 1, y) ||
        SolveMaze(maze, x - 1, y) ||
        SolveMaze(maze, x, y + 1) ||
        SolveMaze(maze, x, y - 1)
    ) {

        document.getElementById(`cell-${x}-${y}`).style.backgroundColor = 'lightgreen';
        return true;
    }







}
function startSolving() {
    const mazeCopy = mazedata.map(row => row.slice());
    // console.log(mazeCopy)
    SolveMaze(mazeCopy, 0, 0);

}
buildUi();
function buildUi() {
    generateRandomMazeData(10, 40)

    let tableHTML = '';
    mazedata.forEach((row, rowIndex) => {
        let tr = `<tr>`
        row.forEach((cell, colunmIndex) => {
            let className = 'cell'

            if (cell == 'E') className = 'cell-end'
            if (cell == 'S') className = 'cell-start';
            if (cell === 1) className = 'cell-wall';

            tr += ` <td  class="${className}"  id="cell-${rowIndex}-${colunmIndex}">
                        ${(cell == 1 || cell == 0) ? "" : cell}
                    </td>`
        })
        tr += `</tr>`
        tableHTML += tr

    })
    document.getElementsByTagName('table')[0].innerHTML = null
    document.getElementsByTagName('table')[0].insertAdjacentHTML("afterbegin", tableHTML);
}

function generateRandomMazeData(rowLength, columnLength) {
    let maze_data = [];
    let rowIndex = 0;
    while (rowIndex < rowLength) {
        let colunmIndex = 0;
        let rowArr = []
        while (colunmIndex < columnLength) {
            let cell = null;

            cell = randomBinary(.28);
            // S,E
            if (colunmIndex == 0 && rowIndex == 0) cell = 'S';
            if (colunmIndex == (columnLength - 1) && rowIndex == (rowLength - 1)) cell = 'E';


            rowArr.push(cell)
            colunmIndex++;
        }
        maze_data.push(rowArr)
        rowIndex++;

    }
    console.log(maze_data)
    mazedata = maze_data;
}

function randomBinary(probabilityOfOne) {
    return Math.random() < probabilityOfOne ? 1 : 0;
}


function resetUI() {
    buildUi()
}



