import functions from "./functions.mjs";

export default class FunctionInterpreter{
    constructor(table){
        this.table = table;
    }
    scopeFinder(string, startIndex) {
        // Returns the endIndex of a block of some kind. The startIndex should be an opening quote, bracket, or brace.
        // It will return the index of the closing quote, bracket, or brace.
      
        const openBrackets = ['{', '[', '(', "'", '"'];
        const closeBrackets = ['}', ']', ')', "'", '"'];
        const stack = [];
      
        for (let i = startIndex; i < string.length; i++) {
          const currentChar = string[i];
      
          if (openBrackets.includes(currentChar)) {
            stack.push(currentChar);
          } else if (closeBrackets.includes(currentChar)) {
            const correspondingOpenBracket = openBrackets[closeBrackets.indexOf(currentChar)];
      
            if (stack.length === 0 || stack[stack.length - 1] !== correspondingOpenBracket) {
              return -1; // Mismatched brackets
            }
      
            stack.pop();
      
            if (stack.length === 0) {
              return i; // Found the closing bracket, brace, or quote
            }
          }
        }
      
        return -1; // No matching closing bracket, brace, or quote found
      }
    removeWhitespace(str) {
        // Regex that targets all whitespace
        // Might need to use this later, currently unused
        return str.replace(/\s+/g, '');
      }

      interpret(cellToInterpret, numCalls=0) {
        if (numCalls > 100){
          return "Error: Circular refrence";
        }
        // Tell the other cells that have this cell as a dependency to stop updating this.
        this.resetDependencies(cellToInterpret)

        // Returns what the text content of cellToInterpret should be, and adds dependencies. This is really big, it probably wants to be split.
        let str = cellToInterpret.value;
        str = str.trim();
        if (str.length === 0) {
          cellToInterpret.textContent = "";
          this.updateDependencies(cellToInterpret);
          return "";
        }
        if (str[0] !== "=") {
          // Equals sign means a formula
          cellToInterpret.textContent = str;
          this.updateDependencies(cellToInterpret);
          return str;
        }
      
        // Remove the equals sign from the beginning of the string
        str = str.slice(1);
      
        // Replace cell references with their textContent
        str = str.replace(/[A-Z]+\d+/g, (match) => {
        const cell = this.cellFinder(match);
        if (!cell) {
          cellToInterpret.textContent = "Error: Invalid cell reference";
          this.updateDependencies(cellToInterpret);
          return "Error: Invalid cell reference";
        }
        // Handle dependencies
        this.addDependency(cell, cellToInterpret); // Tell the cells that need to update me to do so
        this.addRDependency(cellToInterpret, cell); // Keep a list of the cells that update me

        const cellContent = cell.textContent;
        return this.wrapIfString(cellContent);
        });
        // Replace function calls with their results
        const regex = /([a-zA-Z]+)\(/g;
        let match;
        while ((match = regex.exec(str)) !== null) {
          const funcName = match[1];
          const offset = match.index;
          const openParenIndex = offset + funcName.length;
          const closeParenIndex = this.scopeFinder(str, openParenIndex);
          const paramString = str.slice(openParenIndex + 1, closeParenIndex);
          const params = paramString.split(",").map(param => parseFloat(param.trim()));
          const result = this.evaluateFunctionCall(funcName, params);
      
          str = str.slice(0, offset) + result + str.slice(closeParenIndex + 1);
          regex.lastIndex = 0;
        }
      
        // Evaluate the resulting arithmetic expression
        let result;
        try {
          result = eval(str);
        } catch (e) {
          result = "Error: Invalid expression";
        }
        cellToInterpret.textContent = result;
        this.updateDependencies(cellToInterpret);
        return result;
      }
      
      cellFinder(str) {
        // Convert the input string to a row and column index
        const [, colStr, rowStr] = str.match(/([A-Z]+)(\d+)/);
        const colIdx = colStr.split('').reduce((sum, char, idx) => {
          return sum + (char.charCodeAt(0) - 'A'.charCodeAt(0) + 1) * Math.pow(26, colStr.length - idx - 1);
        }, 0);
        const rowIdx = parseInt(rowStr);
      
        // Use querySelector with :nth-of-type pseudo-class to find the specific <td> element
        const cell = this.table.querySelector(`tr:nth-of-type(${rowIdx+1}) > td:nth-of-type(${colIdx})`);

        if (!cell){
          return null;
        }
      
        return cell;
      }
      

      evaluateFunctionCall(funcName, params) {
        if (typeof functions[funcName] === "function") {
          return functions[funcName](...params);
        }
        return NaN;
      }

      // Helper function to wrap a value in quotes if it's a string
    wrapIfString(value) {
      if (isNaN(parseFloat(value))) {
        return JSON.stringify(value); 
      }
      return value; 
    }

    addDependency(cell, dependent){
      // Add the dependency to the cell, if it doesn't yet exist.
      let doesntExist = true;
      cell.dependencies.forEach((dependency)=>{
        if (dependency == dependent){
          doesntExist = false;
        }
      })
      if (doesntExist){
        cell.dependencies.push(dependent);
      }
    }

    addRDependency(cell, dependent){
      //Add the dependent cell to the cell, if it doesn't yet exist. This is so that if a cell gets changed,
      // its old dependencies can stop updating the changed cell.
      let doesntExist = true;
      cell.Rdependencies.forEach((dependency)=>{
        if (dependency == dependent){
          doesntExist = false;
        }
      })
      if (doesntExist){
        cell.Rdependencies.push(dependent);
      }
    }
    resetDependencies(cell){
      for (let i = 0; i < cell.Rdependencies.length; i++){
        let refrenceCell = cell.Rdependencies[i];
        if (refrenceCell == null){return;}
        let taco = [];
        refrenceCell.dependencies.filter((element)=>{
          return element != cell;
        })
      }
      cell.Rdependencies = [];
    }
    updateDependencies(cell, numCalls=0){
      cell.dependencies.forEach((dependent)=>{
        this.interpret(dependent, numCalls+1);
      })
    }
}