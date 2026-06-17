// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('registered') === 'true') {
            setSuccessMessage('Inscription réussie ! Vous pouvez vous connecter.');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await AuthService.login({ email, password });
            history.push('/home');
        } catch (err: any) {
            setError(err.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container d-flex justify-content-center align-items-center' style={{ minHeight: '80vh' }}>
            <div className='col-md-6 col-lg-4'>
                <div className='card shadow'>
                    <div className='card-body p-5'>
                        <h2 className='text-center mb-4'>Connexion</h2>
                        
                        {successMessage && (
                            <div className='alert alert-success' role='alert'>
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className='alert alert-danger' role='alert'>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className='mb-3'>
                                <label htmlFor='email' className='form-label'>Email</label>
                                <input
                                    type='email'
                                    className='form-control'
                                    id='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='mb-3'>
                                <label htmlFor='password' className='form-label'>Mot de passe</label>
                                <input
                                    type='password'
                                    className='form-control'
                                    id='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                type='submit' 
                                className='btn btn-primary w-100'
                                disabled={loading}
                            >
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </button>
                        </form>

                        <div className='text-center mt-3'>
                            <Link to='/register'>Pas encore de compte ? Inscrivez-vous</Link>
                        </div>

                        <div className='text-center mt-2'>
                            <Link to='/forgot-password'>Mot de passe oublié ?</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};