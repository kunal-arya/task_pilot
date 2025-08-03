import { PrismaClient } from "@prisma/client"
import { Kafka } from "kafkajs"

const TOPIC_NAME = "zapier-events"
const client = new PrismaClient()

const kafka = new Kafka({
    clientId: "zaiper",
    brokers: ["localhost:9092"]
})

const producer = kafka.producer()

async function main() {
    await producer.connect();

    while(1) {
        const pendingRows = await client.zapRunOutbox.findMany({
            where: {},
            take: 10
        })

        producer.send({
            topic: TOPIC_NAME,
            messages: pendingRows.map(r => ({value: r.zapRunId}))
        })

        await client.zapRunOutbox.deleteMany({
            where: {
                id: {
                    in: pendingRows.map(r => r.id)
                }
            }
        })
    }
}

main()

