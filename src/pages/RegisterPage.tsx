// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';

export const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        try {
            await AuthService.register({ firstName, lastName, email, password });
            // Après inscription réussie, rediriger vers la page de connexion
            history.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container d-flex justify-content-center align-items-center' style={{ minHeight: '80vh' }}>
            <div className='col-md-6 col-lg-5'>
                <div className='card shadow'>
                    <div className='card-body p-5'>
                        <h2 className='text-center mb-4'>Inscription</h2>
                        
                        {error && <div className='alert alert-danger'>{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className='row'>
                                <div className='col-md-6 mb-3'>
                                    <label className='form-label'>Prénom</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='col-md-6 mb-3'>
                                    <label className='form-label'>Nom</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

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

                            <div className='mb-3'>
                                <label className='form-label'>Mot de passe</label>
                                <input
                                    type='password'
                                    className='form-control'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='mb-4'>
                                <label className='form-label'>Confirmer mot de passe</label>
                                <input
                                    type='password'
                                    className='form-control'
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                type='submit' 
                                className='btn btn-primary w-100'
                                disabled={loading}
                            >
                                {loading ? 'Inscription...' : "S'inscrire"}
                            </button>
                        </form>

                        <div className='text-center mt-3'>
                            <Link to='/login'>Déjà un compte ? Connectez-vous</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};