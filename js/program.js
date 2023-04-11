//import {test, test2} from "./bidon.js";

document.getElementById('playing').style.display = 'none';
document.getElementById('stopPlayTimer').style.display = 'none';
document.getElementById('playNext').style.display = 'none';
document.getElementById('playScoreboard').disabled = true;
document.getElementById('result').style.display = 'none';

// let : local
// var : global




///////////////////
// GENERIC STUFF //
///////////////////

var scores = [];
    // 0: User
    // 1: Score
var questions = [];
    // 0: Question
    // 1: Answer A
    // 2: Answer B
    // 3: Answer C
    // 4: Answer D
    // 5: Good answer
    // 6: Worth X pts
var currentQuestion = 0;
var questionAmount = 0;


//////////////////
// TWITCH STUFF //
//////////////////
var channelToListen = '';

var client; // = new tmi.Client({channel: []})

// Init and start the twitch chat client
function Twitch_StartClient(chan) {
    client = new tmi.Client({channels: [chan]});
    client.connect();

    // Manage chat messages
    client.on('message', (channel, tags, message, self) => {
        console.log(`${tags['display-name']}: ${message}`);
    
        if(self || !message.startsWith('#')) return;
    
        const args = message.slice(1).split(' ');
        const command = args.shift().toLowerCase();
    
        if (command === 'a' || command === 'b' || command === 'c' || command === 'd') {
            Chart_Vote(command, `${tags['display-name']}`);
        }
    });
}

function Twitch_StopClient() {
    client.disconnect();
}


/////////////////////
// PIE CHART STUFF //
/////////////////////

var c1 = 0;
var c2 = 0;
var c3 = 0;
var c4 = 0;
var voted = [];

var pieChart;

function Chart_PrepareChart() {
    pieChart = new Chart("myChart", {
		type: "pie",
		data: {
			labels: ["A","B","C","D"],
			datasets: [{
			backgroundColor: ["red","green","blue","orange"],
			data: [c1, c2, c3, c4]
			}]
		},
		options: {
			title: {
			display: false,
			text: questions[currentQuestion][0]
			},
			animation: false
		}
    });

    voted = [];
}

// Removes the old chart and creates a new one with the new values
function Chart_UpdateChart() {
	pieChart.destroy();
	pieChart = new Chart("myChart", {
		type: "pie",
		data: {
			labels: [ "A","B","C","D"],
			datasets: [{
			backgroundColor: ["red","green","blue","orange"],
			data: [c1, c2, c3, c4]
			}]
		},
		options: {
			title: {
			display: false,
			text: questions[currentQuestion][0]
			},
			animation: false
		}
		});
}

function Chart_ResetChart() {
    c1 = 0;
    c2 = 0;
    c3 = 0;
    c4 = 0;
    voted = [];

    Chart_UpdateChart();
}

// Makes sure that everyone only vote once
function Chart_Vote(choix, user) {
	if (voted.indexOf(user) < 0) {
		voted.push(user);

        let goodAnswer = false;

        let scoreGoodAnswer = 1;
        let scoreBadAnswer = -0.5;
        let scoreMultiplier = questions[currentQuestion][6];

        // Question d'un steramer vaut plus
        //if (questions[currentQuestion][6] == true) {
        //    scoreMultiplier = 3;
        //}
        // Question "bonus", donc +2 si bonne réponse
        //else if (((currentQuestion+1) % 11) == 0) {
        //    scoreMultiplier = 2;
        //}

        switch(choix)
        {
            case 'a':
                c1 ++;
                if (questions[currentQuestion][5] == 1) {
                    goodAnswer = true;
                }
                break;
            case 'b':
                c2 ++;
                if (questions[currentQuestion][5] == 2) {
                    goodAnswer = true;
                }
                break;
            case 'c':
                c3 ++;
                if (questions[currentQuestion][5] == 3) {
                    goodAnswer = true;
                }
                break;
            case 'd':
                c4 ++;
                if (questions[currentQuestion][5] == 4) {
                    goodAnswer = true;
                }
                break;
        }

        if (goodAnswer) {
            let userExists = false;
            for(let i=0; i<scores.length; i++) {
                if (scores[i][0] == user) {
                    userExists = true;
                    scores[i][1] += (scoreGoodAnswer * scoreMultiplier);

                    console.log(`${user}:${scores[i][1]}`);
                }
            }

            if (!userExists) {
                scores.push([user, (scoreGoodAnswer * scoreMultiplier)]);

                console.log(`${user}:${(scoreGoodAnswer * scoreMultiplier)}`);
            }
        }
        else {
            let userExists = false;
            for(let i=0; i<scores.length; i++) {
                if (scores[i][0] == user) {
                    userExists = true;
                    scores[i][1] += (scoreBadAnswer * scoreMultiplier);

                    console.log(`${user}:${scores[i][1]}`);
                }
            }

            if (!userExists) {
                scores.push([user, (scoreBadAnswer * scoreMultiplier)]);

                console.log(`${user}:${(scoreBadAnswer * scoreMultiplier)}`);
            }
        }

		//Chart_UpdateChart();
        Scores_UpdateTable();
	}
}


