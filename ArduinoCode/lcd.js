var five = require("johnny-five");
const { Board, Stepper } = require("johnny-five");
const keypress = require("keypress");

//MQTT SETUP
const mqtt = require("mqtt");
const host = 'broker.emqx.io'
const port = '1883'
const clientId = `arduinomultimodalinteractionbot`


const connectUrl = `http://${host}:${port}`


//setup arduino:
//stepper motor: gray = 11, orange = 10, white = 9; yellow = 8;
// lcd green = last, blue = second last pin
//vibration, gnd and digital pin. red = +, black = gnd

var armisup = false;

var board = new five.Board({
	port: "COM3"
});
let interval;
var rpm = 200;

var stepperOccupied = false;




const client = mqtt.connect(connectUrl, {
	clientId,
	clean: true,
	connectTimeout: 4000,
	// username: 'emqx',
	// password: 'public',
	reconnectPeriod: 1000,
})


console.log(connectUrl);

client.on('connect', () => {
	console.log('Connected')
	client.subscribe(["question"]);
	client.subscribe(["lag"]);
	client.subscribe(["like"]);
	client.subscribe(["reexplain"]);
});



//BOARD OPEN
board.on("ready", function () {



	var lcd = new five.LCD({
		controller: "PCF8574"
	});

	var stepper = new Stepper({
		type: Stepper.TYPE.FOUR_WIRE,
		stepsPerRev: 200,
		pins: {
			motor1: 8,
			motor2: 11,
			motor3: 9,
			motor4: 10
		},
		accel: 1600,
		decel: 1600,
		rpm: rpm
	});



	var leftvibmotor = new five.Motor({
		pin: 5
	})
	var rightvibmotor = new five.Motor({
		pin: 3
	})




	//https://www.quinapalus.com/hd44780udg.html CHAR CREATION SITE
	lcd.createChar("backslash", [0, 16, 8, 4, 2, 1, 0]);
	board.repl.inject({
		lcd: lcd,
		stepper: stepper,
		happy: function () {
			happyFace(lcd);
		},

		sad: function () {
			sadFace(lcd);
		},

		armup: function () {
			if (!stepperOccupied) {
				stepperOccupied = true;
				steppingUp(stepper, 1000);
				setTimeout(() => { stepperOccupied = false; }, 2000)
			} else {
				console.log("arm is occupied, try again later")
			}

		},
		armdown: function () {
			if (!stepperOccupied) {
				stepperOccupied = true;
				steppingDown(stepper, 1000);
				setTimeout(() => { stepperOccupied = false; }, 2000)
			} else {
				console.log("arm is occupied, try again later")
			}
		},

		shake: function () {
			if (!stepperOccupied) {
				stepperOccupied = true;
				shaking(stepper, 3);
				setTimeout(() => { stepperOccupied = false; }, 2000)
			} else {
				console.log("arm is occupied, try again later")
			}
		},

		broken: function () {
			if (!stepperOccupied) {
				stepperOccupied = true;
				streamBroke(stepper)
				setTimeout(() => { stepperOccupied = false; }, 2000)
			} else {
				console.log("arm is occupied, try again later")
			}

		}
	});

	//top bar
	lcd.useChar("ascchart1");
	//sad eyes
	lcd.useChar("cent");
	// happyFace(lcd); //initialize robot to be happy
	neutralFace(lcd) //intialize robot to be neutral
	//stepping(stepper);


	//keypress handling
	function keyController(_, key) {
		if (key) {
			if (key.name === "up") {
				// happyFace(lcd);
				console.log("lag")
				lag(lcd, leftvibmotor, stepper);
			}
			if (key.name === "down") {
				// sadFace(lcd);
				console.log("reexplain")
				reexplain(lcd, leftvibmotor, stepper);
			}
			if (key.name === "right") {
				// steppingUp(stepper, 1000);
				console.log("like")
				like(lcd);
			}
			if (key.name === "left") {
				// steppingDown(stepper, 1000);
				console.log("question")
				question(lcd, leftvibmotor, stepper);
			}
			if (key.name === "k") {
				shaking(stepper, 3)
			}

			if (key.name === "p") {
				questionMotor(leftvibmotor)
				// setTimeout(() => { runMotor(rightvibmotor) }, 2000)
			}
			if (key.name === "o") {
				reexplainMotor(leftvibmotor)
				// setTimeout(() => { runMotor(rightvibmotor) }, 2000)
			}
			if (key.name === "i") {
				lagMotor(leftvibmotor)
				// setTimeout(() => { runMotor(rightvibmotor) }, 2000)
			}
		}
	}

	keypress(process.stdin);

	process.stdin.on("keypress", keyController);
	process.stdin.setRawMode(true);
	process.stdin.resume();



	// MQTT HANDLING PART

	client.on('message', function (topic, payload) {

		console.log("topic " + topic + " payload" + payload.toString())
		var message = payload.toString();

		if (topic == "lag") {
			lag(lcd, leftvibmotor, stepper)

		}
		if (topic == "like") {
			like(lcd)
		}
		if (topic == "question") {
			question(lcd, motor, stepper)

		}
		if (topic == "reexplain") {
			reexplain(lcd, motor, stepper)
		}




	})



	board.on("exit", () => {
		if (armisup) {
			//make arm return to down position on closing
			steppingDown(stepper, 1000);
		}
	});

});


function happyFace(lcd) {
	lcd.clear();
	lcd.home()
	lcd.cursor(0, 5).print("|>   <|");
	lcd.cursor(1, 7).print(":backslash:_/");
	//lcd.cursor(1,16).blink();//hide cursor
	lcd.home()
}

