const uri = '/api/JediDoItems';
const authUri = '/api/auth';
const debug = true;
let todos = [];

const fetchOptions = { credentials: 'include' };

const apiFetch = (url, options = {}) => {
    const opts = { ...fetchOptions, ...options };
    return fetch(url, opts).then(response => {
        if (response.status === 401) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            window.location.href = '/login/?returnUrl=' + returnUrl;
            return Promise.reject(new Error('Unauthorized'));
        }
        return response;
    });
};

const logout = () => {
    apiFetch(`${authUri}/logout`, { method: 'POST' })
        .then(() => { window.location.href = '/login/'; })
        .catch(() => { window.location.href = '/login/'; });
};

const Init = () => {
    document.getElementById('editForm').style.display = 'none';
    getItems();

    const btnAdd = document.getElementById('btnAdd');
    const textboxAdd = document.getElementById('add-name');
    const inputHandler = () => {
        btnAdd.disabled = !textboxAdd?.value?.trim();
    };
    textboxAdd.addEventListener('input', inputHandler);
    textboxAdd.addEventListener('propertychange', inputHandler);

    document.getElementById('deleteConfirmBtn')?.addEventListener('click', confirmDelete);
};

const getItems = () => {
    apiFetch(uri)
        .then(response => response.json())
        .then(data => displayItems(data))
        .catch(error => { if (error.message !== 'Unauthorized') console_log('Unable to get items.', error); });
};

const save = (typeId) => {
    console_log('save called (typeId: ' + typeId + ')');
    typeId === 0 ? addItem() : updateItem();
};

const addItem = () => {
    const addNameTextbox = document.getElementById('add-name');
    const addTypeDropDown = document.getElementById('add-type');
    const addType = addTypeDropDown.options[addTypeDropDown.selectedIndex].value;
    console_log('addType: ' + addType);

    const item = {
        completed: false,
        jediDoTypeId: parseInt(addType, 10),
        name: addNameTextbox.value.trim()
    };

    apiFetch(uri, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
        .then(response => response.json())
        .then(() => {
            getItems();
            addNameTextbox.value = '';
            document.getElementById('btnAdd').disabled = true;
            addTypeDropDown.selectedIndex = 0;
        })
        .catch(error => console.error('Unable to add item.', error));
};

const updateItem = () => {
    console_log('updateItem called');

    const editTypeDropDown = document.getElementById('edit-type');
    const itemId = document.getElementById('edit-id').value;
    const editType = editTypeDropDown.options[editTypeDropDown.selectedIndex].value;
    const origItem = todos.find(i => i.id === parseInt(itemId, 10));

    const item = {
        id: parseInt(itemId, 10),
        completed: origItem ? origItem.completed : false,
        jediDoTypeId: parseInt(editType, 10),
        name: document.getElementById('edit-name').value.trim()
    };

    apiFetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
        .then(() => {
            getItems();
            displayEditForm(0);
            editTypeDropDown.selectedIndex = 0;
        })
        .catch(error => console.error('Unable to update item.', error));

    closeInput();
    return false;
};

let deleteModal = null;
let pendingDeleteId = null;

const showDeleteConfirm = (item) => {
    pendingDeleteId = item.id;
    const nameEl = document.getElementById('deleteItemName');
    if (nameEl) nameEl.textContent = '"' + item.name + '"';
    if (!deleteModal) deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    deleteModal.show();
};

const confirmDelete = () => {
    if (pendingDeleteId == null) return;
    const id = pendingDeleteId;
    pendingDeleteId = null;
    if (deleteModal) deleteModal.hide();
    deleteItem(id);
};

const deleteItem = (id) => {
    apiFetch(`${uri}/${id}`, { method: 'DELETE' })
        .then(() => getItems())
        .catch(error => { if (error.message !== 'Unauthorized') console.error('Unable to delete item.', error); });
};

const displayEditForm = (id) => {
    console_log('id: ' + id);

    if (id < 1) {
        document.getElementById('addForm').style.display = '';
    } else {
        const item = todos.find(i => i.id === id);
        const editTypeDropDown = document.getElementById('edit-type');

        document.getElementById('edit-name').value = item.name;
        document.getElementById('edit-id').value = item.id;
        document.getElementById('editForm').style.display = '';
        document.getElementById('addForm').style.display = 'none';

        if (item.jediDoTypeId > 0)
            editTypeDropDown.selectedIndex = item.jediDoTypeId - 1;
    }
};

const closeInput = () => {
    document.getElementById('editForm').style.display = 'none';
    displayEditForm(0);
};

const SetDisplayCount = (itemCount) => {
    const el = document.getElementById('counter');
    if (el) el.textContent = itemCount === 1 ? '1 item' : `${itemCount} items`;
};

const displayItems = (data) => {
    const container = document.getElementById('todos');
    container.innerHTML = '';

    SetDisplayCount(data.length);

    data.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex align-items-start gap-3 py-3';

        const checkbox = CreateCheckBox(item.completed, item.id);

        const textSpan = document.createElement('span');
        textSpan.className = 'flex-grow-1 jedido-task-text' + (item.completed ? ' text-decoration-line-through text-muted' : '');
        const typeBadge = document.createElement('span');
        typeBadge.className = 'badge jedido-type-badge ' + (item.jediDoTypeId === 1 ? 'bg-success' : 'bg-warning text-dark');
        typeBadge.textContent = item.jediDoType || (item.jediDoTypeId === 1 ? 'Do!' : 'Not Do!');
        typeBadge.style.marginRight = '0.5rem';
        textSpan.appendChild(typeBadge);
        textSpan.appendChild(document.createTextNode(item.name));

        const editBtn = CreateButton('Edit', () => displayEditForm(item.id), 'btn-outline-secondary');
        const deleteBtn = CreateButton('×', () => showDeleteConfirm(item), 'btn-outline-danger');

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'jedido-item-actions';
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(actionsDiv);

        container.appendChild(li);
    });
    todos = data;
};

const CreateButton = (btnText, handler, btnClass = 'btn-primary') => {
    const _button = document.createElement('button');
    _button.type = 'button';
    _button.textContent = btnText;
    _button.className = 'btn btn-sm ' + btnClass;
    _button.onclick = handler;
    return _button;
};

const CreateCheckBox = (checkState, id) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-check mb-0';
    const _checkbox = document.createElement('input');
    _checkbox.className = 'form-check-input jedido-checkbox';
    _checkbox.type = 'checkbox';
    _checkbox.checked = checkState;
    _checkbox.id = 'cb-' + id;
    _checkbox.onclick = () => checkboxClickHandler(id);
    const label = document.createElement('label');
    label.className = 'form-check-label visually-hidden';
    label.htmlFor = 'cb-' + id;
    label.textContent = 'Toggle completed';
    wrapper.appendChild(_checkbox);
    wrapper.appendChild(label);
    return wrapper;
};

const checkboxClickHandler = (id) => {
    const item = todos.find(i => i.id === id);

    console_log('id: ' + id);
    console_log('item.id: ' + item.id);
    console_log('item.name: ' + item.name);
    console_log('jediDoTypeId: ' + item.jediDoTypeId);
    console_log('completed: ' + item.completed);

    document.getElementById('edit-id').value = id;
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-type').value = item.jediDoTypeId;
    document.getElementById('edit-Completed').checked = !item.completed;
    updateItem();
};

const console_log = (s) => {
    if (debug) console.log(s);
};

Init();
