import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserService, { UserProfile } from '../services/UserService';

// Composant de chargement local (style identique au SpinnerLoading original)
const SpinnerLoading = () => (
    <div className="container m-5 d-flex justify-content-center" style={{ height: 500 }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
        </div>
    </div>
);

export const ProfilePage = () => {
    const { isAuthenticated, logout } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        const loadProfile = async () => {
            try {
                const data = await UserService.getProfile();
                setProfile(data);
                setFirstName(data.firstName);
                setLastName(data.lastName);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, [isAuthenticated]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const updated = await UserService.updateProfile(firstName, lastName);
            setProfile(updated);
            setSuccess('Profil mis à jour avec succès !');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    Vous devez être connecté pour accéder à cette page.
                </div>
            </div>
        );
    }

    if (isLoading) return <SpinnerLoading />;

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Mon profil</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={profile?.email || ''}
                                        disabled
                                    />
                                    <small className="text-muted">L'email ne peut pas être modifié.</small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Prénom</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Nom</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Rôle(s)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={profile?.roles?.join(', ') || ''}
                                        disabled
                                    />
                                </div>
                                <div className="d-flex justify-content-between">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={logout}
                                    >
                                        Déconnexion
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};