////////////////
// PREP STUFF //
////////////////

function Prep_AddQuestion() {
    var qa = questionAmount;
    
    let questionDiv = document.createElement("DIV"); // Category
    questionDiv.setAttribute("class",`createQuestion ${qa}`);
    questionDiv.setAttribute("id",`${qa}`);

    let prep = document.getElementById("preparation");
    let controls = document.getElementById("prepControls")
    prep.insertBefore(questionDiv, controls);

    let questionText = document.createElement("INPUT"); // Question
    questionText.setAttribute("type","text");
    questionText.setAttribute("id",`q${qa}`);
    questionText.setAttribute("placeholder",`Question ${qa+1}`);
    questionDiv.appendChild(questionText);

    let divIsFromStreamer = document.createElement("DIV");
    divIsFromStreamer.setAttribute("class","answer");
    let questionIsFromStreamer = document.createElement("INPUT"); // Checkbox pour savoir si la question vaut des points bonus
    questionIsFromStreamer.setAttribute("type","number");
    questionIsFromStreamer.setAttribute("id",`q${qa}b`);
    questionIsFromStreamer.setAttribute("class","radio");
    questionIsFromStreamer.setAttribute("min","1");
    questionIsFromStreamer.setAttribute("value","1");
    let checkboxInfo = document.createElement("DIV");
    checkboxInfo.innerText = " Combien de point vaut la question? (si 1, +1 pour les bonnes réponses, -0.5 pour les mauvaises)";
    divIsFromStreamer.appendChild(questionIsFromStreamer);
    divIsFromStreamer.appendChild(checkboxInfo);
    questionDiv.appendChild(divIsFromStreamer);

    for(let i=1; i<=4; i++) {
        let questionAnswer = document.createElement("DIV");
            questionAnswer.setAttribute("class", "answer");
        let questionAnswerRadio = document.createElement("INPUT");
            questionAnswerRadio.setAttribute("type","radio");
            questionAnswerRadio.setAttribute("name",`q${qa}n`);
            questionAnswerRadio.setAttribute("value",i);
            questionAnswerRadio.setAttribute("class","radio");
        if (i == 1) {
            questionAnswerRadio.setAttribute("checked","");
        }
        let questionAnswerText = document.createElement("INPUT");
            questionAnswerText.setAttribute("type","text");
            questionAnswerText.setAttribute("id",`q${qa}a${i}`);
            questionAnswerText.setAttribute("class","answer");
            questionAnswerText.setAttribute("placeholder",`Answer ${i}`);

        questionAnswer.appendChild(questionAnswerRadio);
        questionAnswer.appendChild(questionAnswerText);
        questionDiv.appendChild(questionAnswer);
    }

    let line = document.createElement("HR");
    questionDiv.appendChild(line);

    questionAmount ++;

    console.log("Question added.");
}

function Prep_RemoveQuestion() {
    let qa = questionAmount;
    
    let toRemove = document.getElementById(qa-1);
    if (toRemove != null)
    {
        console.log("Question found.");
        toRemove.parentNode.removeChild(toRemove);
        questionAmount --;
    }
    else console.log(`Question ${qa} not found.`);
}

Prep_AddQuestion();



