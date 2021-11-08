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
	client.subscribe(["armUp"]);
	client.subscribe(["armDown"]);
	client.subscribe(["sad"]);
	client.subscribe(["happy"]);

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
	happyFace(lcd); //initialize robot to be happy
	//stepping(stepper);


	//keypress handling
	function keyController(_, key) {
		if (key) {
			if (key.name === "up") {
				happyFace(lcd);
			}
			if (key.name === "down") {
				sadFace(lcd);
			}
			if (key.name === "right") {
				steppingUp(stepper, 1000);
			}
			if (key.name === "left") {
				steppingDown(stepper, 1000);
			}
			if (key.name === "k") {
				shaking(stepper, 3)
			}

			if (key.name === "p") {
				runMotor(leftvibmotor)
				setTimeout(() => { runMotor(rightvibmotor) }, 2000)
			}
		}
	}

	keypress(process.stdin);

	process.stdin.on("keypress", keyController);
	process.stdin.setRawMode(true);
	process.stdin.resume();





	client.on('message', function (topic, payload) {

		console.log("topic " + topic + " payload" + payload.toString())
		var message = payload.toString();

		if (topic == "armUp") {
			if (!stepperOccupied) {
				stepperOccupied = true;
				steppingUp(stepper, 1000);
				setTimeout(() => { stepperOccupied = false; }, 2000)
			} else {
				console.log("arm is occupied, try again later")
			}
			//sadFace(lcd)

		}
		if (topic == "armDown") {
			if (!stepperOccupied) {
				stepperOccupied = true;
				steppingDown(stepper, 1000);
				setTimeout(() => { stepperOccupied = false; }, 2000)
			} else {
				console.log("arm is occupied, try again later")
			}

		}
		if (topic == "sad") {
			sadFace(lcd);
		}
		if (topic == "happy") {
			happyFace(lcd);

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

function sadFace(lcd) {
	lcd.clear();

	lcd.cursor(0, 5).print("|:cent:   :cent:|");

	lcd.cursor(1, 7).print("/:ascchart1::backslash:");
	//lcd.cursor(1,16).blink();//hide cursor
	lcd.home()
}

function steppingUp(stepper, steps) {
	if (!armisup) {
		// set stepper to rpm, CW
		stepper.rpm(rpm).direction(Stepper.DIRECTION.CW)

		// make half a revolution 
		stepper.step(steps, () => {
			console.log("done moving CW");
		});
		armisup = true;

	}
	else {
		console.log("arm is already up")
	}

}

function steppingDown(stepper, steps) {
	if (armisup) {

		// set stepp[er to 45 rpm, CCW
		stepper.rpm(rpm).direction(Stepper.DIRECTION.CCW)

		// make half a revolution 
		stepper.step(steps, () => {
			console.log("done moving CCW");
		});
		armisup = false;

	}
	else {
		console.log("arm is already down")
	}
}




function shaking(stepper, shakes) {
	let i = 0;
	if (armisup) {

		interval = setInterval(() => {
			if (armisup) {
				steppingDown(stepper, 200)
			} else {
				steppingUp(stepper, 200)
				i += 1;
				if (i >= shakes) {
					clearInterval(interval); armisup = true;
				}
			}
		}, 1000)

	} else {
		console.log("arm isn't up - can't shake")
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

function runMotor(motor) {
	console.log("this is motor thing is called")
	motor.on("start", () => {
		console.log(`start: ${Date.now()}`);

		// Demonstrate motor stop in 2 seconds
		board.wait(2000, () => { motor.stop() });
	});

	// "stop" events fire when the motor is stopped.
	motor.on("stop", () => {
		console.log(`stop: ${Date.now()}`);
	});

	motor.start(255)

}


