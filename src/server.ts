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

async function getCurrentUser(token: string) {
  // @ts-ignore
  const { id } = jwt.verify(token, SECRET);
  const user = await prisma.user.findUnique({ where: { id: id } });
  return user;
}
async function getCurrentDesigner(token: string) {
  // @ts-ignore
  const { id } = jwt.verify(token, SECRET);
  const designer = await prisma.designer.findUnique({ where: { id: id } });
  return designer;
}

const port = 5637;

app.get("/blogs", async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        // @ts-ignore
        category: true,
        images: true,
      },
    });
    res.send(blogs);
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});
app.get("/designers", async (req, res) => {
  try {
    const designer = await prisma.designer.findMany({
      include: {
        // @ts-ignore
        blogs: true,
      },
    });
    res.send(designer);
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/blog/:id", async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        designer: true,
        images: true,
        likes: true,
        comments: { include: { user: true } },
      },
    });
    if (blog) {
      res.send(blog);
    } else {
      res.send(404).send({ error: "Blog not Found!" });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});
app.get("/designer/:id", async (req, res) => {
  try {
    const designerId = Number(req.params.id);
    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
      include: {
        blogs: true,
      },
    });
    if (designer) {
      res.send(designer);
    } else {
      res.send(404).send({ error: "Designer not Found!" });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});
app.get("/categories", async (req, res) => {
  try {
    const catogories = await prisma.category.findMany({
      include: { blogs: true },
    });
    res.send(catogories);
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/categories/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const category = await prisma.category.findUnique({
      where: { id: id },
      include: { blogs: { include: { images: true } } },
    });

    if (category) {
      res.send(category);
    } else {
      res.status(400).send({ error: "Category not Found!" });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});
app.get("/blogsForCategory/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const category = await prisma.category.findUnique({
      where: { id },
      include: { blogs: true },
    });
    if (!category) {
      res.status(400).send({ error: "Category not Found!" });
      return;
    }
    res.send(category.blogs);
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.post("/sign-up/user", async (req, res) => {
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
      res.send({ newUser: newUser, token: getToken(newUser.id) });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});
app.post("/sign-up/designer", async (req, res) => {
  try {
    const match = await prisma.designer.findUnique({
      where: { email: req.body.email },
    });
    if (match) {
      res.status(400).send({ error: "This account already exist!" });
    } else {
      const newDesigner = await prisma.designer.create({
        data: {
          name: req.body.name,
          lastName: req.body.lastName,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password),
        },
      });
      res.send({ newDesigner: newDesigner, token: getToken(newDesigner.id) });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});
app.post("/sign-in/user", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      res.send({ user: user, token: getToken(user.id) });
    } else {
      res.status(400).send({ message: "Invalid email/password" });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});
app.post("/sign-in/designer", async (req, res) => {
  try {
    const designer = await prisma.designer.findUnique({
      where: { email: req.body.email },
    });
    if (designer && bcrypt.compareSync(req.body.password, designer.password)) {
      res.send({ designer: designer, token: getToken(designer.id) });
    } else {
      res.status(400).send({ message: "Invalid email/password" });
    }
  } catch (error) {
    // @ts-ignore
    res.send(400).send({ error: error.message });
  }
});
app.get("/validate/user", async (req, res) => {
  try {
    if (req.headers.authorization) {
      const user = await getCurrentUser(req.headers.authorization);
      // @ts-ignore
      res.send({ user, token: getToken(user.id) });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});
app.get("/validate/designer", async (req, res) => {
  try {
    if (req.headers.authorization) {
      const designer = await getCurrentDesigner(req.headers.authorization);
      // @ts-ignore
      res.send({ designer, token: getToken(designer.id) });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/search/:blog", async (req, res) => {
  // @ts-ignore
  const title = req.params.title;
  const results = await prisma.blog.findMany({
    where: { title: { contains: title } },
  });
  res.send(results);
});

//  get likes
app.get("/likes", async (req, res) => {
  const likes = await prisma.likes.findMany();
  res.send(likes);
});
// get comments

app.get("/comments", async (req, res) => {
  try {
    const comment = await prisma.comment.findMany({
      include: { user: true },
    });
    res.send(comment);
  } catch (error) {
    // @ts-ignore
    res.status(404).send({ error: error.message });
  }
});
app.post(
  "/blogs",
  async (req, res) => {
    await prisma.blog.create({
      data: req.body,
      include: { designer: true },
    });
    const newDesign = await prisma.blog.findMany({
      include: {
        designer: true,
      },
    });
    res.send(newDesign);
  },

  app.post("/comments", async (req, res) => {
    // try {
    //   const comment = await prisma.comment.create({
    //     data: {
    //       user: {
    //         connect: { id: req.body.userId },
    //       },
    //       blog: {
    //         connect: { id: req.body.blogId },
    //       },
    //       // @ts-ignore
    //       comment: {
    //         connect: { comment: req.body.userId },
    //       },
    //     },
    //   });
    //   res.send(comment);
    // } catch (error) {
    //   // @ts-ignore
    //   res.status(400).send({ error: error.message });
    // }
    try {
      const comment = {
        blogId: req.body.blogId,
        userId: req.body.userId,
        comment: req.body.comment,
      };
      const newComment = await prisma.comment.create({
        data: {
          blogId: comment.blogId,
          userId: comment.userId,
          comment: comment.comment,
        },
        // include: { user: true },
      });
      const blog = await prisma.blog.findUnique({
        where: { id: req.body.blogId },
        include: {
          images: true,
          designer: true,
          likes: true,
          comments: { include: { user: true } },
        },
      });
      res.send(blog);
    } catch (error) {
      // @ts-ignore
      res.status(400).send({ error: error.message });
    }
  })
);
// // getAfavoritedesignbyid
app.get("/favorites/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const favorites = await prisma.favorites.findMany({
      where: { userId: id },
      include: { blog: { include: { designer: true } } },
    });
    res.send(favorites);
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.post("/favorites", async (req, res) => {
  try {
    const favorite = await prisma.favorites.create({
      data: {
        user: {
          connect: { id: req.body.userId },
        },
        blog: {
          connect: { id: req.body.blogId },
        },
      },
    });
    res.send(favorite);
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});
// get likes

app.get("/likes", async (req, res) => {
  const likes = await prisma.likes.findMany();
  res.send(likes);
});

//  like a post

app.post("/likeBlogs", async (req, res) => {
  const like = {
    blogId: req.body.blogId,
    userId: req.body.userId,
  };
  try {
    const likeBlog = await prisma.likes.create({
      data: {
        blogId: like.blogId,
        userId: like.userId,
      },
      include: { blog: true },
    });

    const blog = await prisma.blog.findUnique({
      where: { id: like.blogId },
      include: {
        designer: true,
        images: true,
        likes: true,
        comments: { include: { user: true } },
      },
    });

    res.send(blog);
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`yay: http://localhost:${port}`);
});
