// src/services/BorrowService.ts
import API_CONFIG from '../config/api';

export interface BorrowResponse {
    id: number;
    bookId: number;
    bookTitle: string;
    borrowDate: string;
    dueDate: string;
    returnDate?: string;
    status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
}

class BorrowService {
    private static instance: BorrowService;
    
    static getInstance(): BorrowService {
        if (!BorrowService.instance) {
            BorrowService.instance = new BorrowService();
        }
        return BorrowService.instance;
    }

    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    async checkAvailability(bookId: number): Promise<{ available: boolean; copiesAvailable: number }> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/books/${bookId}/availability`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Impossible de vérifier la disponibilité');
        }
        return response.json();
    }

    async borrowBook(bookId: number): Promise<BorrowResponse> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/borrow`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ bookId }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Emprunt impossible');
        }
        return response.json();
    }

    async returnBook(bookId: number): Promise<void> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/return/${bookId}`, {
            method: 'POST',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Retour impossible');
        }
    }

    async getActiveBorrows(): Promise<BorrowResponse[]> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/me/borrows/active`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Impossible de récupérer vos emprunts');
        }
        return response.json();
    }

    async getBorrowHistory(): Promise<BorrowResponse[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/me/borrows`, {
        headers: this.getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Impossible de récupérer l\'historique des emprunts');
    }
    return response.json();
    }


}

export default BorrowService.getInstance();