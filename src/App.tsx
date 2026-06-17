import React from 'react';
import './App.css';
import { Navbar } from './layouts/NavbarAndFooter/Navbar';
import { Footer} from './layouts/NavbarAndFooter/Footer';
import { HomePage } from './layouts/NavbarAndFooter/HomePage/HomePage';
import { SearchBooksPage } from './layouts/NavbarAndFooter/SearchBooksPage/SearchBooksPage';
import { Redirect, Route, Switch } from 'react-router-dom';
import { BookCheckoutPage } from './layouts/BookCheckoutPage/BookCheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { MyBorrowsPage } from './pages/MyBorrowsPage';
import { ProfilePage } from './pages/ProfilePage';
import { BorrowHistoryPage } from './pages/BorrowHistoryPage';
import { AdminDashboard } from './pages/AdminDashboard';

export const  App =()=> {
   return (
        <AuthProvider>
            <div className='d-flex flex-column min-vh-100'>
                <Navbar/>
                <div className='flex-grow-1'>
                    <Switch>
                        <Route path='/' exact>
                            <Redirect to='/home'/>
                        </Route>
                        <Route path='/home'>
                            <HomePage/>
                        </Route>
                        <Route path='/search'>
                            <SearchBooksPage/>
                        </Route>
                        <Route path='/login'>
                            <LoginPage/>
                        </Route>
                        <Route path='/register'>
                            <RegisterPage/>
                        </Route>
                        <Route path='/forgot-password'>
                        <ForgotPasswordPage/>
                            </Route>
                        <Route path='/reset-password'>
                            <ResetPasswordPage/>
                        </Route>
                        <Route path='/my-borrows'>
                            <MyBorrowsPage/>
                        </Route>
                        <Route path='/profile'>
                            <ProfilePage/>
                        </Route>
                        <Route path='/borrow-history'>
                            <BorrowHistoryPage/>
                        </Route>
                        <Route path='/admin'>
                            <AdminDashboard/>
                        </Route>
                        <Route path='/checkout/:bookId'>
                            <BookCheckoutPage/>
                        </Route>
                    </Switch>
                </div>
                <Footer/>
            </div>
        </AuthProvider>
    );
}

export default App;
