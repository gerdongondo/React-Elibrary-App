
export const LibraryServices=()=>{
 
    return(
      <div className='container my-5'>
            <div className='row p-4 align-items-center border shadow-lg'>
                <div className='col-lg-7 p-3'>
                    <h1 className='display-4 fw-bold'>
                    Vous ne trouvez pas ce que vous cherchez ?
                    </h1>
                    <p className='lead'>
                    Si vous ne trouvez pas ce que vous cherchez, envoyez un message 
                    personnel à nos administrateurs de la bibliothèque !
                     </p>
                     <div className='d-grid gap-2 justify-content-md-start mb-4 mb-lg-3'>
                            <a className='btn main-color btn-lg text-white' href="#">
                               Se connecter    
                            </a>
                     </div>
                </div>

                <div className='col-lg-4 offset-lg-1 shadow-lg lost-impage'>

                </div>
            </div>

      </div>

    );

}