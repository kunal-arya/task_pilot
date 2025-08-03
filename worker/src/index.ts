import { Kafka } from "kafkajs";

const TOPIC_NAME = "zapier-events"

const kafka = new Kafka({
    clientId: "zaiper",
    brokers: ["localhost:9092"]
})

async function main() {
    const consumer = kafka.consumer({groupId: "main-worker"})

    await consumer.connect()

    await consumer.subscribe({topic: TOPIC_NAME, fromBeginning: true})

    await consumer.run({
        autoCommit: false,
        eachMessage: async ({topic, partition, message }) => {
            console.log({
                topic,
                partition,
                offset: message.offset,
                value: message.value.toString()
            })

            // SetTimeout for 5 Seconds
            await new Promise(r => setTimeout(r, 5000))

            console.log("Processing DONE!!")

            // Manually commit partition
            await consumer.commitOffsets([{
                topic,
                partition,
                offset: String(parseInt(message.offset) + 1)
            }])
        }
    })
}

main()