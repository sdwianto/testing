//src/server/api/routers/product.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { supabaseAdmin } from "@/server/supabase-admin";
import { Bucket } from "@/server/bucket";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

export const productRouter = createTRPCRouter({
  getProducts: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const whereClause: Prisma.ProductWhereInput = {};

      if (input.categoryId !== "all") {
        whereClause.categoryId = input.categoryId;
      }

      const products = await db.product.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return products;
    }),

  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        price: z.number().min(1000),
        categoryId: z.string(),
        // multipart/form-data | JSON
        imageUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const newProduct = await db.product.create({
        data: {
          name: input.name,
          price: input.price,
          category: {
            connect: {
              id: input.categoryId,
            },
          },
          imageUrl: input.imageUrl,
        },
      });

      return newProduct;
    }),

  createProductImageUploadSignedUrl: protectedProcedure.mutation(async () => {
    const { data, error } = await supabaseAdmin.storage
      .from(Bucket.ProductImages)
      .createSignedUploadUrl(`${Date.now()}.jpeg`);

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return data;
  }),

  deleteProductById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      try {
        // First, check if the product exists
        const product = await db.product.findUnique({
          where: { id: input.id },
          include: {
            orderItems: true,
          },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        // Check if product has any order items
        if (product.orderItems.length > 0) {
          // Option 1: Prevent deletion if there are order items
          throw new TRPCError({
            code: "CONFLICT",
            message: "Cannot delete product with existing orders. Please archive the product instead.",
          });
          
          // Option 2: Uncomment below to allow deletion and remove related order items
          // await db.orderItem.deleteMany({
          //   where: { productId: input.id },
          // });
        }

        // Delete the product
        await db.product.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        console.error('Error in deleteProductById:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while deleting the product",
          cause: error,
        });
      }
    }),

  editProduct: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3),
        price: z.number().min(1000),
        categoryId: z.string(),
        imageUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const updatedProduct = await db.product.update({
        where: { id: input.id },
        data: {
          name: input.name,
          price: input.price,
          category: {
            connect: {
              id: input.categoryId,
            },
          },
          imageUrl: input.imageUrl,
        },
      });

      return updatedProduct;
    }),
});
