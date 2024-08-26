import { useState } from "react";
import { MoonLoader } from "react-spinners";

import { CreateCategoryResponse } from "@shared/types/apiTypes";
import { Category } from "@shared/types/entitiesTypes";

import { categoriesAPI } from "../../../api/categoriesAPI";
import { useNotify } from "../../../hooks";

const CreateCategory = ({ setCategories, setOpenCreateCategory }) => {
  const [categoryTitle, setCategoryTitle] = useState<string>("");
  const [categoryImage, setCategoryImage] = useState<Blob>();
  const [createCategoryLoad, setCreateCategoryLoad] = useState<boolean>(false);
  const notify = useNotify();

  const createCategory = async () => {
    try {
      setCreateCategoryLoad(true);

      const formData = new FormData();
      formData.append("title", categoryTitle);
      if (categoryImage) formData.append("image", categoryImage);

      const res = await categoriesAPI.createCategory(formData);

      const data: CreateCategoryResponse = res.data.data;

      const newCategory: Category = data.newCategory;

      setCategories((prev: Category[]) => [newCategory, ...prev]);

      notify("success", res.data?.message);

      setOpenCreateCategory(false);
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Create category fail!");
      }
    } finally {
      setCreateCategoryLoad(false);
    }
  };

  return (
    <section className="py-14 px-4 md:px-6 2xl:px-20 2xl:container 2xl:mx-auto text-body bg-whiten dark:bg-boxdark-2 dark:text-bodydark relative top-2/4 -translate-y-1/2">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-fit sm:w-100">
        <header className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h2 className="font-bold text-black dark:text-white">Create Category</h2>
        </header>

        <form
          className="flex flex-col gap-5.5 p-6.5"
          onSubmit={(e) => {
            e.preventDefault();
            createCategory();
          }}
        >
          <div>
            <label htmlFor="title" className="mb-3 block text-black dark:text-white">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Category Title"
              value={categoryTitle}
              onChange={(e) => setCategoryTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="image" className="mb-3 block text-black dark:text-white">
              Image
            </label>
            <input
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
              type="file"
              name="image"
              id="image"
              accept=".jpeg, .jpg, .png, .jfif"
              multiple={false}
              onChange={(e) => {
                if (e.target.files) setCategoryImage(e.target.files[0]);
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="flex w-full justify-center items-center gap-4 rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            disabled={createCategoryLoad ? true : false}
            style={createCategoryLoad ? { opacity: 0.5, cursor: "revert" } : {}}
          >
            <span>Create</span>
            {createCategoryLoad && <MoonLoader color="#fff" size={15} />}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreateCategory;
