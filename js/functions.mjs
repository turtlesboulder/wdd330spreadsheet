export default class functions{
    constructor(){

    }
    static FLOOR(value) {
        return Math.floor(value);
      }
    static CEIL(value){
      return Math.ceil(value);
    }
    static MAX(...numbers){
      let biggest = numbers[0];
      for (let i = 1; i < numbers.length; i++){
        if (numbers[i] > biggest){
          biggest = numbers[i]
        }
      }
      return biggest;
    }
    static MIN(...numbers){
      let smallest = numbers[0];
      for (let i = 1; i < numbers.length; i++){
        if (numbers[i] < smallest){
          smallest = numbers[i]
        }
      }
      return smallest;
    }
}