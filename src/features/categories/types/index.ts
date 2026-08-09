// ── Categories ──

export interface Category {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface CreateCategoryRequest {
  name: string
}

export interface CategoryResponse {
  category: Category
}

export interface CategoryListResponse {
  categories: Category[]
}
