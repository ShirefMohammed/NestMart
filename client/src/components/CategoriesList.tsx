import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { GetCategoriesResponse } from "@shared/types/apiTypes";
import { Category } from "@shared/types/entitiesTypes";

import { categoriesAPI } from "../api/categoriesAPI";
import { useHandleErrors } from "../hooks";

const CategoriesList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchCategoriesLoad, setFetchCategoriesLoad] = useState<boolean>(false);
  const handleErrors = useHandleErrors();

  const fetchCategories = async () => {
    try {
      setFetchCategoriesLoad(true);

      const res = await categoriesAPI.getCategories(1, 5, "new");

      const data: GetCategoriesResponse = res.data.data;

      setCategories(data.categories);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchCategoriesLoad(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="w-full p-5 rounded-md shadow-md border border-slate-200">
      <h3 className="pb-3 mb-4 border-b border-slate-200 font-bold text-lg">Categories</h3>

      {!fetchCategoriesLoad ? (
        <ul className="flex flex-col gap-3">
          {categories.map((category: Category) => (
            <li key={category._id}>
              <Link
                to={`/categories/${category._id}/products`}
                className="p-2 rounded-md border border-slate-200 flex items-center gap-3 hover:underline"
              >
                <img src={category.image} alt="" loading="lazy" className="w-8 h-8 object-cover rounded-sm" />
                <span className="text-sm">{category.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        "loading ..."
      )}
    </div>
  );
};

export default CategoriesList;
