const uri = 'api/JediDoItems';
const button = document.createElement('button');
const debug = true;
let todos = [];
let tr = '';

const Init = () => {

    // hide the edit controls on initial load
    document.getElementById('editForm').style.display = 'none';

    // load the items
    getItems();

    // setup the textbox handler for add button enable/disable state change
    const btnAdd = document.getElementById('btnAdd');
    const textboxAdd = document.getElementById('add-name');
    const inputHandler = (e) => { (textboxAdd) ? btnAdd.removeAttribute('disabled') : btnAdd.setAttribute('disabled', ''); }
    textboxAdd.addEventListener('input', inputHandler);
    textboxAdd.addEventListener('propertychange', inputHandler); // for IE8

}

const getItems =() => {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayItems(data))
        .catch(error => console_log('Unable to get items.', error));
}

const save = (typeId) => {
    console_log('save called (typeId: ' + typeId +')');
    (typeId == 0) ?  addItem() : updateItem();
}

const addItem = () => {
    const addNameTextbox = document.getElementById('add-name');
    const addTypeDropDown = document.getElementById('add-type')
    let addType = addTypeDropDown.options[addTypeDropDown.selectedIndex].value;
    console_log('addType: ' + addType);

    const item = {
        completed: false,
        jediDoTypeId: parseInt(addType),
        name: addNameTextbox.value.trim()
    };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => response.json())
        .then(() => {
            getItems();
            addNameTextbox.value = '';
            btnAdd.setAttribute('disabled', '');
        })
        .catch(error => console.error('Unable to add item.', error));
}

const updateItem = () => {
    console_log('updateItem called'); 

    const itemId = document.getElementById('edit-id').value;
    const addTypeDropDown = document.getElementById('edit-type')
    let editType = addTypeDropDown.options[addTypeDropDown.selectedIndex].value;

    const item = {
        id: parseInt(itemId, 10),
        Completed: document.getElementById('edit-Completed').checked,
        jediDoTypeId: parseInt(editType),
        name: document.getElementById('edit-name').value.trim()
    };

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(() => {
            getItems();
            displayEditForm(0);
        })  
        .catch(error => console.error('Unable to update item.', error));

    closeInput();

    return false;
}

const deleteItem = (id) => {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(() => getItems())
        .catch(error => console.error('Unable to delete item.', error));
}

const displayEditForm = (id)=> {

    if (id<1) {
        document.getElementById('addForm').style.display = '';
    } else {
        const item = todos.find(item => item.id === id);
        console_log('id: ' + id);
        document.getElementById('edit-name').value = item.name;
        document.getElementById('edit-id').value = item.id;
        document.getElementById('edit-Completed').checked = item.Completed;
        document.getElementById('editForm').style.display = '';
        document.getElementById('addForm').style.display = 'none';
    }



}

const closeInput = () => {
    document.getElementById('editForm').style.display = 'none';
    displayEditForm(0);
}

const SetDisplayCount = (itemCount) => {
    const name ='Total Records: ';
    document.getElementById('counter').innerText = `${name} ${itemCount}`;
}

const _displayItems = (data) => {
    const tBody = document.getElementById('todos');
    tBody.innerHTML = '';

    SetDisplayCount(data.length);

    data.forEach(item => {
        let isCompleteCheckbox = CreateCheckBox(item.completed, item.id);
        let editButton = CreateButton('edit', `displayEditForm(${item.id})`);
        let deleteButton = CreateButton('x', `deleteItem(${item.id})`);
        let jediTask = (item.jediDoType + ' ' + item.name );
        let index = 0;

        tr = tBody.insertRow();
        CreateTD(index, isCompleteCheckbox, 'center jedido-checkbox');
        CreateTD(++index, document.createTextNode(jediTask), 'task-item');
        CreateTD(++index, editButton, 'jedido-edit-controls');
        CreateTD(++index, deleteButton, 'jedido-edit-controls');
    });
  todos = data;
}

const CreateTD = (index, element, cssclass) => {
    let _td = tr.insertCell(index);
    if (cssclass)
        _td.setAttribute('class', cssclass)
    _td.appendChild(element);
}

const CreateButton = (btnText, func) => {
    let _button = button.cloneNode(false);
    _button.innerText = btnText;
    _button.setAttribute('class', 'btn btn-sm btn-dark');
    _button.setAttribute('onclick', func);
    return _button;
}

const CreateCheckBox = (checkState, id) => {
    let _checkbox = document.createElement('input');
    _checkbox.setAttribute('class', 'jedido-checkbox')
    _checkbox.type = 'checkbox';
    _checkbox.checked = checkState;
    _checkbox.onclick = function (e) { checkboxClickHandler(id) } 
    return _checkbox;
}

const checkboxClickHandler = (id) => {
    const item = todos.find(item => item.id === id);
    if(debug)
    {
        console_log('id: ' + id);
        console_log('item.id: ' + item.id);
        console_log('tester: ' + item.name);
        console_log('jediDoTypeId: ' + item.jediDoTypeId);
        console_log('Completed: ' + item.completed);
    }

    document.getElementById("edit-id").value = id;
    document.getElementById("edit-name").value = item.name;
    document.getElementById("edit-type").value = item.jediDoTypeId;
    document.getElementById("edit-Completed").checked = !item.completed; 
    updateItem();
    
}

const console_log = (s) => {
    if (debug) {
        console.log(s);
    }
}