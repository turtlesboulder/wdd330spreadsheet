import FunctionInterpreter from "./FunctionInterpreter.mjs";

export default class TableInterface{
    constructor(){
        this.table = document.querySelector("#cells");
        this.formulaInput = document.querySelector("#formula");
        this.table.numRows = 0;
        this.table.numCols = 0;
        this.selected = null;
        this.interpreter = new FunctionInterpreter(this.table);
        this.createEventListeners();
        // Load the table, see if there is one to load
        if ((this.loadTable("t"))){
        }else{
            this.newTable();
        }
        setInterval(()=>{
            this.saveTable("t");
        },10000)
    }
    selectCell(cell){
        // Cell should be a td element
        if (cell == null){
            return;
        }
        if (this.selected != null){
            this.selected.classList.remove("selected");
        }
        if (this.selected == cell){
            this.selected = null;
        }else{
            this.selected = cell;
            cell.classList.add("selected");
        }
        
        this.formulaInput.value = cell.value;
    }
    editCell(){
        // Edits the selected cell
        if (this.selected == null){
            alert("A cell must be selected to edit its value.");
        }
        this.selected.value = this.formulaInput.value
        this.selected.textContent = this.interpreter.interpret(this.selected);
    }
    expandTable(rows, cols){
        for (let i = 0; i < rows; i++){
            this.makeRow();
        }
        for (let i = 0; i < cols; i++){
            this.makeColumn();
        }
    }
    makeRow(){
        // Reduce the number of this.
        let table = this.table
        table.appendChild(document.createElement("tr"));

        // Row header
        let th = document.createElement('th');
        if (table.numRows != 0){
            th.innerHTML = table.numRows;
        }
        table.lastChild.appendChild(th);

        for (let i = 0; i < table.numCols; i++){
            let td = document.createElement("td");
            td.value = "";
            td.dependencies = [];
            td.Rdependencies = [];
            table.lastChild.appendChild(td);
        }
        table.numRows += 1;
    }
    makeColumn(){
        // Reduce the number of this.
        let table = this.table
        let children = table.children;
        if (children.length != table.numRows){
            // Make an error class
            throw "Table has wrong number of rows!";
        }

        // Column header
        let th = document.createElement('th');
        th.innerHTML = this.getColumnHeader(table.numCols);
        children[0].appendChild(th);

        // The for loop is wonky cause the headers
        for (let i = 1; i < table.numRows; i++){
            let td = document.createElement("td");
            td.value = "";
            td.dependencies = [];
            td.Rdependencies = [];
            children[i].appendChild(td);
        }
        table.numCols += 1;
    }
    saveTable(key){
        // Make sure each cell has a valid value. Should this really be here? It shouldnt.
        document.querySelectorAll("td").forEach((td)=>{
            if (td.value == null){
                td.value = "";
            }
        })
        let tableArray  = [];
        for (let i = 0; i < this.table.numRows; i++){
            let tableRow = [];
            for (let j = 0; j < this.table.numCols; j++){
                tableRow.push(this.table.children[i].children[j].value);
            }
            tableArray.push(tableRow);
        }
        let storageObj = {};
        storageObj.array = tableArray;
        storageObj.title = document.querySelector("#title").innerText;
        localStorage.setItem(key, JSON.stringify(storageObj));
    }
    loadTable(key){
        // Returns a bool if the table already exists
        let storageObj = JSON.parse(localStorage.getItem(key));
        if (storageObj == null){
            return false;
        }
        let tableArray = storageObj.array;
        let rows = tableArray.length;
        let cols = 0;
        if (rows != 0){
            // All the rows should have the same number of columns
            cols = tableArray[0].length;
        }
        this.expandTable(rows, cols);

        let tr = null;
        for (let i = 1; i < rows; i++){
            // tr
            tr = this.table.children[i];
            // Adjust for the headers, so j=1
            for (let j = 1; j < cols; j++){
                // td
                tr.children[j].value = tableArray[i][j];
                tr.children[j].textContent = this.interpreter.interpret(tr.children[j]);
            }
        }
        document.querySelector("#title").innerText = storageObj.title;
        document.title = storageObj.title;

        return true;
    }
    newTable(){
        this.expandTable(20, 10);
        document.querySelectorAll("#cells td").forEach((td)=>{
            td.value = "";
        })
    }
    createEventListeners() {
        this.table.addEventListener('click', (e) => {
            this.selectCell(e.target.closest("td"));
        })
        document.addEventListener('keydown', (e) => {
            if (!this.selected) {
                return;
            }
    
            const rowIndex = this.selected.parentElement.rowIndex;
            const cellIndex = this.selected.cellIndex;
    
            if (e.key === "ArrowDown") {
                const newRow = rowIndex + 1;
                if (newRow >= this.table.numRows) {
                    this.expandTable(1, 0);
                }
                this.selectCell(this.table.rows[newRow].cells[cellIndex]);
            }
            if (e.key === "ArrowLeft") {
                if (cellIndex > 0) {
                    this.selectCell(this.table.rows[rowIndex].cells[cellIndex - 1]);
                }
            }
            if (e.key === "ArrowRight") {
                const newCell = cellIndex + 1;
                if (newCell >= this.table.numCols) {
                    this.expandTable(0, 1);
                }
                this.selectCell(this.table.rows[rowIndex].cells[newCell]);
            }
            if (e.key === "ArrowUp") {
                if (rowIndex > 0) {
                    this.selectCell(this.table.rows[rowIndex - 1].cells[cellIndex]);
                }
            }
            if (e.key === "Tab") {
                e.preventDefault(); // Prevent default tab behavior
                this.editCell();
    
                const newCell = cellIndex + 1;
                if (newCell >= this.table.numCols) {
                    this.expandTable(0, 1);
                }
                this.selectCell(this.table.rows[rowIndex].cells[newCell]);
            }
            if (e.key === "Enter") {
                this.editCell();
    
                const newRow = rowIndex + 1;
                if (newRow >= this.table.numRows) {
                    this.expandTable(1, 0);
                }
                this.selectCell(this.table.rows[newRow].cells[cellIndex]);
            }
            if (["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "Tab", "Enter"].includes(e.key)) {
                if (this.selected) {
                    this.selected.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                }
            }
        })
    }
    getColumnHeader(index) {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let columnHeader = "";
    
        index++; // Adjust index to 1-based counting
    
        while (index > 0) {
            let charIndex = (index - 1) % alphabet.length;
            columnHeader = alphabet[charIndex] + columnHeader;
            index = Math.floor((index - 1) / alphabet.length);
        }
    
        return columnHeader;
    }
}