import API_CONFIG from '../config/api';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Redirect } from 'react-router-dom';
import AdminService, { BookAdmin, UserAdmin, BorrowAdmin, StatsBorrows } from '../services/AdminService';
import { AuditLogs } from '../pages/AuditLogs';


const SpinnerLoading = () => (
    <div className="container m-5 d-flex justify-content-center" style={{ height: 500 }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
        </div>
    </div>
);

export const AdminDashboard = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    // États
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState<StatsBorrows | null>(null);
    const [books, setBooks] = useState<BookAdmin[]>([]);
    const [users, setUsers] = useState<UserAdmin[]>([]);
    const [borrows, setBorrows] = useState<BorrowAdmin[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [editingBook, setEditingBook] = useState<BookAdmin | null>(null);

    // === Fonctions de chargement ===
    const loadBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdminService.getAllBooks(page, 10);
            setBooks(Array.isArray(data.content) ? data.content : []);
            setTotalPages(data.totalPages ?? 0);
        } catch (err: any) {
            console.warn("Erreur chargement livres:", err.message);
            setError("⚠️ Impossible de récupérer les livres (endpoint admin non disponible)");
            setBooks([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdminService.getAllUsers(page, 10);
            console.log("📋 Utilisateurs chargés :", data.content.map(u => ({ id: u.id, active: u.active, roles: u.roles })));
            setUsers(Array.isArray(data.content) ? data.content : []);
            setTotalPages(data.totalPages ?? 0);
        } catch (err: any) {
            console.warn("Erreur chargement utilisateurs:", err.message);
            setError("⚠️ Impossible de récupérer les utilisateurs (endpoint admin non disponible)");
            setUsers([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const loadBorrows = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdminService.getAllBorrows(page, 10);
            setBorrows(Array.isArray(data.content) ? data.content : []);
            setTotalPages(data.totalPages ?? 0);
        } catch (err: any) {
            console.warn("Erreur chargement emprunts:", err.message);
            setError("⚠️ Impossible de récupérer les emprunts (endpoint admin non disponible)");
            setBorrows([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fonction pour obtenir la source de l'image (supporte BLOB et chemin de fichier)
    const getImageSrc = (book: BookAdmin): string => {
        // Cas 1 : L'image est stockée en BLOB (déjà en base64)
        if (book.img && typeof book.img === 'string' && book.img.startsWith('data:image')) {
            return book.img;
        }
        // Cas 2 : L'image est stockée comme chemin de fichier
        return `${API_CONFIG.BASE_URL}/books/${book.id}/image?t=${Date.now()}`;
    };

    // === Effet principal ===
    useEffect(() => {
        if (activeTab === 'stats') {
            setLoading(true);
            setError(null);
            AdminService.getStatsBorrows()
                .then(setStats)
                .catch(err => {
                    console.warn("Erreur stats:", err.message);
                    setError("⚠️ Statistiques non disponibles");
                    setStats(null);
                })
                .finally(() => setLoading(false));
        } else if (activeTab === 'books') {
            loadBooks();
        } else if (activeTab === 'users') {
            loadUsers();
        } else if (activeTab === 'borrows') {
            loadBorrows();
        }
    }, [activeTab, page]);

    // Vérification des droits APRÈS tous les Hooks
    if (!isAuthenticated || !isAdmin) {
        return <Redirect to="/home" />;
    }

    // Composant de pagination
    const Pagination = () => (
        <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                Précédent
            </button>
            <span>Page {page + 1} / {totalPages}</span>
            <button className="btn btn-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
                Suivant
            </button>
        </div>
    );

    // Handlers
    const handleDeleteBook = async (id: number) => {
        if (!window.confirm('Supprimer ce livre définitivement ?')) return;
        try {
            await AdminService.deleteBook(id);
            await loadBooks();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleToggleUserStatus = async (userId: number, currentActive: boolean) => {
        try {
            await AdminService.activateUser(userId, !currentActive);
            await loadUsers();
            setPage(prev => prev);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleExtendBorrow = async (borrowId: number) => {
        try {
            await AdminService.extendBorrow(borrowId);
            await loadBorrows();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await AdminService.updateUserRole(userId, newRole);
            alert(`Rôle modifié avec succès en ${newRole}`);
            await loadUsers();
        } catch (err: any) {
            alert(err.message || "Erreur lors du changement de rôle");
        }
    };

    const openEditModal = (book: BookAdmin) => {
        setEditingBook(book);
    };

    const closeEditModal = () => {
        setEditingBook(null);
    };

    const renderRoles = (user: UserAdmin): string => {
        if (user.roles && Array.isArray(user.roles)) return user.roles.join(', ');
        if (user.role) return user.role;
        return '—';
    };

    return (
        <div className="container-fluid mt-4">
            <h1 className="mb-4">Tableau de bord administrateur</h1>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => { setActiveTab('stats'); setPage(0); setError(null); }}>
                        📊 Statistiques
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'books' ? 'active' : ''}`} onClick={() => { setActiveTab('books'); setPage(0); }}>
                        📚 Livres
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setPage(0); }}>
                        👥 Utilisateurs
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'borrows' ? 'active' : ''}`} onClick={() => { setActiveTab('borrows'); setPage(0); }}>
                        🔄 Emprunts
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => { setActiveTab('audit'); setPage(0); setError(null); }}>
                        📜 Audit
                    </button>
                </li>
            </ul>

            <div className="tab-content mt-4">
                {activeTab === 'stats' && (
                    <div>
                        {loading && <SpinnerLoading />}
                        {error && <div className="alert alert-warning">{error}</div>}
                        {stats && (
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="card text-white bg-primary mb-3">
                                        <div className="card-body">
                                            <h5 className="card-title">Total emprunts</h5>
                                            <p className="card-text display-4">{stats.totalBorrows}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-white bg-success mb-3">
                                        <div className="card-body">
                                            <h5 className="card-title">Emprunts actifs</h5>
                                            <p className="card-text display-4">{stats.activeBorrows}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-white bg-danger mb-3">
                                        <div className="card-body">
                                            <h5 className="card-title">En retard</h5>
                                            <p className="card-text display-4">{stats.overdueBorrows}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-white bg-secondary mb-3">
                                        <div className="card-body">
                                            <h5 className="card-title">Retournés</h5>
                                            <p className="card-text display-4">{stats.returnedBorrows}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'books' && (
                    <div>
                        <button className="btn btn-success mb-3" data-bs-toggle="modal" data-bs-target="#addBookModal">
                            ➕ Ajouter un livre
                        </button>
                        {loading && <SpinnerLoading />}
                        {error && <div className="alert alert-warning">{error}</div>}
                        {!loading && books.length === 0 && !error && (
                            <div className="alert alert-info">Aucun livre trouvé.</div>
                        )}
                        {books.length > 0 && (
                            <>
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>ID</th><th>Image</th><th>Titre</th><th>Auteur</th><th>Catégorie</th><th>Exemplaires</th><th>Dispo.</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.map(book => (
                                            <tr key={book.id}>
                                                <td>{book.id}</td>
                                                <td>
                                                    {/* ✅ Image corrigée pour supporter BLOB et chemin de fichier */}
                                                    <img
                                                        src={getImageSrc(book)}
                                                        alt={book.title}
                                                        style={{ width: '50px', height: 'auto', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            console.log("Image failed:", book.id);
                                                            (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/50x75?text=No+Image';
                                                        }}
                                                    />
                                                </td>
                                                <td>{book.title}</td>
                                                <td>{book.author}</td>
                                                <td>{book.category}</td>
                                                <td>{book.copies}</td>
                                                <td>{book.copiesAvailable}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-primary me-2" onClick={() => openEditModal(book)}>Modifier</button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBook(book.id)}>Supprimer</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {totalPages > 1 && <Pagination />}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div>
                        {loading && <SpinnerLoading />}
                        {error && <div className="alert alert-warning">{error}</div>}
                        {users.length > 0 && (
                            <>
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>ID</th><th>Email</th><th>Prénom</th><th>Nom</th><th>Rôles</th><th>Actif</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.email}</td>
                                                <td>{user.firstName}</td>
                                                <td>{user.lastName}</td>
                                                <td>{renderRoles(user)}</td>
                                                <td>{user.active ? '✅' : '❌'}</td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        <select 
                                                            id={`role-${user.id}`}
                                                            className="form-select form-select-sm w-auto"
                                                            defaultValue={user.role || (user.roles && user.roles[0]) || 'ROLE_USER'}
                                                            style={{ width: 'auto' }}
                                                        >
                                                            <option value="ROLE_USER">Utilisateur</option>
                                                            <option value="ROLE_ADMIN">Administrateur</option>
                                                        </select>
                                                        <button 
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => {
                                                                const select = document.getElementById(`role-${user.id}`) as HTMLSelectElement;
                                                                handleRoleChange(user.id, select.value);
                                                            }}
                                                        >
                                                            Appliquer
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-warning" 
                                                            onClick={() => handleToggleUserStatus(user.id, user.active)}
                                                        >
                                                            {user.active ? 'Désactiver' : 'Activer'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {totalPages > 1 && <Pagination />}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'borrows' && (
    <div>
        {loading && <SpinnerLoading />}
        {error && <div className="alert alert-warning">{error}</div>}
        {borrows.length > 0 && (
            <>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Utilisateur</th>
                            <th>Livre</th>
                            <th>Emprunté le</th>
                            <th>Due date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {borrows.map(borrow => (
                            <tr key={borrow.id}>
                                <td>{borrow.id}</td>
                                <td>{borrow.userEmail}</td>
                                <td>{borrow.bookTitle}</td>
                                <td>{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                                <td>{new Date(borrow.dueDate).toLocaleDateString()}</td>
                                <td>{borrow.status}</td>
                                <td>
                                    {borrow.status === 'ACTIVE' && (
                                        <button className="btn btn-sm btn-info" onClick={() => handleExtendBorrow(borrow.id)}>
                                            Prolonger
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && <Pagination />}
            </>
        )}
    </div>
    )}

    {activeTab === 'audit' && <AuditLogs />}
            </div>

            {/* Modal pour ajouter un livre */}
            <div className="modal fade" id="addBookModal" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Ajouter un livre</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form id="addBookForm" onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const token = localStorage.getItem('token');

                                try {
                                    const response = await fetch('http://localhost:8081/api/admin/books', {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: formData
                                    });

                                    if (!response.ok) {
                                        const errorText = await response.text();
                                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                                    }

                                    const newBook = await response.json();
                                    console.log('Livre créé avec succès (front) :', newBook);
                                    alert('Livre ajouté !');
                                    await loadBooks();
                                    // @ts-ignore
                                    bootstrap.Modal.getInstance(document.getElementById('addBookModal')).hide();
                                    e.currentTarget.reset();
                                } catch (err: any) {
                                    console.error('Erreur création livre:', err);
                                    alert(err.message);
                                }
                            }}>
                                <input type="text" name="title" className="form-control mb-2" placeholder="Titre" required />
                                <input type="text" name="author" className="form-control mb-2" placeholder="Auteur" required />
                                <textarea name="description" className="form-control mb-2" placeholder="Description" rows={3} required></textarea>
                                <input type="text" name="category" className="form-control mb-2" placeholder="Catégorie (ex: FE, BE, Data, DevOps)" required />
                                <input type="number" name="copies" className="form-control mb-2" placeholder="Nombre d'exemplaires" required />
                                <input type="file" name="imgFile" className="form-control mb-2" accept="image/*" />
                                <input type="file" name="pdfFile" className="form-control mb-2" accept="application/pdf" />
                                <button type="submit" className="btn btn-primary">Ajouter</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal pour modifier un livre */}
            {editingBook && (
                <div className="modal show" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Modifier le livre</h5>
                                <button type="button" className="btn-close" onClick={closeEditModal}></button>
                            </div>
                            <div className="modal-body">
                                <form id="editBookForm" onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const formData = new FormData(form);
                                    const token = localStorage.getItem('token');

                                    try {
                                        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/books/${editingBook.id}`, {
                                            method: 'PUT',
                                            headers: { 'Authorization': `Bearer ${token}` },
                                            body: formData
                                        });

                                        if (!response.ok) throw new Error('Modification échouée');

                                        alert('Livre modifié !');
                                        closeEditModal();
                                        await loadBooks();
                                    } catch (err: any) {
                                        alert(err.message);
                                    }
                                }}>
                                    <input type="text" name="title" className="form-control mb-2" placeholder="Titre" defaultValue={editingBook.title} required />
                                    <input type="text" name="author" className="form-control mb-2" placeholder="Auteur" defaultValue={editingBook.author} required />
                                    <textarea name="description" className="form-control mb-2" placeholder="Description" rows={3} defaultValue={editingBook.description} required />
                                    <input type="text" name="category" className="form-control mb-2" placeholder="Catégorie (ex: FE, BE, Data, DevOps)" defaultValue={editingBook.category} required />
                                    <input type="number" name="copies" className="form-control mb-2" placeholder="Nombre d'exemplaires" defaultValue={editingBook.copies} required />
                                    <input type="file" name="imgFile" className="form-control mb-2" accept="image/*" />
                                    <input type="file" name="pdfFile" className="form-control mb-2" accept="application/pdf" />
                                    <div className="d-flex justify-content-end gap-2 mt-3">
                                        <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Annuler</button>
                                        <button type="submit" className="btn btn-primary">Enregistrer</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};