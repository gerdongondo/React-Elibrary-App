import { useEffect, useState, useMemo } from "react";
import BookModel from "../../models/BookModels";
import { SpinnerLoading } from "../Utils/SpinnerLoading";
import { StarsReview } from "../Utils/StarsReview";
import { CheckoutAndReviewBox } from "./CheckoutAndReviewBox";
import ReviewModel from "../../models/ReviewModel";
import { LatestReviews } from "./LatestReviews";
import API_CONFIG from '../../config/api';
import { AddReview } from "../Utils/AddReview";
import { useAuth } from '../../context/AuthContext';

export const BookCheckoutPage = () => {
    const { isAuthenticated, user } = useAuth();

    const [book, setBook] = useState<BookModel>();
    const [isLoading, setIsLoading] = useState(true);
    const [httpError, setHttpError] = useState(null);

    const [reviews, setReviews] = useState<ReviewModel[]>([]);
    const [totalStars, setTotalStars] = useState(0);
    const [isLoadingReview, setIsLoadingReview] = useState(true);

    const bookId = (window.location.pathname).split('/')[2];
    const [reviewsKey, setReviewsKey] = useState(0);

    const handleReviewAdded = () => {
        setReviewsKey(prev => prev + 1);
    };

    const hasUserReviewed = useMemo(() => {
        if (!user?.email) return false;
        return reviews.some(review => review.userEmail === user.email);
    }, [reviews, user]);

    const openPdf = async () => {
        if (!book?.pdfUrl) {
            alert("Ce livre n'a pas encore de PDF associé.");
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Vous devez être connecté pour lire le PDF.");
            return;
        }
        const url = `${API_CONFIG.BASE_URL}/books/${book.id}/pdf`;
        const pdfWindow = window.open();
        if (!pdfWindow) {
            alert("Veuillez autoriser les popups pour ce site.");
            return;
        }
        pdfWindow.document.write('<p>Chargement du PDF...</p>');
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                pdfWindow.close();
                if (response.status === 404) alert("Fichier PDF introuvable.");
                else if (response.status === 403) alert("Vous n'avez pas l'autorisation de lire ce PDF.");
                else alert(`Erreur ${response.status} : impossible d'ouvrir le PDF.`);
                return;
            }
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            pdfWindow.location.href = blobUrl;
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } catch (error) {
            pdfWindow.close();
            console.error("Erreur lors de l'ouverture du PDF", error);
            alert("Erreur réseau. Vérifiez votre connexion.");
        }
    };

    useEffect(() => {
        const fetchBook = async () => {
            const baseUrl = `${API_CONFIG.BASE_URL}/books/${bookId}`;
            const response = await fetch(baseUrl);
            if (!response.ok) throw new Error('Something went wrong');
            const responseJson = await response.json();
            const loadedBook: BookModel = {
                id: responseJson.id,
                title: responseJson.title,
                author: responseJson.author,
                description: responseJson.description,
                copies: responseJson.copies,
                copiesAvailable: responseJson.copiesAvailable,
                category: responseJson.category,
                img: responseJson.img,
                pdfUrl: responseJson.pdfUrl,
            };
            setBook(loadedBook);
            setIsLoading(false);
        };
        fetchBook().catch((error: any) => {
            setIsLoading(false);
            setHttpError(error.message);
        });
    }, [bookId]);

    useEffect(() => {
        const fetchBookReviews = async () => {
            const reviewUrl = `${API_CONFIG.BASE_URL}/reviews/search/findByBookId?bookId=${bookId}`;
            const responseReviews = await fetch(reviewUrl);
            if (!responseReviews.ok) throw new Error('Something went wrong');
            const responseJsonReviews = await responseReviews.json();
            let responseData;
            if (responseJsonReviews._embedded?.reviews) {
                responseData = responseJsonReviews._embedded.reviews;
            } else if (Array.isArray(responseJsonReviews)) {
                responseData = responseJsonReviews;
            } else if (responseJsonReviews.content) {
                responseData = responseJsonReviews.content;
            } else {
                responseData = [];
            }
            const loadedReviews: ReviewModel[] = [];
            let weightedStarReviews = 0;
            for (const key in responseData) {
                loadedReviews.push({
                    id: responseData[key].id,
                    userEmail: responseData[key].userEmail,
                    date: responseData[key].date,
                    rating: responseData[key].rating,
                    book_id: responseData[key].bookId,
                    reviewDescription: responseData[key].reviewDescription,
                });
                weightedStarReviews += responseData[key].rating;
            }
            if (loadedReviews.length > 0) {
                const round = (Math.round((weightedStarReviews / loadedReviews.length) * 2) / 2).toFixed(1);
                setTotalStars(Number(round));
            } else {
                setTotalStars(0);
            }
            setReviews(loadedReviews);
            setIsLoadingReview(false);
        };
        fetchBookReviews().catch((error: any) => {
            setIsLoadingReview(false);
            setHttpError(error.message);
        });
    }, [bookId, reviewsKey]);

    if (isLoading || isLoadingReview) return <SpinnerLoading />;
    if (httpError) return <div className="container m-5"><p>{httpError}</p></div>;

    // ✅ Fonction pour obtenir la source de l'image
    const getImageSrc = (): string => {
        if (!book) return '';
        // Cas 1 : L'image est stockée en BLOB (déjà en base64)
        if (book.img && typeof book.img === 'string' && book.img.startsWith('data:image')) {
            return book.img;
        }
        // Cas 2 : L'image est stockée comme chemin de fichier, on utilise l'endpoint
        return `${API_CONFIG.BASE_URL}/books/${book.id}/image?t=${Date.now()}`;
    };

    // Image par défaut (fallback)
    const defaultImage = require('./../../Images/BooksImages/book-luv2code-1000.png');

    return (
        <div>
            {/* Desktop */}
            <div className='container d-none d-lg-block'>
                <div className='row mt-5'>
                    <div className='col-sm-2 col-md-2'>
                        <img 
                            src={getImageSrc()}
                            width='226' height='349' 
                            alt={book?.title}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = defaultImage;
                            }}
                        />
                    </div>
                    <div className='col-4 col-md-4 container'>
                        <div className='ml-2'>
                            <h2>{book?.title}</h2>
                            <h5 className='text-primary'>{book?.author}</h5>
                            <p className='lead'>{book?.description}</p>
                            <StarsReview rating={totalStars} size={32} />
                            {isAuthenticated && book?.pdfUrl && (
                                <div className="mt-3">
                                    <button className="btn btn-info" onClick={openPdf}>
                                        📖 Lire le livre
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <CheckoutAndReviewBox book={book} mobile={false} />
                </div>
                <hr />
                <LatestReviews reviews={reviews} bookId={book?.id} mobile={false} />
                {isAuthenticated && !isLoadingReview && !hasUserReviewed && (
                    <AddReview bookId={book?.id} onReviewAdded={handleReviewAdded} />
                )}
                {isAuthenticated && !isLoadingReview && hasUserReviewed && (
                    <div className="alert alert-info mt-3">
                        Vous avez déjà laissé un avis pour ce livre. Merci !
                    </div>
                )}
            </div>

            {/* Mobile */}
            <div className='container d-lg-none mt-5'>
                <div className='d-flex justify-content-center align-items-center'>
                    <img 
                        src={getImageSrc()}
                        width='226' height='349' 
                        alt={book?.title}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultImage;
                        }}
                    />
                </div>
                <div className='mt-4'>
                    <div className='ml-2'>
                        <h2>{book?.title}</h2>
                        <h5 className='text-primary'>{book?.author}</h5>
                        <p className='lead'>{book?.description}</p>
                        <StarsReview rating={totalStars} size={32} />
                        {isAuthenticated && book?.pdfUrl && (
                            <div className="mt-3">
                                <button className="btn btn-info" onClick={openPdf}>
                                    📖 Lire le livre
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <CheckoutAndReviewBox book={book} mobile={true} />
                <hr />
                <LatestReviews reviews={reviews} bookId={book?.id} mobile={true} />
                {isAuthenticated && !isLoadingReview && !hasUserReviewed && (
                    <AddReview bookId={book?.id} onReviewAdded={handleReviewAdded} />
                )}
                {isAuthenticated && !isLoadingReview && hasUserReviewed && (
                    <div className="alert alert-info mt-3">
                        Vous avez déjà laissé un avis pour ce livre. Merci !
                    </div>
                )}
            </div>
        </div>
    );
};