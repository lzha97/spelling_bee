//var validWords = ["expectant","accept","acceptance","acceptant","apace","apex","apnea","canape",'cape','catnap','epee','except','expat','expect','nape','neap','pace','pact','paean','panacea','pancetta','pane','pant','papa','pate','patent','patentee','peace','peat','pecan','peccant','peen','peep','penance','pence','pennant','penne','pent','pentane','tapa','tape','teepee','tepee'];
var validWords=[];
var letters = '';
var discoveredWords =[];
var totalScore = 0;

function generate_letters(length){
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  var charactersLength = characters.length; 
  for(var i =0; i<length; i++){
      result += characters.charAt(Math.floor(Math.random()*charactersLength));
  }
  letters = result.toUpperCase();  
  return letters.toLowerCase();
}

function valid_generated_letters(letters){
  var vowels = ['a', 'e', 'i', 'o', 'u'];
  var count = 0; 
  for(var i=0; i<letters.length; i++){
    if(vowels.includes(letters[i])){
      count++;
    }
  }
  if(count >0 && count < 4){
    return true;
  }else{
    return false;
  }
}

function get_valid_words(){
    var letters = generate_letters(7);

    while(!valid_generated_letters(letters)){
      letters = generate_letters(7);
    }
    const url='https://uxxjtb4jz0.execute-api.us-east-1.amazonaws.com/default/FindValidWords?letters=' + letters;
    console.log(url)

    var request = new XMLHttpRequest(); 
    request.open('GET', url, true);
    request.onreadystatechange = function(){
        var data = JSON.parse(this.response);
        if(request.readyState ==3 && request.status == 200){
          console.log(data)
          initialize_letters();
          validWords = data;
        }else{
          console.log('error')
        }
    };
    request.send();
}

/*
function getPossibleWords(letters){

    result = [] ;
    validWords = result;
}*/


//Creates the hexagon grid of 7 letters with middle letter as special color
function initialize_letters(){
    
    var hexgrid = document.getElementById('hexGrid')
    for(var i=0; i<letters.length; i++){
        var char = letters[i];
        
        var pElement = document.createElement("P");
        pElement.innerHTML = char;
        
        var aElement = document.createElement("A");
        aElement.className = "hexLink";
        aElement.href = "#";
        aElement.appendChild(pElement);
        aElement.addEventListener('click', clickLetter(char), false);

        var divElement = document.createElement('DIV');
        divElement.className = "hexIn"; 
        divElement.appendChild(aElement);
        
        var hexElement = document.createElement("LI");
        hexElement.className = "hex";
        hexElement.appendChild(divElement);
        if(i==3){
          aElement.id = "center-letter";
        }
        hexgrid.appendChild(hexElement);
    }

}

//Valid whether letter typed into input box was from one of 7 available letters
document.getElementById("testword").addEventListener("keydown", function(event){
  if(!letters.includes(event.key.toUpperCase())){
    alert('Invalid Letter Typed')
    event.preventDefault();
  }
}
)

//When letter is clicked add it to input box
var clickLetter = function(letter){
  return function curried_func(e){
    var tryword = document.getElementById("testword");
    tryword.value = tryword.value + letter.toLowerCase();
  }
}

//Deletes the last letter of the string in the textbox
function deleteLetter(){
  var tryword = document.getElementById("testword");
  var trywordTrimmed = tryword.value.substring(0, tryword.value.length-1);
  tryword.value = trywordTrimmed;
}

//check if the word is valid and clear the input box
//word must be at least 4 letters
//word must contain center letter
//word can't already be found 
function submitWord(){
  var tryword = document.getElementById('testword');
  var centerLetter = document.getElementById('center-letter').firstChild.innerHTML;

  let score = 0;
  var isPangram = new Boolean(false);
  var showScore = document.getElementById("totalScore");

  if(tryword.value.length < 4){
    alert('Word must be at least 4 characters')
  }else if(discoveredWords.includes(tryword.value.toLowerCase())){
    alert('Word has already been found.')
  }else if(!tryword.value.toLowerCase().includes(centerLetter.toLowerCase())){
    alert('Word doesn\'t contain center letter!');
  }else if(validWords.includes(tryword.value.toLowerCase())){
    isPangram = checkPangram(tryword);
    addToTotalScore(calculateWordScore(tryword, isPangram));
    showScore.innerHTML = totalScore;
    showDiscoveredWord(tryword);
    discoveredWords.push(tryword.value.toLowerCase());
    alert('Valid Word!');
  }else{
    alert('Word Doesn\'t Exist');
  }
  tryword.value = '';
}

//if word was valid, display it 
//if all words are found end game.
function showDiscoveredWord(input){
    var discWords = document.getElementById("discoveredWords");

    var numChildren = discWords.childElementCount; 
    if (numChildren == validWords.length){
      alert("You have found all of the possible words! Thanks for playing");
    } else{
      var listword = document.createElement("LI");
      var pword = document.createElement("P");
      pword.innerHTML = input.value; 
      listword.appendChild(pword);
      discWords.appendChild(listword);
    }
    
}

/*
function clearField(input){
  if (input.value != ''){
    input.value = '';
  }
}*/

function addToTotalScore(score) {
  totalScore += score;
}

function calculateWordScore(input, isPangram) {
  let len = input.value.length;
  let returnScore = 1; 
  if(len > 4) {
    returnScore = len;
  }
  if(isPangram) {
    returnScore = len + 7;
  }
  return returnScore;
}

function checkPangram(input) {
  var i;
  var containsCount = 0;
  var containsAllLetters = new Boolean(false);
  for(i = 0; i < 7; i++) {
    if(input.value.includes(letters[i])) {
      containsCount++;
    }
  }
  if(containsCount == 7) {
    containsAllLetters = new Boolean(true);
  }
  console.log("isPangram?: " + containsAllLetters);
  return containsAllLetters;
}


