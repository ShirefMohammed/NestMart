import { Category } from "@shared/types/entitiesTypes";

export interface CategoriesDao {
  findCategoryById(categoryId: number, selectedFields?: string): Promise<any>;

  findCategoryByTitle(title: string, selectedFields?: string): Promise<any>;

  createCategory(category: Partial<Category>): Promise<any>;

  updateCategory(categoryId: number, category: Partial<Category>): Promise<any>;

  deleteCategory(categoryId: number): Promise<void>;

  getCategories(
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any[]>;

  searchCategories(
    searchKey: string,
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any[]>;

  getCategoryProducts(
    categoryId: number,
    order?: number,
    limit?: number,
    skip?: number,
  ): Promise<any[]>;
}
