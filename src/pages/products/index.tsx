//src/pages/products/index.tsx
import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "../_app";
import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { ProductCatalogCard } from "@/components/shared/product/ProductCatalogCard";
import { api } from "@/utils/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProductForm } from "@/components/shared/product/ProductForm";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { productFormSchema, type ProductFormSchema } from "@/forms/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

type ProductForEdit = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  category: { id: string; name: string };
};

const ProductsPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();

  const [uploadedCreateProductImageUrl, setUploadedCreateProductImageUrl] =
    useState<string | null>(null);
  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false);

  // Tambahan untuk delete
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Tambahan untuk edit
  const [productToEdit, setProductToEdit] = useState<ProductForEdit | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploadedEditProductImageUrl, setUploadedEditProductImageUrl] = useState<string | null>(null);

  const { data: products } = api.product.getProducts.useQuery({
    categoryId: "all",
  });

  const { mutate: createProduct } = api.product.createProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();
      toast.success("Successfully created new product");
      setCreateProductDialogOpen(false);
    },
  });

  // Tambahan: mutation hapus produk
  const { mutate: deleteProductById, isPending: isDeleting } = api.product.deleteProductById.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();
      toast.success("Successfully deleted product");
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      // Handle specific error codes
      if (error.data?.code === 'CONFLICT') {
        toast.error(error.message || "Cannot delete product with existing orders. Please archive the product instead.");
      } else if (error.data?.code === 'NOT_FOUND') {
        toast.error("Product not found. It may have already been deleted.");
      } else {
        toast.error(error.message || "Failed to delete product. Please try again.");
      }
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
  });

  // Handler hapus
  const handleClickDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };
  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    deleteProductById({ id: productToDelete });
  };

  // useForm -> Real
  // useFormContext -> Asumsi Bentuk Form
  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const handleSubmitCreateProduct = (values: ProductFormSchema) => {
    if (!uploadedCreateProductImageUrl) {
      toast.error("Please upload a product image first");
      return;
    }

    createProduct({
      name: values.name,
      price: values.price,
      categoryId: values.categoryId,
      imageUrl: uploadedCreateProductImageUrl,
    });
  };

  const editProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const { mutate: editProduct, isPending: isEditing } = api.product.editProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();
      toast.success("Successfully edited product");
      setEditDialogOpen(false);
      setProductToEdit(null);
      setUploadedEditProductImageUrl(null);
    },
  });

  const handleClickEditProduct = (product: ProductForEdit) => {
    setEditDialogOpen(true);
    setProductToEdit(product);
    setUploadedEditProductImageUrl(product.imageUrl ?? "");
    editProductForm.reset({
      name: product.name,
      price: product.price,
      categoryId: product.category.id,
    });
  };

  const handleSubmitEditProduct = (values: ProductFormSchema) => {
    if (!uploadedEditProductImageUrl || !productToEdit) {
      toast.error("Please upload a product image");
      return;
    }
    editProduct({
      id: productToEdit.id,
      name: values.name,
      price: values.price,
      categoryId: values.categoryId,
      imageUrl: uploadedEditProductImageUrl,
    });
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Product Management</DashboardTitle>
            <DashboardDescription>
              View, add, edit, and delete products in your inventory.
            </DashboardDescription>
          </div>

          <AlertDialog
            open={createProductDialogOpen}
            onOpenChange={setCreateProductDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Product</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create Product</AlertDialogTitle>
              </AlertDialogHeader>

              <Form {...createProductForm}>
                <ProductForm
                  onSubmit={handleSubmitCreateProduct}
                  onChangeImageUrl={(imageUrl) => {
                    setUploadedCreateProductImageUrl(imageUrl);
                  }}
                />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <Button
                  onClick={createProductForm.handleSubmit(
                    handleSubmitCreateProduct,
                  )}
                >
                  Create Product
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => {
          return (
            <ProductCatalogCard
              key={product.id}
              name={product.name}
              price={product.price}
              image={product.imageUrl ?? ""}
              category={product.category.name}
              onDelete={() => handleClickDeleteProduct(product.id)}
              onEdit={() => handleClickEditProduct(product)}
            />
          );
        })}
      </div>

      {/* Dialog konfirmasi hapus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Are you sure you want to delete this product? This action cannot be undone.</p>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <Button variant="destructive" onClick={handleConfirmDeleteProduct} disabled={isDeleting}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog edit produk */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Product</AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...editProductForm}>
            <ProductForm
              onSubmit={handleSubmitEditProduct}
              onChangeImageUrl={setUploadedEditProductImageUrl}
            />
          </Form>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEditing} onClick={() => setEditDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={editProductForm.handleSubmit(handleSubmitEditProduct)}
              disabled={isEditing}
            >
              Edit Product
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
