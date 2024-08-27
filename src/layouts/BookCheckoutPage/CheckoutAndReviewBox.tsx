import { Link } from "react-router-dom";
import BookModel from "../../models/BookModels";


export const CheckoutAndReviewBox: React.FC<{ book: BookModel | undefined, mobile: boolean, }> = (props) => {
    return (
        <div className={props.mobile ? 'card d-flex mt-5' : 'card col-3 container d-flex mb-5'}>
            <div className='card-body container'>
                <div className='mt-3'>
                    <p>
                        <b>0/5 </b>
                        livres empruntés
                    </p>
                    <hr />
                    {props.book && props.book.copiesAvailable && props.book.copiesAvailable > 0 ?
                        <h4 className='text-success'>
                           Disponible
                        </h4>
                        :
                        <h4 className='text-danger'>
                           Liste D'attente
                        </h4>
                    }
                    <div className='row'>
                        <p className='col-6 lead'>
                            <b>{props.book?.copies} </b>
                            exemplaires
                        </p>
                        <p className='col-6 lead'>
                            <b>{props.book?.copiesAvailable} </b>
                            disponible
                        </p>
                    </div>
                </div>
                <Link to='/#' className='btn btn-success btn-lg'>Se connecter</Link>
                <hr />
                <p className='mt-3'>
                    Ce nombre peut changer jusqu'à ce que la commande soit complétée.
                </p>
                <p>
                    Connectez-vous pour pouvoir laisser un avis.
                </p>
            </div>
        </div>
    );
}