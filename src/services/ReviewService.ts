import API_CONFIG from '../config/api';

export interface ReviewRequest {
    bookId: number;
    rating: number;
    reviewDescription: string;
}

export interface ReviewResponse {
    id: number;
    userEmail: string;
    date: string;
    rating: number;
    bookId: number;
    reviewDescription: string;
}

class ReviewService {
    private static instance: ReviewService;

    static getInstance(): ReviewService {
        if (!ReviewService.instance) {
            ReviewService.instance = new ReviewService();
        }
        return ReviewService.instance;
    }

    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    async addReview(reviewData: ReviewRequest): Promise<ReviewResponse> {
        // ⚠️ Adaptez l'URL selon votre backend (si vous avez un endpoint POST /api/reviews)
        const response = await fetch(`${API_CONFIG.BASE_URL}/reviews`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(reviewData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Erreur lors de l'ajout de l'avis");
        }
        return response.json();
    }
}

export default ReviewService.getInstance();