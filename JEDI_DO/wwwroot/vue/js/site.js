const { createApp } = Vue;

createApp({
    data() {
        return {
            uri: '/api/JediDoItems',
            items: [],
            newName: '',
            newTypeId: 1,
            editing: false,
            editForm: { id: 0, name: '', completed: false, jediDoTypeId: 1 },
            deleteConfirmItem: null,
            deleteModal: null
        };
    },
    mounted() {
        this.loadItems();
    },
    methods: {
        async apiFetch(url, options = {}) {
            const res = await fetch(url, { credentials: 'include', ...options });
            if (res.status === 401) {
                const returnUrl = encodeURIComponent(window.location.pathname);
                window.location.href = '/login/?returnUrl=' + returnUrl;
                throw new Error('Unauthorized');
            }
            return res;
        },
        async loadItems() {
            try {
                const res = await this.apiFetch(this.uri);
                this.items = await res.json();
            } catch (e) {
                if (e.message !== 'Unauthorized') console.error('Unable to get items.', e);
            }
        },
        async addItem() {
            if (!this.newName.trim()) return;
            try {
                await this.apiFetch(this.uri, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: this.newName.trim(), jediDoTypeId: this.newTypeId, completed: false })
                });
                this.newName = '';
                this.newTypeId = 1;
                await this.loadItems();
            } catch (e) {
                if (e.message !== 'Unauthorized') console.error('Unable to add item.', e);
            }
        },
        startEdit(item) {
            this.editForm = { id: item.id, name: item.name, completed: item.completed, jediDoTypeId: item.jediDoTypeId };
            this.editing = true;
        },
        async saveEdit() {
            try {
                await this.apiFetch(`${this.uri}/${this.editForm.id}`, {
                    method: 'PUT',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: this.editForm.id,
                        name: this.editForm.name.trim(),
                        completed: this.editForm.completed,
                        jediDoTypeId: this.editForm.jediDoTypeId
                    })
                });
                this.editing = false;
                await this.loadItems();
            } catch (e) {
                if (e.message !== 'Unauthorized') console.error('Unable to update item.', e);
            }
        },
        async toggleComplete(item) {
            try {
                await this.apiFetch(`${this.uri}/${item.id}`, {
                    method: 'PUT',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: item.id,
                        name: item.name,
                        completed: !item.completed,
                        jediDoTypeId: item.jediDoTypeId
                    })
                });
                await this.loadItems();
            } catch (e) {
                if (e.message !== 'Unauthorized') console.error('Unable to update item.', e);
            }
        },
        showDeleteConfirm(item) {
            this.deleteConfirmItem = item;
            if (!this.deleteModal) this.deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
            this.deleteModal.show();
        },
        async confirmDelete() {
            if (!this.deleteConfirmItem) return;
            const id = this.deleteConfirmItem.id;
            this.deleteConfirmItem = null;
            if (this.deleteModal) this.deleteModal.hide();
            try {
                await this.apiFetch(`${this.uri}/${id}`, { method: 'DELETE' });
                await this.loadItems();
            } catch (e) {
                if (e.message !== 'Unauthorized') console.error('Unable to delete item.', e);
            }
        },
        async logout() {
            try {
                await this.apiFetch('/api/auth/logout', { method: 'POST' });
            } catch (_) {}
            window.location.href = '/login/';
        }
    }
}).mount('#app');
