import { Request, Response, Router } from "express";
import http from "http";
import {
  authenticateToken,
  AuthenticationRequest,
} from "../middlewares/authenticationMmiddlware";
import { PostService } from "../services/postService";
import { AppDatasource } from "../dataSource";

export class PostController {
  public router = Router();
  public postService: PostService;

  constructor() {
    this.router.post("/", authenticateToken, this.postPost.bind(this));
    this.postService = new PostService(
      AppDatasource.getRepository("Post"),
      AppDatasource.getRepository("Tag"),
      AppDatasource.getRepository("User")
    );
  }

  public async postPost(req: Request, res: Response) {
    const authenticationRequest = req as AuthenticationRequest;
    const { title, content, tags } = authenticationRequest.body;
    const userId = authenticationRequest.user.userId;

    if (!title || !content) {
      return res.status(400).json(http.STATUS_CODES[400]);
    }

    try {
      const post = await this.postService.createPost(title, content, tags, userId);
      res.status(201).json(post);
    } catch (error) {
      res.status(503).send(http.STATUS_CODES[503]);
    }
  }
}
