import API_CONFIG from '../config/api';

export interface Category {
    id: number;
    name: string;
    active: boolean;
}

class CategoryService {
    private static instance: CategoryService;

    static getInstance(): CategoryService {
        if (!CategoryService.instance) {
            CategoryService.instance = new CategoryService();
        }
        return CategoryService.instance;
    }

    async getActiveCategories(): Promise<Category[]> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/categories`);
        if (!response.ok) {
            throw new Error('Impossible de récupérer les catégories');
        }
        return response.json();
    }
}

export default CategoryService.getInstance();