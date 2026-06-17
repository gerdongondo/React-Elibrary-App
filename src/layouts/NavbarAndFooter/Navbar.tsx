import { useAuth } from '../../context/AuthContext'; 
import { Link, NavLink, useHistory } from 'react-router-dom';

export const Navbar = () => {
    // ✅ AJOUTER isAdmin DANS LA DESTRUCTURATION
    const { isAuthenticated, user, logout, isAdmin } = useAuth();
    const history = useHistory();

    const handleLogout = () => {
        logout();
        history.push('/home');
    };

    return (
        <nav className='navbar navbar-expand-lg navbar-dark main-color py-3'>
            <div className='container-fluid'>
                <span className='navbar-brand'>Niit Library</span>
                <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarNavDropdown'>
                    <span className='navbar-toggler-icon'></span>
                </button>

                <div className='collapse navbar-collapse' id='navbarNavDropdown'>
                    <ul className='navbar-nav'>
                        <li className='nav-item'>
                            <NavLink className='nav-link' to='/home'>Accueil</NavLink>
                        </li>
                        <li className='nav-item'>
                            <NavLink className='nav-link' to='/search'>Recherche Livres</NavLink>
                        </li>
                        {isAuthenticated && (
                            <li className='nav-item'>
                                <NavLink className='nav-link' to='/my-borrows'>Mes Emprunts</NavLink>
                            </li>
                        )}
                    </ul>
                    
                    <ul className='navbar-nav ms-auto'>
                        {!isAuthenticated ? (
                            <li className='nav-item m-1'>
                                <Link className='btn btn-outline-light' to='/login'>Se connecter</Link>
                            </li>
                        ) : (
                            <>
                                <li className='nav-item dropdown'>
                                    <button className='btn btn-outline-light dropdown-toggle' data-bs-toggle='dropdown'>
                                        {user?.email}
                                    </button>
                                    <ul className='dropdown-menu dropdown-menu-end'>
                                        <li><Link className='dropdown-item' to='/profile'>Mon Profil</Link></li>
                                        <li><Link className='dropdown-item' to='/my-borrows'>Mes Emprunts (actifs)</Link></li>
                                        <li><Link className='dropdown-item' to='/borrow-history'>📜 Historique complet</Link></li>
                                        {/* ✅ LIEN VERS L'ADMINISTRATION (UNIQUEMENT P LES ADMIN) */}
                                        {isAdmin && (
                                            <li><Link className='dropdown-item' to='/admin'>⚙️ Administration</Link></li>
                                        )}
                                        <li><hr className='dropdown-divider' /></li>
                                        <li><button className='dropdown-item' onClick={handleLogout}>Déconnexion</button></li>
                                    </ul>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};