function Prep_InitializeQuiz() {
    questions = [];

    console.log(questionAmount);

    for(let i=0; i<questionAmount; i++) {
        // Reads all the question info
        let q = document.getElementById(`q${i}`).value;
        let a1 = document.getElementById(`q${i}a1`).value;
        let a2 = document.getElementById(`q${i}a2`).value;
        let a3 = document.getElementById(`q${i}a3`).value;
        let a4 = document.getElementById(`q${i}a4`).value;
        let r = 0;
        let qFromStreamer = document.getElementById(`q${i}b`).value;

        // Validate the good answer
        let ele = document.getElementsByName(`q${i}n`);
        for (let j=0; j<ele.length; j++) {
            if (ele[j].checked) {
                r = j+1;
            }
        }

        // Add all the question info to the array
        questions.push([q, a1, a2, a3, a4, r, qFromStreamer]);
    }

    Prep_debug();

    channelToListen = document.getElementById('channelToListen').value;
    console.log('channel: ' + channelToListen);

    Chart_PrepareChart();

    document.getElementById('preparation').style.display = 'none';
    document.getElementById('playing').style.display = 'block';

    document.getElementById('playQuestionPoint').innerHTML = '<H5>Good answer adds ' + questions[currentQuestion][6] + ' points.<BR>Bad answer removes ' + (questions[currentQuestion][6]/2) + ' points.</H5>';
    document.getElementById('playQuestion').innerHTML = '<H2>' + questions[currentQuestion][0] + '</H2>';
    document.getElementById('playReponse1').innerHTML = 'A. ' + questions[currentQuestion][1];
    document.getElementById('playReponse2').innerHTML = 'B. ' + questions[currentQuestion][2];
    if (questions[currentQuestion][3] !== "") {
        document.getElementById('playReponse3').innerHTML = 'C. ' + questions[currentQuestion][3];
    }
    if (questions[currentQuestion][4] !== "") {
        document.getElementById('playReponse4').innerHTML = 'D. ' + questions[currentQuestion][4];
    }

    document.getElementById('playReponse1').style.display = 'none';
    document.getElementById('playReponse2').style.display = 'none';
    document.getElementById('playReponse3').style.display = 'none';
    document.getElementById('playReponse4').style.display = 'none';
}

function Prep_debug() {
    console.log("DEBUG INFO");
    console.log(questions.length);

    for (let i=0; i<questions.length; i++) {
        console.log("Question " + (i + 1) + ": " + questions[i][0]);
        console.log("Answer 1" + ": " + questions[i][1]);
        console.log("Answer 2 "+ ": " + questions[i][2]);
        console.log("Answer 3 " + ": " + questions[i][3]);
        console.log("Answer 4 " + ": " + questions[i][4]);
        console.log("Answer " + ": " + questions[i][5]);
        console.log("Score " + ": " + questions[i][6]);
        console.log('---------------');
    }
}

////////////////
// PLAY STUFF //
////////////////

function Play_StartTimer() {
    console.log('Chat connected.');
    Twitch_StartClient(channelToListen);

    document.getElementById('startPlayTimer').style.display = 'none';
    document.getElementById('stopPlayTimer').style.display = '';

    document.getElementById('playReponse1').style.display = '';
    document.getElementById('playReponse2').style.display = '';
    document.getElementById('playReponse3').style.display = '';
    document.getElementById('playReponse4').style.display = '';

    timer.reset();
    timer.start();
}
function Play_StopTimer() {
    console.log('Chat disconnected.');
    Twitch_StopClient();

    document.getElementById('startPlayTimer').style.display = '';
    document.getElementById('stopPlayTimer').style.display = 'none';
    document.getElementById('startPlayTimer').disabled = true;
    document.getElementById('playShowAnswer').disabled = false;

    timer.stop();

    if (((currentQuestion+1) % 11) == 0 || currentQuestion == 0) {
        document.getElementById('playScoreboard').disabled = false;
    }
    else {
        document.getElementById('playScoreboard').disabled = true;
    }
}

function Play_NextQuestion() {
    document.getElementById('playNext').style.display = 'none';
    document.getElementById('result').style.display = 'none';
    document.getElementById('playScoreboard').disabled = true;
    
    Chart_ResetChart();

    document.getElementById('playReponse1').style.display = 'none';
    document.getElementById('playReponse2').style.display = 'none';
    document.getElementById('playReponse3').style.display = 'none';
    document.getElementById('playReponse4').style.display = 'none';

    currentQuestion ++;

    if (currentQuestion < questions.length) {
        document.getElementById('startPlayTimer').disabled = false;

        document.getElementById('playQuestionPoint').innerHTML = '<H5>Good answer adds ' + questions[currentQuestion][6] + ' points.<BR>Bad answer removes ' + (questions[currentQuestion][6]/2) + ' points.</H5>';
        document.getElementById('playQuestion').innerHTML = '<H2>' + questions[currentQuestion][0] + '</H2>';
        document.getElementById('playReponse1').innerHTML = 'A. ' + questions[currentQuestion][1];
        document.getElementById('playReponse1').style.backgroundColor = '';
        document.getElementById('playReponse2').innerHTML = 'B. ' + questions[currentQuestion][2];
        document.getElementById('playReponse2').style.backgroundColor = '';


        if (questions[currentQuestion][3] !== "") {
            document.getElementById('playReponse3').innerHTML = 'C. ' + questions[currentQuestion][3];
        }
        else {
            document.getElementById('playReponse3').innerHTML = '';
        }
        if (questions[currentQuestion][4] !== "") {
            document.getElementById('playReponse4').innerHTML = 'D. ' + questions[currentQuestion][4];
        }
        else {
            document.getElementById('playReponse4').innerHTML = '';
        }

        document.getElementById('playReponse3').style.backgroundColor = '';
        document.getElementById('playReponse4').style.backgroundColor = '';
    }
    else {
        if (currentQuestion >= questions.length) {
            document.getElementById('playing').style.display = 'none';
            document.getElementById('result').style.display = 'block';
        }
    }
}

