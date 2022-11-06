import { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma";

export async function authenticate(request: FastifyRequest) {
    await request.jwtVerify();
}
