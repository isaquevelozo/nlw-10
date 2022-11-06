import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function guessRoutes(fastify: FastifyInstance) {
    fastify.get("/guesses/count", async () => {
        const count = await prisma.pool.count();
        return { count };
    });

    fastify.post(
        "/pools/:poolId/games/:gameId/guesses",
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const createGuessParams = z.object({
                poolId: z.string(),
                gameId: z.string(),
            });

            const { poolId, gameId } = createGuessParams.parse(request.params);

            const createGuessBody = z.object({
                firstTeamPoints: z.number(),
                secondTeamPoints: z.number(),
            });

            const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(
                request.body
            );

            const participant = await prisma.participant.findUnique({
                where: {
                    userId_poolId: {
                        poolId,
                        userId: request.user.sub,
                    },
                },
            });
            if (!participant) {
                return reply.status(400).send({
                    message:
                        "Voce não tem autorizacao para criar um palpite nesse bolao",
                });
            }
            const guess = await prisma.guess.findUnique({
                where: {
                    participantId_gameId: {
                        participantId: participant.id,
                        gameId,
                    },
                },
            });
            if (guess) {
                return reply
                    .status(400)
                    .send({ message: "Você já enviou um palpite" });
            }
            const game = await prisma.game.findUnique({
                where: {
                    id: gameId,
                },
            });
            if (!game) {
                return reply
                    .status(400)
                    .send({ message: "Jogo não encontrado" });
            }

            if (game.date < new Date()) {
                return reply.status(400).send({ message: "Já passou da data" });
            }

            await prisma.guess.create({
                data: {
                    gameId,
                    participantId: participant.id,
                    firstTeamPoints,
                    secondTeamPoints,
                },
            });
            return reply.status(201).send();
        }
    );
}
