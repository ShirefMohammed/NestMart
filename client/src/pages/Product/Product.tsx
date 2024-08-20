import { useParams } from "react-router-dom";
import { BannerOne, CategoriesList, NewProductsList } from "../../components";
import ProductDetails from "./components/ProductDetails";
import RelatedProductsList from "./components/RelatedProductsList";
import { useEffect, useState } from "react";
import { Product as ProductType } from "@shared/types/entitiesTypes";
import { useHandleErrors } from "../../hooks";
import { productsAPI } from "../../api/productsAPI";
import { GetProductResponse } from "@shared/types/apiTypes";

const Product = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<ProductType>();
  const [fetchProductsLoad, setFetchProductsLoad] = useState<boolean>(false);
  const handleErrors = useHandleErrors();

  const fetchProduct = async () => {
    try {
      if (!productId) return;

      setFetchProductsLoad(true);

      const res = await productsAPI.getProduct(+productId);

      const data: GetProductResponse = res.data.data;

      setProduct(data.product);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchProductsLoad(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  return (
    <section className="flex flex-col gap-8">
      {/* Top */}

      <div className="flex gap-4">
        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-6">
          <ProductDetails product={product} fetchProductsLoad={fetchProductsLoad} />

          <RelatedProductsList product={product} />
        </div>

        {/* Right Side */}
        <div className="hidden xl:flex w-60 flex-col gap-5">
          <CategoriesList />

          <NewProductsList />
        </div>
      </div>

      {/* Bottom */}

      {/* Banner One */}
      <BannerOne />
    </section>
  );
};

export default Product;
