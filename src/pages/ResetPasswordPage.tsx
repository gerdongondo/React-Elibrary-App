// src/pages/ResetPasswordPage.tsx
import { useState, useEffect } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import API_CONFIG from '../config/api';

export const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get('token');
        if (!tokenParam) {
            setError('Lien invalide ou expiré.');
        } else {
            setToken(tokenParam);
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Échec de la réinitialisation');
            }

            setMessage('Mot de passe modifié avec succès !');
            setTimeout(() => history.push('/login'), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container d-flex justify-content-center align-items-center' style={{ minHeight: '80vh' }}>
            <div className='col-md-6 col-lg-4'>
                <div className='card shadow'>
                    <div className='card-body p-5'>
                        <h2 className='text-center mb-4'>Nouveau mot de passe</h2>

                        {message && <div className='alert alert-success'>{message}</div>}
                        {error && <div className='alert alert-danger'>{error}</div>}

                        {!error && token && (
                            <form onSubmit={handleSubmit}>
                                <div className='mb-3'>
                                    <label className='form-label'>Nouveau mot de passe</label>
                                    <input
                                        type='password'
                                        className='form-control'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='mb-3'>
                                    <label className='form-label'>Confirmer le mot de passe</label>
                                    <input
                                        type='password'
                                        className='form-control'
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type='submit' className='btn btn-primary w-100' disabled={loading}>
                                    {loading ? 'Réinitialisation...' : 'Réinitialiser'}
                                </button>
                            </form>
                        )}

                        <div className='text-center mt-3'>
                            <Link to='/login'>Retour à la connexion</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};