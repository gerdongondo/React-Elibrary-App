import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import BookModel from "../../models/BookModels";
import BorrowService from "../../services/BorrowService";
import { useAuth } from "../../context/AuthContext";

export const CheckoutAndReviewBox: React.FC<{ book: BookModel | undefined, mobile: boolean }> = (props) => {
    const { isAuthenticated } = useAuth();
    const [borrowing, setBorrowing] = useState(false);
    const [borrowError, setBorrowError] = useState<string | null>(null);
    const [borrowSuccess, setBorrowSuccess] = useState(false);
    const [activeBorrowsCount, setActiveBorrowsCount] = useState<number | null>(null);

    // Récupérer le nombre d'emprunts actifs de l'utilisateur
    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchActiveBorrows = async () => {
            try {
                const borrows = await BorrowService.getActiveBorrows();
                setActiveBorrowsCount(borrows.length);
            } catch (error) {
                console.error("Erreur chargement emprunts actifs", error);
                setActiveBorrowsCount(null);
            }
        };
        fetchActiveBorrows();
    }, [isAuthenticated]);

    const handleBorrow = async () => {
        if (!props.book?.id) return;
        setBorrowing(true);
        setBorrowError(null);
        try {
            await BorrowService.borrowBook(props.book.id);
            setBorrowSuccess(true);
            // Mettre à jour le compteur local après emprunt
            if (activeBorrowsCount !== null) setActiveBorrowsCount(activeBorrowsCount + 1);
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            setBorrowError(err.message);
        } finally {
            setBorrowing(false);
        }
    };

    return (
        <div className={props.mobile ? 'card d-flex mt-5' : 'card col-3 container d-flex mb-5'}>
            <div className='card-body container'>
                <div className='mt-3'>
                    <p><b>{activeBorrowsCount !== null ? activeBorrowsCount : '?'}/5</b> livres empruntés</p>
                    <hr />
                    {props.book && props.book.copiesAvailable && props.book.copiesAvailable > 0 ? (
                        <h4 className='text-success'>Disponible</h4>
                    ) : (
                        <h4 className='text-danger'>Liste d'attente</h4>
                    )}
                    <div className='row'>
                        <p className='col-6 lead'><b>{props.book?.copies}</b> exemplaires</p>
                        <p className='col-6 lead'><b>{props.book?.copiesAvailable}</b> disponible</p>
                    </div>
                </div>

                {!isAuthenticated ? (
                    <Link to='/login' className='btn btn-success btn-lg'>Se connecter pour emprunter</Link>
                ) : borrowSuccess ? (
                    <div className="alert alert-success mt-3">Livre emprunté avec succès !</div>
                ) : (
                    <button 
                        className='btn btn-success btn-lg' 
                        onClick={handleBorrow}
                        disabled={borrowing || props.book?.copiesAvailable === 0}
                    >
                        {borrowing ? 'Emprunt en cours...' : 'Réserver'}
                    </button>
                )}

                {borrowError && <div className="alert alert-danger mt-3">{borrowError}</div>}

                <hr />
                <p className='mt-3'>Ce nombre peut changer jusqu'à ce que la commande soit complétée.</p>
                <p>{!isAuthenticated ? 'Connectez-vous pour pouvoir laisser un avis.' : 'Laissez un avis sur ce livre.'}</p>
            </div>
        </div>
    );
};