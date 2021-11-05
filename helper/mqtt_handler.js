const mqtt = require('mqtt')

const host = 'broker.emqx.io'
const port = '1883'
const clientId = `cloudinteractionMqtt`

const connectUrl = `http://${host}:${port}`
// `mqtt://${host}:${port}`
const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
})

console.log(connectUrl)
// const topic = 'armUp'

// client.on('connect', () => {
//     console.log('Connected')
//     // client.subscribe([topic], () => {
//     //   console.log(`Subscribe to topic '${topic}'`)
//     //   console.log('msg', clientId)
//     // })
//     // publish()

// });


function armUp() {

    topic = "armUp"
    client.publish(topic, "message from cloud - armUp", { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error(error)
        }
    }, (complete) => {
        client.end()
    })
}

function armDown() {
    topic = "armDown"
    client.publish(topic, "message from cloud - armDown", { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error(error)
        }
    })
}

function sad() {
    topic = "sad"
    client.publish(topic, "message from cloud - sadface", { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error(error)
        }
    })
}

function happy() {
    topic = "happy"
    client.publish(topic, "message from cloud - happyface", { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error(error)
        }
    })
}

module.exports = {
    publishArmUp: function () {
        client.on('connect', () => {
            console.log('Connected')
            topic = "armUp"
            client.publish(topic, "message from cloud - armUp", { qos: 0, retain: false }, (error) => {
                if (error) {
                    console.error(error)
                }
            }, (complete) => {
                client.end()
            })
        });

    },

    publishArmDown: function () {
        armDown();
    },

    publishSad: function () {
        sad();
    },

    publishHappy: function () {
        happy();
    },

}



