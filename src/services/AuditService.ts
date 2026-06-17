// src/services/AuditService.ts
import API_CONFIG from '../config/api';

export interface AuditLog {
    id: number;
    action: string;
    details: string;
    userEmail: string;
    ipAddress: string;
    timestamp: string;
}

export interface ActionType {
    name: string;
    description?: string;
}

class AuditService {
    private static instance: AuditService;

    static getInstance(): AuditService {
        if (!AuditService.instance) {
            AuditService.instance = new AuditService();
        }
        return AuditService.instance;
    }

    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    async getLogs(page = 0, size = 20, filters?: { action?: string; userEmail?: string; from?: string; to?: string }): Promise<{ content: AuditLog[]; totalPages: number; totalElements: number }> {
        let url = `${API_CONFIG.BASE_URL}/admin/audit/logs?page=${page}&size=${size}`;
        if (filters?.action) url += `&action=${encodeURIComponent(filters.action)}`;
        if (filters?.userEmail) url += `&userEmail=${encodeURIComponent(filters.userEmail)}`;
        if (filters?.from) url += `&from=${filters.from}`;
        if (filters?.to) url += `&to=${filters.to}`;
        const response = await fetch(url, { headers: this.getHeaders() });
        if (!response.ok) throw new Error('Impossible de récupérer les logs');
        return response.json();
    }

    async getActionTypes(): Promise<ActionType[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/audit/actions/types`, { headers: this.getHeaders() });
    if (!response.ok) throw new Error('Impossible de récupérer les types d\'actions');
    const data = await response.json();
    // La réponse est un objet { count: ..., actionTypes: [...] }
    if (data.actionTypes && Array.isArray(data.actionTypes)) {
        return data.actionTypes.map((item: any) => ({ name: item.name || item }));
    }
    // Fallback si la réponse est directement un tableau
    return Array.isArray(data) ? data : [];
 }
}

export default AuditService.getInstance();