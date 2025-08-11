import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import http from "http";

export interface AuthenticationRequest extends Request {
  user: {
    userId: number;
  };
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).send(http.STATUS_CODES[401]);
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const tokenPayload: JwtPayload = jwt.verify(token, secret) as JwtPayload;
    (req as AuthenticationRequest).user = {
      userId: tokenPayload.userId as number,
    };
    next();
  } catch (error) {
    res.status(401).send((error as Error).message);
  }
}
