document.querySelector('.calculation-block').addEventListener("click", (event) => {
    if (event.target !== event.currentTarget) {
        const SelectedNumber = event.target.getAttribute('data-number')
        Addvalues(SelectedNumber)
    }
})

let NumberCal = [];
let isEvaluated = false;
function Addvalues(num) {

    if (num === '=') {
        let Expression = NumberCal.join('');
        console.log("exp", Expression)
        let ExpressionResult = eval(Expression);
        document.getElementsByClassName('result')[0].innerHTML = ExpressionResult;
        document.getElementsByClassName('history-track')[0].innerHTML +=
            `<div style="background-color:lightgray; padding:5px; margin:5px;overflow: hidden;text-overflow: ellipsis;width:230px;">${Expression}</div>`;
    } else if (num === 'c') {
        NumberCal = [];
        console.log(NumberCal)
        document.getElementsByClassName('user-input')[0].innerHTML = "";
        document.getElementsByClassName('result')[0].innerHTML = "";
    }
    else {
        let AddedNumber = NumberCal.push(num)
        const concatedString = NumberCal.join('')
        document.getElementsByClassName('user-input')[0].innerHTML = concatedString;
        // document.getElementsByClassName('history-track')[0].innerHTML = concatedString;
    }

}

document.addEventListener("keydown", (event) => {
    const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '%', '(', ')', '=', 'Enter', 'c', 'C', 'Backspace'];
    let key = event.key;
    console.log(key)
    if (validKeys.includes(key)) {
        if (key === 'Enter') {
            Addvalues('=');
        } else if (key.toLowerCase() === 'c') {
            Addvalues('c');
        }
        else if (key === 'Backspace') {
            NumberCal.pop()
            const concatedString = NumberCal.join('')
            document.getElementsByClassName('user-input')[0].innerHTML = concatedString;

        } else {
            Addvalues(key);
        }
    } console.log(key)
})

