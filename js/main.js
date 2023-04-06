
import TableInterface from "./TableInterface.mjs"
let myInterface = new TableInterface();

// Mabey a title that the user can edit

document.querySelector("#confirm").addEventListener('click',(e)=>{
    myInterface.editCell();
})
document.querySelector("#formula").title = `
Formulas:
FLOOR(number) - rounds the number down
CEIL(number) - rounds the number up
MAX(number1, number2, number3...) - returns the largest of the numbers
MIN(number1, number2, number3...) - returns the smallest of the numbers
`
let title = document.querySelector("#title");

setInterval(() => {
    document.title = title.innerText;
}, 1000);

