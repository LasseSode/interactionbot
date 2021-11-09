const mqtt = require('mqtt')

const host = 'broker.emqx.io'
const port = '1883'
const clientId = `cloudinteractionMqtt`

const connectUrl = `http://${host}:${port}`


function publish(topic) {

    const client = mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    })
    client.on('connect', () => {
        console.log('Connected up')

        client.publish(topic, "message from cloud - " + topic, { qos: 0, retain: false }, (error) => {
            if (error) {
                console.error(error)
            }
        })
        client.end()
    })
}

// function Question() {


//     const client = mqtt.connect(connectUrl, {
//         clientId,
//         clean: true,
//         connectTimeout: 4000,
//         reconnectPeriod: 1000,
//     })

//     client.on('connect', () => {
//         console.log('Connected down')
//         topic = "armDown"
//         client.publish(topic, "message from cloud - armDown", { qos: 0, retain: false }, (error) => {
//             if (error) {
//                 console.error(error)
//             }
//         })
//         topic = "sad"

//         client.publish(topic, "message from cloud - sadface", { qos: 0, retain: false }, (error) => {
//             if (error) {
//                 console.error(error)
//             }
//         })
//         client.end()
//     })


// }





module.exports = {
    lag: function () {
        publish("lag")
    },

    question: function () {
        publish("question")
    },

    reexplain: function () {
        publish("reexplain")
    },

    like: function () {
        publish("like")
    },

}




