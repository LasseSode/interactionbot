const mqtt = require('mqtt')

const host = 'broker.emqx.io'
const port = '1883'
const clientId = `cloudinteractionMqtt`

const connectUrl = `http://${host}:${port}`


function armUp() {

    const client = mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    })

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


const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
})

    client.on('connect', () => {
        console.log('Connected')
        topic = "armDown"
        client.publish(topic, "message from cloud - armDown", { qos: 0, retain: false }, (error) => {
            if (error) {
                console.error(error)
            }
        })
        client.end()
    })

    
}

function sad() {
    const client = mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    })

    topic = "sad"
    client.publish(topic, "message from cloud - sadface", { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error(error)
        }
    })
}

function happy() {
    const client = mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    })

    topic = "happy"
    client.publish(topic, "message from cloud - happyface", { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error(error)
        }
    })
}

module.exports = {
    publishArmUp: function () {
       armUp();

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




