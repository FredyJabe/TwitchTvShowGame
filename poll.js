// Read cookies to get the values
const chan = getCookie("chan");
const question = getCookie("question");
const answer1 = getCookie("answer1");
const answer2 = getCookie("answer2");
const answer3 = getCookie("answer3");
const answer4 = getCookie("answer4");

// Initialize the chat reader and connect it
var client = new tmi.Client({
	channels: [ chan ]
});
client.connect();

// Initialize the chart variables and build the chart
var c1 = 0;
var c2 = 0;
var c3 = 0;
var c4 = 0;
var voted = [];

var xValues = [ "A."+answer1, "B."+answer2, "C."+answer3, "D."+answer4];
var yValues = [c1, c2, c3, c4];
var barColors = ["red", "green","blue","orange"];

var pieChart = new Chart("myChart", {
	type: "pie",
	data: {
		labels: xValues,
		datasets: [{
		backgroundColor: barColors,
		data: yValues
		}]
	},
	options: {
		title: {
		display: true,
		text: question
		},
		animation: false
	}
	});

updateChart();

// Manages the commands
client.on('message', (channel, tags, message, self) => {
	console.log(`${tags['display-name']}: ${message}`);

	if(self || !message.startsWith('!')) return;

	const args = message.slice(1).split(' ');
	const command = args.shift().toLowerCase();

	if (command === 'a' || command === 'b' || command === 'c' || command === 'd') {
		vote(command, `${tags['display-name']}`);
	}
});

// Removes the old chart and creates a new one with the new values
function updateChart() {
	pieChart.destroy();
	pieChart = new Chart("myChart", {
		type: "pie",
		data: {
			labels: xValues,
			datasets: [{
			backgroundColor: barColors,
			data: [c1, c2, c3, c4]
			}]
		},
		options: {
			title: {
			display: true,
			text: question
			},
			animation: false
		}
		});
}

// Makes sure that everyone only vote once
function vote(choix, user) {
	if (voted.indexOf(user) < 0) {
		voted.push(user);

		if (choix === 'a') c1++;
		if (choix === 'b') c2++;
		if (choix === 'c') c3++;
		if (choix === 'd') c4++;

		updateChart();
	}
}