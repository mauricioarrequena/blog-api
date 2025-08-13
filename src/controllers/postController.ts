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
    this.router.get("/", authenticateToken, this.getPosts.bind(this));
    this.router.get("/:postId", authenticateToken, this.getPost.bind(this));
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

  public async getPost(req: Request, res: Response) {
    const postId = Number(req.params.postId);

    try {
      const post = await this.postService.getPostById(postId);
      if (!post) {
        return res.status(404).json(http.STATUS_CODES[404]);
      }
      const postDto = this.toPostDto(post.id, post.title, post.content);
      res.json(postDto);
    } catch (error) {
      res.status(503).send(http.STATUS_CODES[503]);
    }
  }

  public async getPosts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    try {
      const [posts, totalPosts] = await this.postService.getPaginatedPosts(
        page,
        limit
      );
      res.json({
        data: posts,
        meta: {
          totalItems: totalPosts,
          totalPages: Math.ceil(totalPosts / limit),
          currentPage: page,
          pageSize: limit,
        },
      });
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