function Play_ShowScoreboard() {
    let s = document.getElementById('result');
    if (s.style.display == 'none') {
        s.style.display = '';
    }
    else {
        s.style.display = 'none';
    }
}

function Play_ShowAnswer() {
    document.getElementById('playShowAnswer').disabled = true;
    document.getElementById('playNext').style.display = '';

    let d;
    switch(questions[currentQuestion][5]) {
        case 1:
            d = document.getElementById('playReponse1');
            break;
        case 2:
            d = document.getElementById('playReponse2');
            break;
        case 3:
            d = document.getElementById('playReponse3');
            break;
        case 4:
            d = document.getElementById('playReponse4');
            break;
    }
    d.style.backgroundColor = '#4EFC03';
}

function Scores_UpdateTable() {
    scores.sort(compareSecondColumn);

    let d = document.getElementById('result');
    let temp = '<TABLE class="scoreboard">';

    for(let i=0; i<scores.length; i++) {
        temp += '<TR>';
        temp += '<TD id="scorePosition">' + (i+1) + '</TD>';
        temp += '<TD id="scoreName">' + scores[i][0] + '</TD>';
        temp += '<TD>' + scores[i][1] + '</TD>';
        temp += '</TR>';
    }
    temp += '</TABLE>';

    d.innerHTML = temp;
}

function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? 1 : -1;
    }
}

// Load a config from a file
function LoadConfig(content) {
    questions = [];

    let tempArray = content.split("\n");
    Prep_RemoveQuestion();

    for (let i=0; i<tempArray.length; i++) {
        let questionNumber = questionAmount - 1;

        if (tempArray[i].startsWith("NEW")) {
            Prep_AddQuestion();
        }

        if (tempArray[i].startsWith("channel=")) {
            document.getElementById(`channelToListen`).value = tempArray[i].substring(tempArray[i].indexOf("=")+1);
        }

        if (tempArray[i].startsWith("q=")) {
            document.getElementById(`q${questionNumber}`).value = tempArray[i].substring(tempArray[i].indexOf("=")+1);
        }

        for (var j=1; j<=4; j++) {
            if (tempArray[i].startsWith(`a${j}=`)) {
                document.getElementById(`q${questionNumber}a${j}`).value = tempArray[i].substring(tempArray[i].indexOf("=")+1);
            }
        }
        
        if (tempArray[i].startsWith("value=")) {
            document.getElementById(`q${questionNumber}b`).value = Number(tempArray[i].substring(tempArray[i].indexOf("=")+1));
        }

        if (tempArray[i].startsWith("good=")) {
            document.getElementsByName(`q${questionNumber}n`)[0].checked = false;
            document.getElementsByName(`q${questionNumber}n`)[1].checked = false;
            document.getElementsByName(`q${questionNumber}n`)[2].checked = false;
            document.getElementsByName(`q${questionNumber}n`)[3].checked = false;
            document.getElementsByName(`q${questionNumber}n`)[tempArray[i].substring(tempArray[i].indexOf("=")+1)-1].checked = true;
        }
    }
}

// Event Handlers
document.getElementById('addQuestion').addEventListener('click',Prep_AddQuestion); // addEventListener('click'),() => {maFunction(props)});
document.getElementById('removeQuestion').addEventListener('click',Prep_RemoveQuestion);
document.getElementById('play').addEventListener('click',Prep_InitializeQuiz);

document.getElementById('startPlayTimer').addEventListener('click',Play_StartTimer);
document.getElementById('stopPlayTimer').addEventListener('click',Play_StopTimer);
document.getElementById('playShowAnswer').addEventListener('click',Play_ShowAnswer);
document.getElementById('playShowChart').addEventListener('click',Chart_UpdateChart);
document.getElementById('playNext').addEventListener('click',Play_NextQuestion);
document.getElementById('playScoreboard').addEventListener('click',Play_ShowScoreboard);

// Loads a file
document.getElementById('loadConfig').addEventListener('change', function () {
    if (this.files && this.files[0]) {
      var myFile = this.files[0];
      var reader = new FileReader();
      
      reader.addEventListener('load', function (e) {
        LoadConfig(e.target.result);
      });
      
      reader.readAsText(myFile);
    }   
  });