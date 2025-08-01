"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const client = new client_1.PrismaClient();
const app = (0, express_1.default)();
const HOOKS_PORT = 3000;
app.use(express_1.default.json());
// https://hooks.zapier.com/hooks/catch/asdfadf/adsfasdf/
app.post("/hooks/catch/:userId/:zapId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;
    // store in DB a new Trigger
    yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const run = yield client.zapRun.create({
            data: {
                zapId,
                metadata: body
            }
        });
        yield client.zapRunOutbox.create({
            data: {
                zapRunId: run.id
            }
        });
    }));
    return res.send(200).json({
        success: "true",
        message: "Webhook Received"
    });
}));
app.listen(HOOKS_PORT, () => {
    console.log("Hooks Backend started on PORT: " + HOOKS_PORT);
});
