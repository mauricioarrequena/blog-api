import { Request, Response, Router } from "express";
import http from "http";
import {
  authenticateToken,
  AuthenticationRequest,
} from "../middlewares/authenticationMmiddlware";
import { PostService } from "../services/postService/postService";
import { AppDatasource } from "../dataSource";
import { PostDto } from "../dtos/posts/postDto";

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
      const post = await this.postService.createPost(
        title,
        content,
        tags,
        userId
      );
      const postDto = this.toPostDto(post.id, post.title, post.content);
      res.status(201).json(postDto);
    } catch (error) {
      res.status(503).send(http.STATUS_CODES[503]);
    }
  }

  private toPostDto(id: number, title: string, content: string) {
    const postDto: PostDto = {
      id,
      title,
      content,
    };
    return postDto;
  }
}
