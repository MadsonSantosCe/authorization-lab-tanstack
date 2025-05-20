import express, { Request, Response, response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptJS";
import { verifyToken } from "./utils/jwt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.post("/register", async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      message: "Nome, email e senha são obrigatórios",
    });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(400).json({
        message: "Usuário já existe",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verified: false,
      },
    });

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user:{
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,        
      }
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: "Email e senha são obrigatórios",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(400).json({
        message: "Usuário não encontrado",
      });
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(400).json({
        message: "Senha E-mail ou senha inválidos",
      });
      return;
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
      },
      "74590fcd-c273-4569-a684-543139dba664",
      {
        expiresIn: "1m",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
      },
      "4e1f9b17-a768-47dd-b9b8-fc4c9ef00606",
      {
        expiresIn: "1d",
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Usuário autenticado com sucesso",
      accessToken: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      }
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/logout", (req, res, next) => {
  try {
    res.clearCookie("refreshToken");
    res.status(200).json({
      message: "Usuário deslogado com sucesso",
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/verify-access-token", async (req, res, next) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  const decoded = verifyToken(
    accessToken,
    "74590fcd-c273-4569-a684-543139dba664"
  );

  if (!decoded?.id) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado",
      });
      return;
    }

    res.status(200).json({
      message: "Token verificado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post("/refresh-token", async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.clearCookie("refreshToken");
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  try {
    const decoded = verifyToken(
      refreshToken,
      "4e1f9b17-a768-47dd-b9b8-fc4c9ef00606"
    );

    if (!decoded?.id) {
      res.clearCookie("refreshToken");
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado",
      });
      return;
    }

    const newToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      "74590fcd-c273-4569-a684-543139dba664",
      {
        expiresIn: "1m",
      }
    );

    res.status(200).json({
      message: "Token atualizado com sucesso",
      accessToken: newToken,
    });
  } catch (error) {
    next(error);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
