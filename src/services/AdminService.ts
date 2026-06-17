// src/services/AdminService.ts
import API_CONFIG from '../config/api';

export interface BookAdmin {
    id: number;
    title: string;
    author: string;
    description: string;
    copies: number;
    copiesAvailable: number;
    category: string;
    img?: string;
}

export interface UserAdmin {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles?: string[];   // optionnel (compatibilité)
    role?: string;      // nouveau champ pour l'API actuelle
    active: boolean;
}

export interface BorrowAdmin {
    id: number;
    userId: number;
    userEmail: string;
    bookId: number;
    bookTitle: string;
    borrowDate: string;
    dueDate: string;
    returnDate?: string;
    status: string;
}

export interface StatsBorrows {
    totalBorrows: number;
    activeBorrows: number;
    overdueBorrows: number;
    returnedBorrows: number;
}

class AdminService {
    private static instance: AdminService;

    static getInstance(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }

    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }



   
    // ========== Statistiques ==========
    async getStatsBorrows(): Promise<StatsBorrows> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/stats/borrows`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Impossible de récupérer les statistiques');
        return response.json();
    }

    // ========== Gestion des livres ==========
    async getAllBooks(page = 0, size = 10): Promise<{ content: BookAdmin[]; totalPages: number; totalElements: number }> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/books?page=${page}&size=${size}`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Impossible de récupérer les livres');
        return response.json();
    }

    async addBook(bookData: FormData): Promise<BookAdmin> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/books`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                // Ne pas mettre Content-Type, laisser le navigateur le définir avec boundary pour FormData
            },
            body: bookData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de l\'ajout du livre');
        }
        return response.json();
    }

    async updateBook(id: number, bookData: FormData): Promise<BookAdmin> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/books/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: bookData,
        });
        if (!response.ok) throw new Error('Erreur lors de la modification');
        return response.json();
    }

    async deleteBook(id: number): Promise<void> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/books/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Suppression impossible');
    }

    // ========== Gestion des utilisateurs ==========
    async getAllUsers(page = 0, size = 10): Promise<{ content: UserAdmin[]; totalPages: number; totalElements: number }> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users?page=${page}&size=${size}`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Impossible de récupérer les utilisateurs');
        return response.json();
    }

    async updateUserRole(userId: number, role: string): Promise<void> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ role }),
        });
        if (!response.ok) throw new Error('Impossible de modifier le rôle');
    }

    async activateUser(userId: number, active: boolean): Promise<void> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users/${userId}/activate?active=${active}`, {
            method: 'PUT',
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Impossible de modifier l\'état de l\'utilisateur');
    }

    // ========== Gestion des emprunts (admin) ==========
    async getAllBorrows(page = 0, size = 10, status?: string): Promise<{ content: BorrowAdmin[]; totalPages: number; totalElements: number }> {
        let url = `${API_CONFIG.BASE_URL}/admin/borrows?page=${page}&size=${size}`;
        if (status) url += `&status=${status}`;
        const response = await fetch(url, { headers: this.getHeaders() });
        if (!response.ok) throw new Error('Impossible de récupérer les emprunts');
        return response.json();
    }

    async extendBorrow(borrowId: number): Promise<void> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/borrows/${borrowId}/extend`, {
            method: 'PUT',
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Impossible de prolonger l\'emprunt');
    }

    async cancelBorrow(borrowId: number): Promise<void> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/borrows/${borrowId}/cancel`, {
            method: 'PUT',
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Impossible d\'annuler l\'emprunt');
    }

    
}

export default AdminService.getInstance();