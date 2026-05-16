import type { HttpClient } from "../lib/http-client";
import type { CreateProductParams, Product, ProductListResult, ListProductsParams } from "../types";

export class Products {
	constructor(private readonly http: HttpClient) {}

	async create(params: CreateProductParams): Promise<Product> {
		return this.http.post<Product>("/products", params);
	}

	async retrieve(id: string): Promise<Product> {
		return this.http.get<Product>(`/products/${id}`);
	}

	async list(params?: ListProductsParams): Promise<ProductListResult> {
		return this.http.get<ProductListResult>("/products", params as Record<string, string | number | boolean | undefined>);
	}
}
