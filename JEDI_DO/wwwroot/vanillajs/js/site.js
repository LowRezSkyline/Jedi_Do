const uri = '/api/JediDoItems';
const authUri = '/api/auth';
const button = document.createElement('button');
const debug = true;
let todos = [];
let tr = '';

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

    const switchUiBtn = document.getElementById('vanillajsSwitchUi');
    const dropdownEl = switchUiBtn && switchUiBtn.closest('.dropdown');
    if (dropdownEl) {
        if (typeof bootstrap !== 'undefined') {
            try { new bootstrap.Dropdown(switchUiBtn); } catch (_) {}
        }
        switchUiBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            dropdownEl.classList.toggle('show');
            const menu = dropdownEl.querySelector('.dropdown-menu');
            if (menu) menu.classList.toggle('show');
        });
        const menu = dropdownEl.querySelector('.dropdown-menu');
        if (menu) menu.addEventListener('click', function (e) { e.stopPropagation(); });
        document.addEventListener('click', function () {
            dropdownEl.classList.remove('show');
            const m = dropdownEl.querySelector('.dropdown-menu');
            if (m) m.classList.remove('show');
        });
    }

    const btnAdd = document.getElementById('btnAdd');
    const textboxAdd = document.getElementById('add-name');
    const inputHandler = () => {
        btnAdd.disabled = !textboxAdd?.value?.trim();
    };
    textboxAdd.addEventListener('input', inputHandler);
    textboxAdd.addEventListener('propertychange', inputHandler);
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

    const item = {
        id: parseInt(itemId, 10),
        completed: document.getElementById('edit-Completed').checked,
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
        document.getElementById('edit-Completed').checked = item.completed;
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
    document.getElementById('counter').innerText = `Total Records: ${itemCount}`;
};

const displayItems = (data) => {
    const tBody = document.getElementById('todos');
    tBody.innerHTML = '';

    SetDisplayCount(data.length);

    data.forEach(item => {
        const isCompleteCheckbox = CreateCheckBox(item.completed, item.id);
        const editButton = CreateButton('edit', `displayEditForm(${item.id})`);
        const deleteButton = CreateButton('x', `deleteItem(${item.id})`);
        const jediTask = (item.jediDoType + ' ' + item.name);
        let index = 0;

        tr = tBody.insertRow();
        CreateTD(index, isCompleteCheckbox, 'center jedido-checkbox');
        CreateTD(++index, document.createTextNode(jediTask), 'task-item');
        CreateTD(++index, editButton, 'jedido-edit-controls');
        CreateTD(++index, deleteButton, 'jedido-edit-controls');
    });
    todos = data;
};

const CreateTD = (index, element, cssclass) => {
    const _td = tr.insertCell(index);
    if (cssclass) _td.setAttribute('class', cssclass);
    _td.appendChild(element);
};

const CreateButton = (btnText, func) => {
    const _button = button.cloneNode(false);
    _button.innerText = btnText;
    _button.setAttribute('class', 'btn btn-sm btn-dark');
    _button.setAttribute('onclick', func);
    return _button;
};

const CreateCheckBox = (checkState, id) => {
    const _checkbox = document.createElement('input');
    _checkbox.setAttribute('class', 'jedido-checkbox');
    _checkbox.type = 'checkbox';
    _checkbox.checked = checkState;
    _checkbox.onclick = () => checkboxClickHandler(id);
    return _checkbox;
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
