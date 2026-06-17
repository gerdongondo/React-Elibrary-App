// src/pages/ForgotPasswordPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import API_CONFIG from '../config/api';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erreur lors de l\'envoi');
            }

            setMessage('Un email de réinitialisation vous a été envoyé (si le compte existe).');
            setEmail('');
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
                        <h2 className='text-center mb-4'>Mot de passe oublié</h2>
                        <p className='text-muted text-center mb-4'>
                            Entrez votre email, nous vous enverrons un lien de réinitialisation.
                        </p>

                        {message && <div className='alert alert-success'>{message}</div>}
                        {error && <div className='alert alert-danger'>{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className='mb-3'>
                                <label className='form-label'>Email</label>
                                <input
                                    type='email'
                                    className='form-control'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type='submit' className='btn btn-primary w-100' disabled={loading}>
                                {loading ? 'Envoi...' : 'Envoyer le lien'}
                            </button>
                        </form>

                        <div className='text-center mt-3'>
                            <Link to='/login'>Retour à la connexion</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};