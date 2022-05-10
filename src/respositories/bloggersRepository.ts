import { db } from "./db";
import { IBlogger } from "../entity/Blogger";
import { EntityManager } from "../lib/entityManager";
import { PaginatorOptions, ResponseDataWithPaginator } from "../lib/Paginator";
import { Nullable } from "../types/genericTypes";

// export interface Blogger {
//     id: number;
//     name: string;
//     youtubeUrl: string;
// }

const bloggersCollection = db.collection<IBlogger>("bloggers");

const m = new EntityManager(db);

export class BloggersRepository {
    // async getBloggers(withArchived: boolean = false): Promise<Blogger[]> {
    //     return bloggersCollection
    //         .find(withArchived ? {} : { deleted: { $exists: false } })
    //         .toArray();
    // },
    async getBloggers(
        { searchNameTerm }: { searchNameTerm: Nullable<string> },
        paginatorOptions?: PaginatorOptions
    ): Promise<ResponseDataWithPaginator<IBlogger>> {
        return m.find<IBlogger>(
            "bloggers",
            searchNameTerm ? { name: { $regex: searchNameTerm } } : {},
            paginatorOptions
        );
    }
    // async getBloggerById(
    //     id: number,
    //     withArchived: boolean = false
    // ): Promise<Blogger | null> {
    //     return await bloggersCollection.findOne({
    //         id: id,
    //         ...(withArchived ? {} : { deleted: { $exists: false } }),
    //     });
    // },
    async getBloggerById(
        id: number,
        withArchived: boolean = false
    ): Promise<IBlogger | null> {
        return m.findOne<IBlogger>("bloggers", { withArchived, id });
    }
    async createBlogger(blogger: IBlogger): Promise<IBlogger> {
        await bloggersCollection.insertOne(blogger, {
            forceServerObjectId: true,
        });
        return blogger;
    }
    async updateBlogger(
        id: number,
        blogger: Pick<IBlogger, "name" | "youtubeUrl">
    ): Promise<IBlogger | null> {
        const result = await bloggersCollection.findOneAndUpdate(
            { id: id, deleted: { $exists: false } },
            {
                $set: {
                    ...blogger,
                },
            },
            { returnDocument: "after" }
        );
        return result.value;
    }
    async deleteBloggerById(
        id: IBlogger["id"],
        options?: { softRemove: boolean }
    ): Promise<boolean> {
        const result = await m.deleteOne("bloggers", {
            id,
            softRemove: options?.softRemove,
        });

        return result;
    }
}
