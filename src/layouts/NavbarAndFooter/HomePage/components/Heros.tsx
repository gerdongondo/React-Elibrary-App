export const Heros =()=>{

    return (

        <div>
           <div className='d-none d-lg-block'>
           <div className='row g-0 mt-5'>
            <div className='col-sm-6 col-md-6'> 
                 <div className='col-image-left'>  </div>
            </div>     
           
           <div className='col-4 col-md-4 container d-flex justify-content-center align-items-center'>
              <div className='ml-2'>
                        <h1>Qu'avez-vous lu récemment ?</h1>
                        <p className='lead'>
                        L'équipe de la bibliothèque aimerait savoir ce que vous avez lu. Que ce soit pour apprendre une nouvelle 
                        compétence ou pour progresser dans un domaine, nous serons en mesure de vous fournir les meilleurs 
                        contenus !
                         </p>
                         <a className='btn main-color btn-lg text-white' href="#">Se connecter</a>
              </div>
           </div>
        </div>
          <div className='row g-0'>  
             <div className='col-4 col-md-4 container d-flex 
             justify-content-center align-items-center  '>
                <div className='ml-2'>
                   <h1>Notre collection évolue toujours !</h1>
                    <p className='lead'>
                    Essayez de vous connecter quotidiennement car notre collection évolue toujours ! 
                    Nous travaillons sans relâche pour offrir la sélection de livres la plus précise 
                    possible à nos étudiants de Niit. Nous sommes assidus dans le choix de nos livres, 
                    et ces derniers seront toujours notre priorité absolue.
                     </p>
                </div>
             </div>
                <div className='col-sm-6 col-md-6'>
                    <div className='col-image-right'> </div>
                </div>
          </div>
        </div>


           {/* Mobile Heros */}
           <div className='d-lg-none'>
            <div className='container'>
              <div className='m-2'>
                <div className='col-image-left'> </div>
                <div className='mt-2'>
                <h1>Qu'avez-vous lu récemment ?</h1>
                        <p className='lead'>
                        L'équipe de la bibliothèque aimerait savoir ce que vous avez lu. 
                        Que ce soit pour apprendre une nouvelle compétence ou progresser dans un domaine, 
                        nous serons en mesure de vous fournir les meilleurs contenus !
                         </p>
                         <a className='btn main-color btn-lg text-white' href="#">Se connecter</a>   
                </div>
              </div> 
             <div className='m-2'>
               <div className='col-image-right'> </div>
                <div className='mt-2'> </div>    
                <h1>Notre collection est toujours en évolution !</h1>
                    <p className='lead'>
                    Essayez de vous connecter quotidiennement car notre collection est toujours en évolution !
                     Nous travaillons sans relâche pour offrir la sélection de livres la plus précise possible 
                     pour nos étudiants de Niit. Nous sommes assidus dans le choix de nos livres et ils seront 
                     toujours notre priorité absolue.
                     </p>

             </div> 
            </div>
           </div>
        </div>       
        
    )
}