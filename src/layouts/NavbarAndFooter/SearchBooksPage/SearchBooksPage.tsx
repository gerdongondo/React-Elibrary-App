import { useEffect, useState } from "react";
import BookModel from "../../../models/BookModels";
import { SpinnerLoading } from "../../Utils/SpinnerLoading";
import { SearchBook } from "./components/SearchBook";
import { Pagination } from "../../Utils/Pagination";
import API_CONFIG from '../../../config/api';
import CategoryService, { Category } from "../../../services/CategoryService";

export const SearchBooksPage = () => {
    const [books, setBooks] = useState<BookModel[]>([]);
    const [isloading, setIsLoading] = useState(true);
    const [httpError, setHttpError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [booksPerPage] = useState(5);
    const [totalAmountOfBook, setTotalAmountOfBooks] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [searchUrl, setSearchUrl] = useState('');
    const [categorySelection, setCategorySelection] = useState('Toutes les catégories');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // 1er useEffect : chargement des livres
    useEffect(() => {
        const fetchBooks = async () => {
            const baseUrl: string = `${API_CONFIG.BASE_URL}/books`;
            let url: string = '';
            if (searchUrl === '') {
                url = `${baseUrl}?page=${currentPage - 1}&size=${booksPerPage}`;
            } else {
                let searchWithPage = searchUrl.replace('<pageNumber>', `${currentPage - 1}`);
                url = baseUrl + searchWithPage;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Something went wrong');
            const responseJson = await response.json();
            const responseData = responseJson._embedded.books;
            setTotalAmountOfBooks(responseJson.page.totalElements);
            setTotalPages(responseJson.page.totalPages);
            const loadedBooks: BookModel[] = [];
            for (const key in responseData) {
                loadedBooks.push({
                    id: responseData[key].id,
                    title: responseData[key].title,
                    author: responseData[key].author,
                    description: responseData[key].description,
                    copies: responseData[key].copies,
                    copiesAvailable: responseData[key].copiesAvailable,
                    category: responseData[key].category,
                    img: responseData[key].img,
                });
            }
            setBooks(loadedBooks);
            setIsLoading(false);
        };
        fetchBooks().catch((error: any) => {
            setIsLoading(false);
            setHttpError(error.message);
        });
        window.scrollTo(0, 0);
    }, [currentPage, searchUrl]);

    // 2ème useEffect : chargement des catégories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await CategoryService.getActiveCategories();
                setCategories(data);
            } catch (error) {
                console.error('Erreur chargement catégories :', error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    if (isloading) return <SpinnerLoading />;
    if (httpError) return <div className="container m-5"><p>{httpError}</p></div>;

    const searchHandleChange = () => {
        setCurrentPage(1);
        if (search === '') {
            setSearchUrl('');
        } else {
            setSearchUrl(`/search/findByTitleContaining?title=${search}&page=<pageNumber>&size=${booksPerPage}`);
        }
        setCategorySelection('Toutes les catégories');
    };

    // ✅ FONCTION CORRIGÉE AVEC MAPPING
   const categoryField = (value: string) => {
    setCurrentPage(1);
    if (value === 'All' || value === 'Toutes les catégories') {
        setCategorySelection('Toutes les catégories');
        setSearchUrl(`?page=<pageNumber>&size=${booksPerPage}`);
        return;
    }

    // Extraire le code : par exemple "BE (Backend)" -> "BE"
    let apiValue = value;
    const match = value.match(/^([A-Z0-9]+)\s*\(/);
    if (match) {
        apiValue = match[1]; // "BE" ou "FE"
    } else {
        // Fallback : normalisation sans espace
        const normalized = value.trim().toLowerCase().replace(/\s+/g, '');
        if (normalized === 'frontend') apiValue = 'FE';
        else if (normalized === 'backend') apiValue = 'BE';
        else if (normalized === 'data') apiValue = 'Data';
        else if (normalized === 'devops') apiValue = 'DevOps';
    }

    console.log(`Mapping: "${value}" -> "${apiValue}"`);
    setCategorySelection(value);
    setSearchUrl(`/search/findByCategory?category=${encodeURIComponent(apiValue)}&page=<pageNumber>&size=${booksPerPage}`);
    };

    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    let lastItem = booksPerPage * currentPage <= totalAmountOfBook ? booksPerPage * currentPage : totalAmountOfBook;
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div>
            <div className='container'>
                <div>
                    <div className='row mt-5'>
                        <div className='col-6'>
                            <div className='d-flex'>
                                <input className='form-control me-2' type='search' placeholder='Search'
                                    onChange={e => setSearch(e.target.value)} />
                                <button className='btn btn-outline-success' onClick={searchHandleChange}>
                                    Recherche
                                </button>
                            </div>
                        </div>
                        <div className='col-4'>
                            <div className='dropdown'>
                                <button className='btn btn-secondary dropdown-toggle' type='button' data-bs-toggle='dropdown'>
                                    {categorySelection}
                                </button>
                                <ul className='dropdown-menu'>
                                    <li onClick={() => categoryField('All')}>
                                        <button className='dropdown-item' style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                                            Toutes les catégories
                                        </button>
                                    </li>
                                    {!loadingCategories && categories.map(cat => (
                                        <li key={cat.id} onClick={() => categoryField(cat.name)}>
                                            <button className='dropdown-item' style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                                                {cat.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    {totalAmountOfBook > 0 ? (
                        <>
                            <div className='mt-3'>
                                <h5>Nombre de résultats : ({totalAmountOfBook})</h5>
                            </div>
                            <p>{indexOfFirstBook + 1} à {lastItem} sur {totalAmountOfBook} éléments</p>
                            {books.map(book => <SearchBook book={book} key={book.id} />)}
                        </>
                    ) : (
                        <div className='m-5'>
                            <h3>Vous ne trouvez pas ce que vous cherchez ?</h3>
                            <a className='btn main-color btn-md px-4 me-md-2 fw-bold text-white' href="#">Services de la bibliothèque</a>
                        </div>
                    )}
                    {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}
                </div>
            </div>
        </div>
    );
};