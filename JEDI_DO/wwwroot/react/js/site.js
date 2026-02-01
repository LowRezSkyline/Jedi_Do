const { useState, useEffect, useCallback } = React;

const API_URI = '/api/JediDoItems';

function apiFetch(url, options = {}) {
    return fetch(url, { credentials: 'include', ...options }).then(res => {
        if (res.status === 401) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            window.location.href = '/login/?returnUrl=' + returnUrl;
            throw new Error('Unauthorized');
        }
        return res;
    });
}

function App() {
    const [items, setItems] = useState([]);
    const [newName, setNewName] = useState('');
    const [newTypeId, setNewTypeId] = useState(1);
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({ id: 0, name: '', completed: false, jediDoTypeId: 1 });
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
    const deleteModalRef = React.useRef(null);

    const loadItems = useCallback(async () => {
        try {
            const res = await apiFetch(API_URI);
            setItems(await res.json());
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Unable to get items.', e);
        }
    }, []);

    useEffect(() => { loadItems(); }, [loadItems]);

    const addItem = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        try {
            await apiFetch(API_URI, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim(), jediDoTypeId: newTypeId, completed: false })
            });
            setNewName('');
            setNewTypeId(1);
            await loadItems();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Unable to add item.', e);
        }
    };

    const startEdit = (item) => {
        setEditForm({ id: item.id, name: item.name, completed: item.completed, jediDoTypeId: item.jediDoTypeId });
        setEditing(true);
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            await apiFetch(`${API_URI}/${editForm.id}`, {
                method: 'PUT',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editForm.id,
                    name: editForm.name.trim(),
                    completed: editForm.completed,
                    jediDoTypeId: editForm.jediDoTypeId
                })
            });
            setEditing(false);
            await loadItems();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Unable to update item.', e);
        }
    };

    const toggleComplete = async (item) => {
        try {
            await apiFetch(`${API_URI}/${item.id}`, {
                method: 'PUT',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id,
                    name: item.name,
                    completed: !item.completed,
                    jediDoTypeId: item.jediDoTypeId
                })
            });
            await loadItems();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Unable to update item.', e);
        }
    };

    const showDeleteConfirm = (item) => {
        setDeleteConfirmItem(item);
        if (!deleteModalRef.current) deleteModalRef.current = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        deleteModalRef.current.show();
    };

    const confirmDelete = async () => {
        if (!deleteConfirmItem) return;
        const id = deleteConfirmItem.id;
        setDeleteConfirmItem(null);
        if (deleteModalRef.current) deleteModalRef.current.hide();
        try {
            await apiFetch(`${API_URI}/${id}`, { method: 'DELETE' });
            await loadItems();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Unable to delete item.', e);
        }
    };

    const deleteItem = async (id) => {
        try {
            await apiFetch(`${API_URI}/${id}`, { method: 'DELETE' });
            await loadItems();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Unable to delete item.', e);
        }
    };

    const logout = async () => {
        try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch (_) {}
        window.location.href = '/login/';
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
                <div className="container-fluid">
                    <a className="navbar-brand d-flex align-items-center" href="#">
                        <img className="logo me-2" src="../assets/logo_white.png" alt="JEDI-do" />
                        <div>
                            <span className="jedido-name">JEDI-do (React)</span>
                            <div className="jedido-tag-line">Do or Do Not! There is no try!</div>
                        </div>
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#reactNav" aria-controls="reactNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="reactNav">
                        <div className="ms-auto d-flex align-items-center gap-1 flex-wrap">
                            <div className="dropdown">
                                <button className="btn btn-outline-light btn-sm dropdown-toggle" type="button" id="reactSwitchUi" data-bs-toggle="dropdown" data-bs-display="dynamic" data-bs-boundary="viewport" aria-expanded="false">Switch UI</button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="reactSwitchUi">
                                    <li><a className="dropdown-item" href="/angular/">Angular</a></li>
                                    <li><a className="dropdown-item active" href="/react/">React</a></li>
                                    <li><a className="dropdown-item" href="/svelte/">Svelte</a></li>
                                    <li><a className="dropdown-item" href="/vanillajs/">VanillaJS</a></li>
                                    <li><a className="dropdown-item" href="/vue/">Vue</a></li>
                                </ul>
                            </div>
                            <button type="button" className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="main-content">
                <div className="container py-4">
                    {/* Add new item form */}
                    {!editing && (
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <form onSubmit={addItem} className="row g-2 flex-md-row flex-column align-items-end">
                                    <div className="col-md-6">
                                        <label htmlFor="add-name" className="form-label visually-hidden">New to-do</label>
                                        <input type="text" id="add-name" value={newName} onChange={e => setNewName(e.target.value)} className="form-control" placeholder="What must you do (or not do)?" />
                                    </div>
                                    <div className="col-md-3">
                                        <label htmlFor="add-type" className="form-label visually-hidden">Type</label>
                                        <select id="add-type" value={newTypeId} onChange={e => setNewTypeId(Number(e.target.value))} className="form-select">
                                            <option value={1}>Do!</option>
                                            <option value={2}>Not Do!</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3 col-auto">
                                        <button type="submit" className="btn btn-primary w-100" disabled={!newName.trim()}>Add</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit item form */}
                    {editing && (
                        <div className="card shadow-sm mb-4 jedido-edit-card">
                            <div className="card-body">
                                <form onSubmit={saveEdit} className="row g-2 flex-md-row flex-column align-items-end">
                                    <div className="col-md-6">
                                        <label htmlFor="edit-name" className="form-label visually-hidden">Item name</label>
                                        <input type="text" id="edit-name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="form-control" />
                                    </div>
                                    <div className="col-md-3">
                                        <select value={editForm.jediDoTypeId} onChange={e => setEditForm({ ...editForm, jediDoTypeId: Number(e.target.value) })} className="form-select">
                                            <option value={1}>Do!</option>
                                            <option value={2}>Not Do!</option>
                                        </select>
                                    </div>
                                    <div className="col-auto d-flex gap-1">
                                        <button type="submit" className="btn btn-primary btn-sm">Save</button>
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(false)} aria-label="Cancel">×</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Todo list */}
                    <div className="card shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Your Items</h5>
                            <span className="badge bg-secondary">{items.length === 1 ? '1 item' : items.length + ' items'}</span>
                        </div>
                        <ul id="todos" className="list-group list-group-flush">
                            {items.map(item => (
                                <li key={item.id} className="list-group-item d-flex align-items-start gap-3 py-3">
                                    <div className="form-check mb-0">
                                        <input type="checkbox" className="form-check-input jedido-checkbox" checked={item.completed} onChange={() => toggleComplete(item)} id={`cb-${item.id}`} />
                                        <label className="form-check-label visually-hidden" htmlFor={`cb-${item.id}`}>Toggle completed</label>
                                    </div>
                                    <span className={`flex-grow-1 jedido-task-text ${item.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                                        <span className={`badge jedido-type-badge ${item.jediDoTypeId === 1 ? 'bg-success' : 'bg-warning text-dark'}`} style={{ marginRight: '0.5rem' }}>
                                            {item.jediDoType || (item.jediDoTypeId === 1 ? 'Do!' : 'Not Do!')}
                                        </span>
                                        {item.name}
                                    </span>
                                    <div className="jedido-item-actions">
                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(item)}>Edit</button>
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => showDeleteConfirm(item)}>×</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>

            {/* Delete confirmation modal */}
            <div className="modal fade" id="deleteConfirmModal" tabIndex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content shadow">
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title" id="deleteConfirmModalLabel">Delete Item</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body pt-0">
                            <p className="mb-0">Are you sure you want to delete <strong>{deleteConfirmItem ? '"' + deleteConfirmItem.name + '"' : ''}</strong>? This cannot be undone.</p>
                        </div>
                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
