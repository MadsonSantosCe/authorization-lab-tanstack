import express, { Request, Response, response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import { verifyToken } from "./utils/jwt";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.post("/login", (req, res, next) => {
  try {
    const user = {
      id: 1,
      name: "Madson Santos",
      email: "madson@email.com",
    };
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
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/logout", (req, res, next) => {
  try {
    res.status(200).json({
      message: "Usuário deslogado com sucesso",
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/verify-access-token", (req, res, next) => {
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
    const user = {
      id: 1,
      name: "Madson Santos",
      email: "madson@email.com",
    };

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
      user,
      accessToken: newToken,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/refresh-token", (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {    
    res.clearCookie("refreshToken");
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

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

  try {
    const user = {
      id: 1,
      name: "Madson Santos",
      email: "madson@email.com",
      token: "123456789",
    };

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

    res.status(200).json({ user, accessToken: newToken });
  } catch (error) {
    next(error);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