function neutralFace(lcd) {
	lcd.clear();
	lcd.home()
	lcd.cursor(0, 5).print("|O   O|");
	lcd.cursor(1, 7).print("---");
	lcd.cursor(1, 16).blink(); //hide cursor
	lcd.home()
}

function sadFace(lcd) {
	lcd.clear();

	lcd.cursor(0, 5).print("|:cent:   :cent:|");

	lcd.cursor(1, 7).print("/:ascchart1::backslash:");
	//lcd.cursor(1,16).blink();//hide cursor
	lcd.home()
}

function steppingUp(stepper, steps) {
	if (!stepperOccupied) {
		if (!armisup) {
			stepperOccupied = true;
			// set stepper to rpm, CW
			stepper.rpm(rpm).direction(Stepper.DIRECTION.CW)

			// make half a revolution 
			stepper.step(steps, () => {
				console.log("done moving UP");
			});
			armisup = true;
			setTimeout(() => { stepperOccupied = false; }, 2000)
		}
		else {
			console.log("arm is already up")
		}
	} else {
		console.log("arm is occupied, try again later")
	}
}

function steppingDown(stepper, steps) {
	if (!stepperOccupied) {
		if (armisup) {
			stepperOccupied = true;

			// set stepp[er to 45 rpm, CCW
			stepper.rpm(rpm).direction(Stepper.DIRECTION.CCW)

			// make half a revolution 
			stepper.step(steps, () => {
				console.log("done moving DOWN");
			});
			armisup = false;
			setTimeout(() => { stepperOccupied = false; }, 2000)

		}
		else {
			console.log("arm is already down")
		}
	} else {
		console.log("arm is occupied, try again later")
	}
}




function shaking(stepper, shakes) {
	let i = 0;
	let started_startedshaking = false;
	if (armisup) {
		// console.log("do i ever go here")
		interval = setInterval(() => {
			if (armisup) {
				steppingDown(stepper, 200)
			} else {
				steppingUp(stepper, 200)
				i += 1;
				if (i >= shakes) {
					// console.log("started shaking:", started_startedshaking)
					clearInterval(interval);
					armisup = true;
					started_startedshaking = false;
				}
			}
		}, 1000)

	} else if (i < shakes && !armisup && !started_startedshaking) {
		started_startedshaking = true;
		steppingUp(stepper, 200)
		board.wait(400, () => shaking(stepper, shakes))
		console.log("arm wasn't up - will shake in a moment")
	}

}

function streamBroke(stepper) {
	// set stepper to 225 rpm, CCW
	stepper.rpm(225).direction(Stepper.DIRECTION.CCW).accel(10000).decel(10000)

	// make 3 revolutions spinning fast
	stepper.step(2000, () => {
		console.log("done moving CCW");
		stepper.rpm(rpm).accel(1600).decel(1600)
	});

}

function reexplainMotor(motor) {
	console.log("reexplain vib pattern")
	//Pattern for Reexplain - DO NOT DELETE
	board.wait(500, () => { motor.start(255) })
	board.wait(1000, () => { motor.stop() })
	board.wait(1100, () => { motor.start(175) })
	board.wait(1300, () => { motor.stop() })
	board.wait(1400, () => { motor.start(175) })
	board.wait(1600, () => { motor.stop() })
	board.wait(1900, () => { motor.start(255) })
	board.wait(2400, () => { motor.stop() })
	board.wait(2500, () => { motor.start(175) })
	board.wait(2600, () => { motor.stop() })
	board.wait(2700, () => { motor.start(175) })
	board.wait(2900, () => { motor.stop() })
	board.wait(2950, () => { motor.start(255) })
	board.wait(3400, () => { motor.stop() })
}



function lag(lcd, motor, stepper) {
	sadFace(lcd);
	shaking(stepper, 5);
	lagMotor(motor);
	board.wait(25000, () => neutralFace(lcd))


}
function question(lcd, motor, stepper) {

	happyFace(lcd)
	questionMotor(motor);
	steppingUp(stepper, 1000);
	board.wait(10000, () => steppingDown(stepper, 1000))
	board.wait(10000, () => neutralFace(lcd))

}

function reexplain(lcd, motor, stepper) {
	sadFace(lcd);
	reexplainMotor(motor);
	steppingUp(stepper, 1000);
	board.wait(10000, () => steppingDown(stepper, 1000))
	board.wait(10000, () => neutralFace(lcd))

}

function like(lcd) {
	happyFace(lcd);
	board.wait(10000, () => neutralFace(lcd))
}

function lagMotor(motor) {
	console.log("lag vib pattern")
	//Pattern for lag - DO NOT DELETE
	var m = 2;
	//repeats itself 20 times - around 15 seconds, with increasing intesity the first 8 rounds, then it stagnates.
	for (let j = 1; j < 15; j++) {
		board.wait((750 * j), () => { motor.start(55 + (25 * m)) })
		board.wait((750 * j) + 45 * m, () => { motor.stop() })
		console.log((750 * j), "start")
		console.log(90 * m, "end")
		console.log("m", m)
		if (m <= 10) {
			m++;
		}
	}
}

function questionMotor(motor) {
	console.log("question vib pattern")

	//65 is basically lower bound of power.
	//255 is upper bound.
	//Pattern for question
	board.wait(500, () => { motor.start(255) })
	board.wait(1000, () => { motor.stop() })
	board.wait(1100, () => { motor.start(175) })
	board.wait(1300, () => { motor.stop() })
	board.wait(1400, () => { motor.start(175) })
	board.wait(1600, () => { motor.stop() })
	board.wait(1900, () => { motor.start(255) })
	board.wait(2400, () => { motor.stop() })

}



