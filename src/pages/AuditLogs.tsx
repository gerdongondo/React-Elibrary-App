// src/pages/AuditLogs.tsx
import { useEffect, useState } from 'react';
import AuditService, { AuditLog } from '../services/AuditService';
import { SpinnerLoading } from '../layouts/Utils/SpinnerLoading';


export const AuditLogs = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({ action: '', userEmail: '', from: '', to: '' });
    const [actionTypes, setActionTypes] = useState<string[]>([]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await AuditService.getLogs(page, 20, filters);
            setLogs(data.content);
            setTotalPages(data.totalPages);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadActionTypes = async () => {
        try {
            const types = await AuditService.getActionTypes();
            setActionTypes(types.map(t => t.name));
        } catch (err) {
            console.error("Erreur chargement types d'actions", err);
        }
    };

    useEffect(() => {
        loadLogs();
        loadActionTypes();
    }, [page, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(0);
    };

    const resetFilters = () => {
        setFilters({ action: '', userEmail: '', from: '', to: '' });
        setPage(0);
    };

    const Pagination = () => (
        <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Précédent</button>
            <span>Page {page + 1} / {totalPages}</span>
            <button className="btn btn-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>Suivant</button>
        </div>
    );

    if (loading) return <SpinnerLoading />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid mt-4">
            <h2>📋 Journalisation des audits</h2>
            <div className="row mb-3 g-2">
                <div className="col-md-3">
                    <select name="action" className="form-select" value={filters.action} onChange={handleFilterChange}>
                        <option value="">Toutes les actions</option>
                        {actionTypes.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-3">
                    <input type="text" name="userEmail" className="form-control" placeholder="Email utilisateur" value={filters.userEmail} onChange={handleFilterChange} />
                </div>
                <div className="col-md-2">
                    <input type="date" name="from" className="form-control" placeholder="De" value={filters.from} onChange={handleFilterChange} />
                </div>
                <div className="col-md-2">
                    <input type="date" name="to" className="form-control" placeholder="À" value={filters.to} onChange={handleFilterChange} />
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary w-100" onClick={resetFilters}>Réinitialiser</button>
                </div>
            </div>
            {logs.length === 0 ? (
                <div className="alert alert-info">Aucun log trouvé.</div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Utilisateur</th>
                                    <th>Action</th>
                                    <th>Détails</th>
                                    <th>IP</th>
                                </tr>
                            </thead>
                           <tbody>
                                {logs.map(log => {
                                    console.log("Timestamp brut :", log.timestamp, typeof log.timestamp);
                                    return (
                                        <tr key={log.id}>
                                            <td>
                                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                                            </td>
                                            <td>{log.userEmail}</td>
                                            <td><span className="badge bg-secondary">{log.action}</span></td>
                                            <td>{log.details}</td>
                                            <td>{log.ipAddress}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && <Pagination />}
                </>
            )}
        </div>
    );
};