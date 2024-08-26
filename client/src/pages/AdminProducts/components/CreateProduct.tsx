import { useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";

import { CreateProductResponse } from "@shared/types/apiTypes";
import { Product } from "@shared/types/entitiesTypes";

import { productsAPI } from "../../../api/productsAPI";
import { CategoriesSelectBox, MultiImagesUpload } from "../../../components";
import { useNotify } from "../../../hooks";

const CreateProduct = ({ setProducts, setOpenCreateProduct }) => {
  const [productTitle, setProductTitle] = useState<string>("");
  const [productDesc, setProductDesc] = useState<string>("");
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productDiscount, setProductDiscount] = useState<number>(0);
  const [productFinalPrice, setProductFinalPrice] = useState<number>(0);
  const [productAvailable, setProductAvailable] = useState<number>(1);
  const [productCategoryId, setProductCategoryId] = useState<number>();
  const [productImages, setProductImages] = useState<Blob[]>([]);

  const [createProductLoad, setCreateProductLoad] = useState<boolean>(false);
  const notify = useNotify();

  const createProduct = async () => {
    try {
      setCreateProductLoad(true);

      if (
        !productTitle ||
        !productDesc ||
        !productPrice ||
        !productAvailable ||
        !productCategoryId ||
        productImages.length === 0
      ) {
        return notify("info", "All fields are required");
      }

      const formData = new FormData();
      formData.append("title", productTitle);
      formData.append("desc", productDesc);
      formData.append("price", String(productPrice));
      formData.append("discount", String(productDiscount));
      formData.append("available", String(productAvailable));
      formData.append("categoryId", String(productCategoryId));
      productImages.forEach((imageFile) => formData.append("images", imageFile));

      const res = await productsAPI.createProduct(formData);

      const data: CreateProductResponse = res.data.data;

      const newProduct: Product = data.newProduct;

      setProducts((prev: Product[]) => [newProduct, ...prev]);

      notify("success", res.data?.message);

      setOpenCreateProduct(false);
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Create product fail!");
      }
    } finally {
      setCreateProductLoad(false);
    }
  };

  // Set product final price for disabled input field
  useEffect(() => {
    setProductFinalPrice(productPrice - (productDiscount / 100 * productPrice));
  }, [productPrice, productDiscount]);

  return (
    <section className="w-fit sm:w-100 lg:w-230 py-14 px-4 md:px-6 2xl:px-20 2xl:container 2xl:mx-auto text-body bg-whiten dark:bg-boxdark-2 dark:text-bodydark">
      <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header */}
        <header className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h2 className="font-bold text-black dark:text-white">Create Product</h2>
        </header>

        <form
          className="flex flex-col gap-4 p-6.5"
          onSubmit={(e) => {
            e.preventDefault();
            createProduct();
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
              {/* Upload Images */}
              <div>
                <label className="mb-3 block text-black dark:text-white">Product Images</label>

                <MultiImagesUpload
                  selectedFiles={productImages}
                  setSelectedFiles={setProductImages}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full justify-center items-center gap-4 rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            disabled={createProductLoad ? true : false}
            style={createProductLoad ? { opacity: 0.5, cursor: "revert" } : {}}
          >
            <span>Create</span>
            {createProductLoad && <MoonLoader color="#fff" size={15} />}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreateProduct;
