import { useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";

import { GetProductResponse, UpdateProductResponse } from "@shared/types/apiTypes";
import { Product } from "@shared/types/entitiesTypes";

import { productsAPI } from "../../../api/productsAPI";
import { CategoriesSelectBox, MultiImagesUpload } from "../../../components";
import { useHandleErrors, useNotify } from "../../../hooks";

const UpdateProduct = ({ updateProductId, setProducts, setOpenUpdateProduct }) => {
  const [productTitle, setProductTitle] = useState<string>("");
  const [productDesc, setProductDesc] = useState<string>("");
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productDiscount, setProductDiscount] = useState<number>(0);
  const [productFinalPrice, setProductFinalPrice] = useState<number>(0);
  const [productAvailable, setProductAvailable] = useState<number>(1);
  const [productCategoryId, setProductCategoryId] = useState<number>();
  const [productImages, setProductImages] = useState<string[]>([]);
  const [deletedProductImages, setDeletedProductImages] = useState<string[]>([]);
  const [newProductImages, setNewProductImages] = useState<Blob[]>([]);

  const [fetchProductLoad, setFetchProductLoad] = useState<boolean>(false);
  const [updateProductLoad, setUpdateProductLoad] = useState<boolean>(false);

  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const fetchProduct = async () => {
    try {
      setFetchProductLoad(true);

      const res = await productsAPI.getProduct(updateProductId);

      const data: GetProductResponse = res.data.data;

      setProductTitle(data.product.title);
      setProductDesc(data.product.desc);
      setProductPrice(data.product.price);
      setProductDiscount(data.product.discount);
      setProductAvailable(data.product.available);
      setProductCategoryId(data.product.categoryId);
      setProductImages(data.product.images);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchProductLoad(false);
    }
  };

  const updateProduct = async () => {
    try {
      setUpdateProductLoad(true);

      if (
        !productTitle ||
        !productDesc ||
        !productPrice ||
        !productDiscount ||
        !productAvailable ||
        !productCategoryId
      ) {
        return notify(
          "info",
          "Product title, desc, price, discount, available and category are required",
        );
      }

      const formData = new FormData();
      formData.append("title", productTitle);
      formData.append("desc", productDesc);
      formData.append("price", String(productPrice));
      formData.append("discount", String(productDiscount));
      formData.append("available", String(productAvailable));
      formData.append("categoryId", String(productCategoryId));
      newProductImages.forEach((imageFile) => formData.append("images", imageFile));
      deletedProductImages.forEach((image) => {
        formData.append("deletedImages[]", image.split("/").pop()!);
      });

      const res = await productsAPI.updateProduct(updateProductId, formData);

      const data: UpdateProductResponse = res.data.data;

      const updatedProduct: Product = data.updatedProduct;

      setProducts((prev: Product[]) => {
        return prev.map((product: Product) => {
          return product._id === updatedProduct._id ? updatedProduct : product;
        });
      });

      notify("success", res.data?.message);

      setOpenUpdateProduct(false);
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Update product fail!");
      }
    } finally {
      setUpdateProductLoad(false);
    }
  };

  // Fetch product data
  useEffect(() => {
    if (updateProductId) fetchProduct();
  }, [updateProductId]);

  // Set product final price for disabled input field
  useEffect(() => {
    setProductFinalPrice(productPrice - (productDiscount / 100) * productPrice);
  }, [productPrice, productDiscount]);

  return (
    <section className="w-fit sm:w-100 lg:w-230 py-14 px-4 md:px-6 2xl:px-20 2xl:container 2xl:mx-auto text-body bg-whiten dark:bg-boxdark-2 dark:text-bodydark">
      {!fetchProductLoad ? (
        <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {/* Header */}
          <header className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h2 className="font-bold text-black dark:text-white">Update Product</h2>
          </header>

          <form
            className="flex flex-col gap-4 p-6.5"
            onSubmit={(e) => {
              e.preventDefault();
              updateProduct();
            }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-5.5">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="mb-3 block text-black dark:text-white">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Product Title"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Desc */}
                <div>
                  <label htmlFor="desc" className="mb-3 block text-black dark:text-white">
                    Desc
                  </label>
                  <textarea
                    name="desc"
                    id="desc"
                    rows={6}
                    placeholder="Product description"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    required
                  ></textarea>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="mb-3 block text-black dark:text-white">
                    Price in $
                  </label>
                  <input
                    type="number"
                    min={0}
                    name="price"
                    id="price"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Product Price"
                    value={productPrice}
                    onChange={(e) => setProductPrice(+e.target.value)}
                    required
                  />
                </div>

                {/* Discount */}
                <div>
                  <label htmlFor="discount" className="mb-3 block text-black dark:text-white">
                    Discount
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    name="discount"
                    id="discount"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Product Discount"
                    value={productDiscount}
                    onChange={(e) => setProductDiscount(+e.target.value)}
                    required
                  />
                </div>

                {/* Final Price */}
                <div>
                  <label htmlFor="finalPrice" className="mb-3 block text-black dark:text-white">
                    Final Price
                  </label>
                  <input
                    type="number"
                    name="finalPrice"
                    id="finalPrice"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Product Final Price"
                    value={productFinalPrice}
                    disabled
                  />
                </div>

                {/* Available */}
                <div>
                  <label htmlFor="available" className="mb-3 block text-black dark:text-white">
                    Available Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    name="available"
                    id="available"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Product Available Amount"
                    value={productAvailable}
                    onChange={(e) => setProductAvailable(+e.target.value)}
                    required
                  />
                </div>

                {/* Category Select Box */}
                <div>
                  <label className="mb-3 block text-black dark:text-white">Category</label>

                  <CategoriesSelectBox
                    selectedCategoryId={productCategoryId}
                    setSelectedCategoryId={setProductCategoryId}
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-5.5">
                {/* Upload New Images */}
                <div>
                  <label className="mb-3 block text-black dark:text-white">
                    Add optional additional images
                  </label>

                  <MultiImagesUpload
                    selectedFiles={newProductImages}
                    setSelectedFiles={setNewProductImages}
                  />
                </div>

                {/* Select Deleted Images */}
                <div>
                  <label className="mb-3 block text-black dark:text-white">
                    Select optional removed images
                  </label>

                  <ul className="border-gray-300 rounded-lg max-h-[23rem] overflow-auto border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                    {productImages.map((image, index) => (
                      <li key={index} className="flex justify-between items-center border-b py-2">
                        <label htmlFor={image}>
                          <img src={image} alt="" className="w-8 h-8 mr-2 object-cover" />
                        </label>
                        <input
                          type="checkbox"
                          id={image}
                          checked={deletedProductImages.includes(image)}
                          onChange={() =>
                            setDeletedProductImages((prev) =>
                              prev.includes(image)
                                ? prev.filter((img) => img !== image)
                                : [...prev, image],
                            )
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full justify-center items-center gap-4 rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
              disabled={updateProductLoad ? true : false}
              style={updateProductLoad ? { opacity: 0.5, cursor: "revert" } : {}}
            >
              <span>Update</span>
              {updateProductLoad && <MoonLoader color="#fff" size={15} />}
            </button>
          </form>
        </div>
      ) : fetchProductLoad ? (
        <div className="relative top-1/2 transform -translate-y-12">loading ...</div>
      ) : (
        ""
      )}
    </section>
  );
};

export default UpdateProduct;
