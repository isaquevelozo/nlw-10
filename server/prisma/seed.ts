import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

async function main(){

const user = await prisma.user.create({
  data: {
  name: 'Jhon Doe',
  email: 'jhon2@email.com',
  avatarURL: 'https://github.com/diego3g.png',
}
})
const pool = await prisma.pool.create({
  data:{
    title:'exemple Pool',
    code:'BLA123',
    ownerId:user.id,
    participants:{
      create:{
        userId:user.id
      }
    }
  }
})

await prisma.game.create({
  data:{
    date:'2022-11-02T19:06:07.051Z',
    firstTeamCountryCode:'DE',
    secondTeamCountryCode:'BR',
  }
})
await prisma.game.create({
  data:{
    date:'2022-11-02T19:12:07.051Z',
    firstTeamCountryCode:'BR',
    secondTeamCountryCode:'AR',

    guesses:{
      create:{ 
        firstTeamPoints:2,
        secondTeamPoints:1,
        participant:{
          connect:{ 
            userId_poolId:{
              userId:user.id,
              poolId:pool.id,
            }
          }
        }
      }
    }
  },
})
}
main()