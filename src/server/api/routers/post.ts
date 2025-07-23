import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // Example procedure using the Product model
  createProduct: protectedProcedure
    .input(z.object({ 
      name: z.string().min(1),
      price: z.number().min(0),
      categoryId: z.string().min(1),
      imageUrl: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.create({
        data: {
          name: input.name,
          price: input.price,
          categoryId: input.categoryId,
          imageUrl: input.imageUrl
        },
      });
    }),

  getLatestProduct: protectedProcedure
    .output(z.any())
    .query(async ({ ctx }) => {
      const post = await ctx.db.product.findFirst({
        orderBy: { createdAt: "desc" },
        where: { id: ctx.session.userId },
      });

      return post;
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
