const uri = '/api/JediDoItems';
const authUri = '/api/auth';
let todos = [];

const apiFetch = (url, options = {}) => fetch(url, { credentials: 'include', ...options }).then(res => {
    if (res.status === 401) { window.location.href = '/login/?returnUrl=' + encodeURIComponent(window.location.pathname); throw new Error('Unauthorized'); }
    return res;
});

document.getElementById('logoutBtn').onclick = () => apiFetch(authUri + '/logout', { method: 'POST' }).then(() => location.href = '/login/').catch(() => location.href = '/login/');

const getItems = () => apiFetch(uri).then(r => r.json()).then(displayItems).catch(e => { if (e.message !== 'Unauthorized') console.error('Unable to get items.', e); });

function displayItems(data) {
    const container = document.getElementById('todos');
    container.innerHTML = '';
    const counter = document.getElementById('counter');
    counter.textContent = data.length === 1 ? '1 item' : data.length + ' items';

    data.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex align-items-start gap-3 py-3';

        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'form-check mb-0';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'form-check-input jedido-checkbox';
        cb.checked = item.completed;
        cb.onclick = () => checkboxClick(item);
        const cbLabel = document.createElement('label');
        cbLabel.className = 'form-check-label visually-hidden';
        cbLabel.textContent = 'Toggle completed';
        checkboxWrapper.appendChild(cb);
        checkboxWrapper.appendChild(cbLabel);

        const textSpan = document.createElement('span');
        textSpan.className = 'flex-grow-1 jedido-task-text' + (item.completed ? ' text-decoration-line-through text-muted' : '');
        const typeBadge = document.createElement('span');
        typeBadge.className = 'badge jedido-type-badge ' + (item.jediDoTypeId === 1 ? 'bg-success' : 'bg-warning text-dark');
        typeBadge.textContent = item.jediDoType || (item.jediDoTypeId === 1 ? 'Do!' : 'Not Do!');
        typeBadge.style.marginRight = '0.5rem';
        textSpan.appendChild(typeBadge);
        textSpan.appendChild(document.createTextNode(item.name));

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'jedido-item-actions';
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn btn-sm btn-outline-secondary';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => displayEditForm(item.id);
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'btn btn-sm btn-outline-danger';
        delBtn.textContent = '×';
        delBtn.onclick = () => showDeleteConfirm(item);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(delBtn);

        li.appendChild(checkboxWrapper);
        li.appendChild(textSpan);
        li.appendChild(actionsDiv);
        container.appendChild(li);
    });
    todos = data;
}

document.getElementById('add-name').addEventListener('input', () => { document.getElementById('btnAdd').disabled = !document.getElementById('add-name').value.trim(); });

document.getElementById('addFormEl').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('add-name').value.trim();
    const typeId = parseInt(document.getElementById('add-type').value, 10);
    if (!name) return;
    apiFetch(uri, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ name, jediDoTypeId: typeId, completed: false }) })
        .then(r => r.json()).then(() => { getItems(); document.getElementById('add-name').value = ''; document.getElementById('btnAdd').disabled = true; document.getElementById('add-type').selectedIndex = 0; })
        .catch(e => { if (e.message !== 'Unauthorized') console.error('Unable to add item.', e); });
};

function displayEditForm(id) {
    if (id < 1) {
        document.getElementById('addForm').style.display = '';
        document.getElementById('editForm').style.display = 'none';
        return;
    }
    const item = todos.find(i => i.id === id);
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-id').value = item.id;
    const editType = document.getElementById('edit-type');
    editType.value = item.jediDoTypeId;
    document.getElementById('editForm').style.display = '';
    document.getElementById('addForm').style.display = 'none';
}

document.getElementById('editFormEl').onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const origItem = todos.find(i => i.id === parseInt(id, 10));
    const item = { id: parseInt(id, 10), name: document.getElementById('edit-name').value.trim(), completed: origItem ? origItem.completed : false, jediDoTypeId: parseInt(document.getElementById('edit-type').value, 10) };
    apiFetch(uri + '/' + id, { method: 'PUT', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
        .then(() => { getItems(); displayEditForm(0); document.getElementById('editForm').style.display = 'none'; document.getElementById('addForm').style.display = ''; })
        .catch(e => { if (e.message !== 'Unauthorized') console.error('Unable to update item.', e); });
};

document.getElementById('closeEdit').onclick = (e) => {
    e.preventDefault();
    document.getElementById('editForm').style.display = 'none';
    displayEditForm(0);
    document.getElementById('addForm').style.display = '';
};

function checkboxClick(item) {
    const payload = { id: item.id, name: item.name, completed: !item.completed, jediDoTypeId: item.jediDoTypeId };
    apiFetch(uri + '/' + item.id, { method: 'PUT', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(() => getItems()).catch(e => { if (e.message !== 'Unauthorized') console.error(e); });
}

let deleteModal = null;
let pendingDeleteId = null;

function showDeleteConfirm(item) {
    pendingDeleteId = item.id;
    document.getElementById('deleteItemName').textContent = '"' + item.name + '"';
    if (!deleteModal) deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    deleteModal.show();
}

document.getElementById('deleteConfirmBtn').onclick = () => {
    if (pendingDeleteId == null) return;
    const id = pendingDeleteId;
    pendingDeleteId = null;
    if (deleteModal) deleteModal.hide();
    deleteItem(id);
};

function deleteItem(id) {
    apiFetch(uri + '/' + id, { method: 'DELETE' }).then(() => getItems()).catch(e => { if (e.message !== 'Unauthorized') console.error('Unable to delete item.', e); });
}

getItems();
