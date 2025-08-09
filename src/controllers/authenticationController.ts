import { Request, Response, Router } from "express";
import http from "http";
import bcrypt from "bcrypt";
import AuthenticationService from "../services/authenticationService";
import { AppDatasource } from "../dataSource";
import jwt from "jsonwebtoken";

export class AuthenticationController {
  public router = Router();
  private authenticationService: AuthenticationService;

  constructor() {
    this.router.post("/signUp", this.signUp.bind(this));
    this.router.post("/login", this.login.bind(this));
    this.authenticationService = new AuthenticationService(
      AppDatasource.getRepository("User")
    );
  }

  public async signUp(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send(http.STATUS_CODES[400]);
    }

    try {
      const user = await this.authenticationService.createUser(email, password);
      res.status(201).json(user);
    } catch (error) {
      res.status(503).send(http.STATUS_CODES[503]);
    }
  }

  public async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send(http.STATUS_CODES[400]);
    }

    try {
      const user = await this.authenticationService.findByEmail(email);
      if (!user) {
        return res.status(401).send(http.STATUS_CODES[401]);
      }

      const IsValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!IsValidPassword) {
        return res.status(401).send(http.STATUS_CODES[401]);
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      res.json({ token });
    } catch (error) {
      res.status(503).send(http.STATUS_CODES[503]);
    }
  }
}
