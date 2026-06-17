import { useState } from 'react';
import { StarsReview } from './StarsReview';
import ReviewService from '../../services/ReviewService';

export const AddReview: React.FC<{ bookId: number | undefined; onReviewAdded: () => void }> = (props) => {
    const [rating, setRating] = useState(0);
    const [reviewDescription, setReviewDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleRatingClick = (selectedRating: number) => {
        setRating(selectedRating);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Veuillez sélectionner une note");
            return;
        }
        if (!props.bookId) return;

        setIsSubmitting(true);
        setError(null);
        try {
            await ReviewService.addReview({
                bookId: props.bookId,
                rating,
                reviewDescription,
            });
            setSuccess(true);
            setRating(0);
            setReviewDescription('');
            // Rafraîchir la liste des avis
            props.onReviewAdded();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card mt-4">
            <div className="card-body">
                <h5 className="card-title">Donnez votre avis</h5>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">Merci pour votre avis !</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Note (étoiles)</label>
                        <div>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="btn btn-link p-0 me-1"
                                    onClick={() => handleRatingClick(star)}
                                    style={{ fontSize: '1.8rem', lineHeight: 1, textDecoration: 'none' }}
                                >
                                    <span style={{ color: star <= rating ? 'gold' : 'gray' }}>★</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Votre commentaire</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={reviewDescription}
                            onChange={(e) => setReviewDescription(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Envoi en cours...' : 'Publier l\'avis'}
                    </button>
                </form>
            </div>
        </div>
    );
};