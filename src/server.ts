import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config();

console.log(bcrypt);

const app = express();
app.use(cors());
app.options("*", cors);
app.use(express.json());
const prisma = new PrismaClient();

const SECRET = "ABC";

function getToken(id: number) {
  return jwt.sign({ id: id }, SECRET, {
    expiresIn: "30 days",
  });
}

async function getCurrentUser (token :string){
    // @ts-ignore
    const {id} = jwt.verify(token, SECRET);
    const user = await prisma.user.findUnique({where: {id :id} });
  return user;
}

const port = 5637;

app.get("/blogs", async (req, res) => {
    try{
        const blogs = await prisma.blog.findMany({ include:{
            // @ts-ignore
            category:true}
        });
        res.send(blogs)
    } catch (error){
        // @ts-ignore
        res.status(400).send({errors:error.message})
    }
});
app.get('/blog/:id', async (req,res)=>{
  try{
    const blogId = Number(req.params.id)
    const blog = await prisma.blog.findUnique({
      where:{id: blogId},
      include:{designer :true, likes:true, comments:{include:{user:true}}}
    });
    if (blog){
      res.send(blog);
    } else{
      res.send(404).send({error : 'Blog not Found!'});
      }
    } catch(error){
      // @ts-ignore 
      res.status(400).send({error:error.message})
    }
  }
)
app.get('/categories',async (req,res)=>{
    try{
        const catogories = await prisma.category.findMany({ include:
            {blogs:true}}
) ;
res.send(catogories)
        } catch(error){
            // @ts-ignore
            res.status(400).send({error:error.message})
        }})

app.get('/categories/:id', async (req,res) =>{
  try{
    const id = Number(req.params.id);

    const category = await prisma.category.findUnique({
       where:{id:id},
       include:{blogs:true}
    });
    if(category){
      res.send(category)
    } else {
      res.status(400).send({error:'Category not Found!'})
    }
  } catch (error){
    // @ts-ignore
    res.status(400).send({error:error.message})
  }
} )


app.post("/sign-up", async (req, res) => {
  try {
    const match = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (match) {
      res.status(400).send({ error: "This account already exist!" });
    } else {
      const newUser = await prisma.user.create({
        data: {
          name: req.body.name,
          lastName: req.body.lastName,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password),
        },
      });
      res.send({newUser:newUser, token: getToken(newUser.id)});
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});
app.post("/sign-in", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  });
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.send({user:user , token:getToken(user.id)});
  } else {
    res.status(400).send({ error: "Invalid email/password" });
  }
});
app.get('/validate', async (req,res)=>{
    try{
        if(req.headers.authorization){
            const user = await getCurrentUser(req.headers.authorization);
            // @ts-ignore
            res.send({user, token : getToken(user.id)})

        } 
    }catch (error){
            // @ts-ignore
           res.status(400).send({error:error.message})
        }
    }
);
app.listen(port, () => {
  console.log(`yay: http://localhost:${port}`)
})
