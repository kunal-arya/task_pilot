import express from "express"
import { PrismaClient } from "@prisma/client"

const client = new PrismaClient()
const app = express()
const HOOKS_PORT = 3000

app.use(express.json())

// https://hooks.zapier.com/hooks/catch/asdfadf/adsfasdf/

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
    const userId = req.params.userId
    const zapId = req.params.zapId
    const body = req.body

    // store in DB a new Trigger
    await client.$transaction(async tx => {
        const run = await tx.zapRun.create({
            data: {
                zapId,
                metadata: body
            }
        })

        await tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id
            }
        })
    })

    return res.send(200).json({
        success: "true",
        message: "Webhook Received"
    })

})

app.listen(HOOKS_PORT, () => {
    console.log("Hooks Backend started on PORT: " + HOOKS_PORT)
})