import { Link } from "react-router-dom";
import BookModel from "../../../../models/BookModels";
import API_CONFIG from "../../../../config/api";

export const SearchBook: React.FC<{ book: BookModel }> = (props) => {
    const defaultImage = require('../../../../Images/BooksImages/book-luv2code-1000.png');
    
    // Fonction pour obtenir la source de l'image
    const getImageSrc = (): string => {
        // Cas 1 : L'image est stockée en BLOB (déjà en base64)
        if (props.book.img && typeof props.book.img === 'string' && props.book.img.startsWith('data:image')) {
            return props.book.img;
        }
        // Cas 2 : L'image est stockée comme chemin de fichier, on utilise l'endpoint
        return `${API_CONFIG.BASE_URL}/books/${props.book.id}/image?t=${Date.now()}`;
    };

    return (
        <div className="card mt-3 shadow p-3 mb-3 bg-body rounded">
            <div className='row g-0'>
                <div className='col-md-2'>
                    {/* Version desktop */}
                    <div className='d-none d-lg-block'>
                        <img 
                            src={getImageSrc()}
                            width='123' height='196'
                            alt='Book'
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = defaultImage;
                            }}
                        />
                    </div>
                    {/* Version mobile */}
                    <div className='d-lg-none d-flex justify-content-center align-items-center'>
                        <img 
                            src={getImageSrc()}
                            width='123' height='196'
                            alt='Book'
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = defaultImage;
                            }}
                        />
                    </div>
                </div>
                <div className='col-md-6'>
                    <div className='card-body'>
                        <h5 className='card-title'>{props.book.author}</h5>
                        <h4>{props.book.title}</h4>
                        <p className='card-text'>{props.book.description}</p>
                    </div>
                </div>
                <div className='col-md-4 d-flex justify-content-center align-items-center'>
                    <Link className='btn btn-md main-color text-white' to={`/checkout/${props.book.id}`}>
                        Voir les Détails
                    </Link>
                </div>
            </div>
        </div>
    );
};