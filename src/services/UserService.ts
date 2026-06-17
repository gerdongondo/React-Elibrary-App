import API_CONFIG from '../config/api';

export interface UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
}

class UserService {
    private static instance: UserService;

    static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    async getProfile(): Promise<UserProfile> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/me`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors du chargement du profil');
        }
        return response.json();
    }

    async updateProfile(firstName: string, lastName: string): Promise<UserProfile> {
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/me`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ firstName, lastName }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
        }
        return response.json();
    }
}

export default UserService.getInstance();