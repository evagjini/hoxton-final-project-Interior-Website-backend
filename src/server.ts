import  express  from "express";
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { PrismaClient } from "@prisma/client";
dotenv.config()

console.log(bcrypt)




const app = express()
app.use(cors())
app.options('*', cors)
app.use(express.json())
const prisma = new PrismaClient()

const SECRET = process.env.SECRET!

function getToken (id: number) {
  return jwt.sign({ id: id }, SECRET, {
    expiresIn: '30 days'
  })
}

const port = 5636

app.get('/users', async (req, res)=>{

})
app.post("/sign-up", async (req, res)=>{
   const user =  await prisma.user.create({ 
    data:{
        name:req.body.name,
        lastName:req.body.lastName,
        email:req.body.email,
        password: bcrypt.hashSync(req.body.password)

    }})
    res.send(user)
    
})
app.post('/sign-in', async(req,res)=>{
    const user = await prisma.user.findUnique({
        where:{email:req.body.email},
    })
    if(user && bcrypt.compareSync(req.body.password,user.password)){
        res.send(user)
    } else{
        res.status(400).send({error: 'Invalid email/password'});
        

    }
    

})






app.listen(port, () =>{
    console.log(`yay: http://localhost:${port}`)
})