// src/pages/MyBorrowsPage.tsx
import { useEffect, useState } from "react";
import BorrowService, { BorrowResponse } from "../services/BorrowService";
import { Link } from "react-router-dom";

// Composant de chargement local
const SpinnerLoading = () => (
    <div className='container m-5 d-flex justify-content-center' style={{ height: 500 }}>
        <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Chargement...</span>
        </div>
    </div>
);

export const MyBorrowsPage = () => {
    const [borrows, setBorrows] = useState<BorrowResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [httpError, setHttpError] = useState<string | null>(null);
    const [returningBookId, setReturningBookId] = useState<number | null>(null);

    useEffect(() => {
        const fetchBorrows = async () => {
            try {
                const data = await BorrowService.getActiveBorrows();
                setBorrows(data);
            } catch (err: any) {
                setHttpError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBorrows();
    }, []);

    const handleReturn = async (bookId: number) => {
        setReturningBookId(bookId);
        try {
            await BorrowService.returnBook(bookId);
            setBorrows(prev => prev.filter(b => b.bookId !== bookId));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setReturningBookId(null);
        }
    };

    if (isLoading) return <SpinnerLoading />;
    if (httpError) return <div className="container m-5"><p>{httpError}</p></div>;

    return (
        <div className="container mt-5">
            <h2>Mes emprunts en cours</h2>
            {borrows.length === 0 ? (
                <div className="alert alert-info mt-4">
                    Vous n'avez aucun emprunt actif. <Link to="/search">Parcourir les livres</Link>
                </div>
            ) : (
                <div className="row mt-4">
                    {borrows.map(borrow => (
                        <div key={borrow.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{borrow.bookTitle}</h5>
                                    <p className="card-text">
                                        <strong>Emprunté le :</strong> {new Date(borrow.borrowDate).toLocaleDateString()}<br />
                                        <strong>À rendre pour le :</strong> {new Date(borrow.dueDate).toLocaleDateString()}
                                    </p>
                                    <button 
                                        className="btn btn-danger"
                                        onClick={() => handleReturn(borrow.bookId)}
                                        disabled={returningBookId === borrow.bookId}
                                    >
                                        {returningBookId === borrow.bookId ? 'Retour en cours...' : 'Retourner'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};