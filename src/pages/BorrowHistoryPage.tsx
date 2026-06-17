import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BorrowService, { BorrowResponse } from '../services/BorrowService';
import { useAuth } from '../context/AuthContext';

// Spinner local (identique au composant original)
const SpinnerLoading = () => (
    <div className="container m-5 d-flex justify-content-center" style={{ height: 500 }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
        </div>
    </div>
);

export const BorrowHistoryPage = () => {
    const { isAuthenticated } = useAuth();
    const [borrows, setBorrows] = useState<BorrowResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [httpError, setHttpError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchHistory = async () => {
            try {
                const data = await BorrowService.getBorrowHistory();
                setBorrows(data);
            } catch (err: any) {
                setHttpError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    Connectez-vous pour voir votre historique.
                </div>
            </div>
        );
    }

    if (isLoading) return <SpinnerLoading />;
    if (httpError) return <div className="container mt-5 alert alert-danger">{httpError}</div>;

    return (
        <div className="container mt-5">
            <h2>📚 Historique complet des emprunts</h2>
            {borrows.length === 0 ? (
                <div className="alert alert-info">Aucun emprunt enregistré.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Livre</th>
                                <th>Date d'emprunt</th>
                                <th>Date de retour prévue</th>
                                <th>Date de retour réelle</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {borrows.map((borrow) => (
                                <tr key={borrow.id}>
                                    <td>{borrow.bookTitle}</td>
                                    <td>{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                                    <td>{new Date(borrow.dueDate).toLocaleDateString()}</td>
                                    <td>
                                        {borrow.returnDate
                                            ? new Date(borrow.returnDate).toLocaleDateString()
                                            : '-'}
                                    </td>
                                    <td>
                                        {borrow.status === 'ACTIVE' && (
                                            <span className="badge bg-success">En cours</span>
                                        )}
                                        {borrow.status === 'RETURNED' && (
                                            <span className="badge bg-secondary">Retourné</span>
                                        )}
                                        {borrow.status === 'OVERDUE' && (
                                            <span className="badge bg-danger">En retard</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="mt-3">
                <Link to="/my-borrows" className="btn btn-outline-primary me-2">
                    📖 Emprunts actifs
                </Link>
                <Link to="/profile" className="btn btn-outline-secondary">
                    👤 Mon profil
                </Link>
            </div>
        </div>
    );
};