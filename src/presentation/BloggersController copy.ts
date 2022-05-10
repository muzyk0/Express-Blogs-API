import { Request, Response } from "express";
import { Paginator } from "../lib/Paginator";
import { BloggersService } from "../domain/bloggersService";
import { Blogger } from "../entity/Blogger";
import { Post } from "../entity/Post";
import { PostsService } from "../domain/postsService";

export class PostsController {
    constructor(
        private bloggersService: BloggersService,
        private postsService: PostsService
    ) {}

    // .get("/")
    async getAllPosts(req: Request, res: Response) {
        const paginatorValues = new Paginator(req.query);

        const paginatorValidateErrors = await Paginator.validate(
            paginatorValues
        );

        if (paginatorValidateErrors) {
            return res.status(400).send(paginatorValidateErrors);
        }

        const posts = await this.postsService.findPosts(
            { searchNameTerm: paginatorValues.SearchNameTerm },
            {
                page: paginatorValues.PageNumber,
                pageSize: paginatorValues.PageSize,
            }
        );
        res.status(200).send(posts);
    }

    // .get("/:id"
    async getPostById(req: Request<{ id: string }>, res: Response) {
        const id = parseInt(req.params.id);

        {
            const postValidation = new Post();

            postValidation.id = id;

            const errors = await Post.validate(postValidation);

            if (errors) {
                res.status(400).send(errors);
                return;
            }
        }

        const post = await this.postsService.findPostById(id);

        if (!post) {
            res.status(404).send(
                Post.setErrors([
                    {
                        field: "",
                        message: `Post doesn't exist`,
                    },
                ])
            );
            return;
        }

        res.status(200).send(post);
    }

    //
    async createNewPost(
        req: Request<
            {},
            {},
            {
                title: string;
                shortDescription: string;
                content: string;
                bloggerId: number;
            }
        >,
        res: Response
    ) {
        const { title, bloggerId, content, shortDescription } = req.body;

        {
            const postValidation = new Post();

            postValidation.title = title?.trim();
            postValidation.bloggerId = bloggerId;
            postValidation.content = content?.trim();
            postValidation.shortDescription = shortDescription;

            const errors = await Post.validate(postValidation);

            if (errors) {
                res.status(400).send(errors);
                return;
            }
        }

        const blogger = await this.bloggersService.findBloggerById(bloggerId);

        if (!blogger) {
            res.status(400).send(
                Post.setErrors([
                    {
                        field: "bloggerId",
                        message: `Blogger doesn't exist`,
                    },
                ])
            );
            return;
        }

        const newPost = await this.postsService.createPost({
            title,
            bloggerId,
            content,
            shortDescription,
        });

        if (!newPost) {
            res.status(400).send(
                Post.setErrors([
                    {
                        field: "",
                        message: `Post doesn't created`,
                    },
                ])
            );
            return;
        }

        res.status(201).send(newPost);
    }

    // .put("/:id")
    async updatePost(
        req: Request<
            { id: string },
            {},
            {
                title: string;
                shortDescription: string;
                content: string;
                bloggerId: number;
            }
        >,
        res: Response
    ) {
        const { title, bloggerId, content, shortDescription } = req.body;
        const id = parseInt(req.params.id);

        {
            const postValidation = new Post();

            postValidation.id = id;
            postValidation.title = title?.trim();
            postValidation.bloggerId = bloggerId;
            postValidation.content = content?.trim();
            postValidation.shortDescription = shortDescription;

            const errors = await Post.validate(postValidation);

            if (errors) {
                res.status(400).send(errors);
                return;
            }
        }

        const blogger = await this.bloggersService.findBloggerById(bloggerId);

        if (!blogger) {
            res.status(400).send(
                Post.setErrors([
                    {
                        field: "bloggerId",
                        message: `Blogger doesn't exist`,
                    },
                ])
            );
            return;
        }

        const post = await this.postsService.updatePost({
            id,
            title,
            shortDescription,
            bloggerId,
            content,
        });

        if (!post) {
            res.status(404).send(
                Post.setErrors([
                    {
                        field: "",
                        message: `Post doesn't updated`,
                    },
                ])
            );
            return;
        }

        res.status(204).send(post);
    }

    // .delete("/:id")
    async deleteBlogger(req: Request<{ id: string }>, res: Response) {
        const id = parseInt(req.params.id);

        {
            const postValidation = new Post();

            postValidation.id = id;

            const errors = await Post.validate(postValidation);

            if (errors) {
                res.status(400).send(errors);
                return;
            }
        }

        const isDeleted = await this.postsService.deletePost(id);

        if (!isDeleted) {
            res.status(404).send(
                Post.setErrors([
                    {
                        field: "",
                        message: `Post doesn't deleted`,
                    },
                ])
            );
            return;
        }

        res.sendStatus(204);
    }
}
