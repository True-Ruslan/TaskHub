export class TaskEdit {
    constructor(onTaskUpdate, onCancel) {
        this.onTaskUpdate = onTaskUpdate;
        this.onCancel = onCancel;
        this.task = null;
    }

    async loadTask(taskId) {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/tasks/${taskId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            this.task = await response.json();
            return this.task;
        } catch (error) {
            console.error('Ошибка загрузки задачи:', error);
            throw error;
        }
    }

    async updateTask(taskId, taskData) {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка обновления задачи:', error);
            throw error;
        }
    }

    render(container, taskId) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm">
                <div class="p-6">
                    <div id="task-edit-loading" class="text-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p class="mt-2 text-gray-600">Загрузка задачи...</p>
                    </div>
                    <div id="task-edit-content" class="hidden">
                        <!-- Форма редактирования будет загружена сюда -->
                    </div>
                    <div id="task-edit-error" class="hidden text-center py-8">
                        <div class="text-red-500 mb-4">
                            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
                        <p class="text-gray-600 mb-4">Не удалось загрузить информацию о задаче</p>
                        <button id="retry-load" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.loadAndRenderForm(taskId);
    }

    async loadAndRenderForm(taskId) {
        const loadingEl = document.getElementById('task-edit-loading');
        const contentEl = document.getElementById('task-edit-content');
        const errorEl = document.getElementById('task-edit-error');

        try {
            loadingEl.classList.remove('hidden');
            contentEl.classList.add('hidden');
            errorEl.classList.add('hidden');

            await this.loadTask(taskId);
            this.renderEditForm();

            loadingEl.classList.add('hidden');
            contentEl.classList.remove('hidden');
        } catch (error) {
            loadingEl.classList.add('hidden');
            errorEl.classList.remove('hidden');

            // Добавляем обработчик для кнопки повтора
            const retryBtn = document.getElementById('retry-load');
            retryBtn.addEventListener('click', () => {
                this.loadAndRenderForm(taskId);
            });
        }
    }

    renderEditForm() {
        const contentEl = document.getElementById('task-edit-content');
        
        contentEl.innerHTML = `
            <!-- Заголовок -->
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Редактирование задачи</h1>
                <button 
                    id="cancel-edit" 
                    class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    Отмена
                </button>
            </div>

            <!-- Форма редактирования -->
            <form id="edit-task-form" class="space-y-6">
                <div>
                    <label for="task-title" class="block text-sm font-medium text-gray-700 mb-1">
                        Название задачи *
                    </label>
                    <input 
                        type="text" 
                        id="task-title" 
                        name="title"
                        value="${this.escapeHtml(this.task.title || '')}"
                        required 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Введите название задачи"
                    >
                </div>

                <div>
                    <label for="task-description" class="block text-sm font-medium text-gray-700 mb-1">
                        Описание
                    </label>
                    <textarea 
                        id="task-description" 
                        name="description"
                        rows="8"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Введите описание задачи (поддерживается Markdown)"
                    >${this.escapeHtml(this.task.description || '')}</textarea>
                    <p class="mt-1 text-xs text-gray-500">
                        Поддерживается форматирование Markdown (заголовки, списки, ссылки и т.д.)
                    </p>
                </div>

                <div>
                    <label for="task-status" class="block text-sm font-medium text-gray-700 mb-1">
                        Статус
                    </label>
                    <select 
                        id="task-status" 
                        name="status"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="TODO" ${this.task.status === 'TODO' ? 'selected' : ''}>К выполнению</option>
                        <option value="IN_PROGRESS" ${this.task.status === 'IN_PROGRESS' ? 'selected' : ''}>В работе</option>
                        <option value="DONE" ${this.task.status === 'DONE' ? 'selected' : ''}>Выполнено</option>
                        <option value="CANCELLED" ${this.task.status === 'CANCELLED' ? 'selected' : ''}>Отменено</option>
                    </select>
                </div>

                <!-- Превью описания -->
                <div id="description-preview" class="hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Превью описания
                    </label>
                    <div class="bg-gray-50 rounded-lg p-4 markdown-content prose max-w-none">
                        <!-- Превью будет отображаться здесь -->
                    </div>
                </div>

                <!-- Кнопки -->
                <div class="flex justify-between">
                    <div class="flex space-x-2">
                        <button 
                            type="button" 
                            id="preview-toggle"
                            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Показать превью
                        </button>
                    </div>
                    <div class="flex space-x-2">
                        <button 
                            type="button" 
                            id="cancel-edit-2"
                            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Отмена
                        </button>
                        <button 
                            type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            Сохранить изменения
                        </button>
                    </div>
                </div>
            </form>

            <!-- Индикатор сохранения -->
            <div id="save-indicator" class="hidden fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
                Сохранение...
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Обработчик отмены
        const cancelBtns = document.querySelectorAll('#cancel-edit, #cancel-edit-2');
        cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.onCancel();
            });
        });

        // Обработчик отправки формы
        const form = document.getElementById('edit-task-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });

        // Превью описания
        const previewToggle = document.getElementById('preview-toggle');
        const previewDiv = document.getElementById('description-preview');
        const descriptionTextarea = document.getElementById('task-description');
        let previewVisible = false;

        previewToggle.addEventListener('click', () => {
            previewVisible = !previewVisible;
            
            if (previewVisible) {
                const description = descriptionTextarea.value;
                const previewContent = description ? marked.parse(description) : '<p class="text-gray-500 italic">Нет содержимого для превью</p>';
                previewDiv.querySelector('.markdown-content').innerHTML = previewContent;
                previewDiv.classList.remove('hidden');
                previewToggle.textContent = 'Скрыть превью';
            } else {
                previewDiv.classList.add('hidden');
                previewToggle.textContent = 'Показать превью';
            }
        });
    }

    async handleSubmit() {
        const form = document.getElementById('edit-task-form');
        const formData = new FormData(form);
        const saveIndicator = document.getElementById('save-indicator');

        const taskData = {
            id: this.task.id,
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            status: formData.get('status'),
            createdAt: this.task.createdAt,
            updatedAt: new Date().toISOString()
        };

        // Валидация
        if (!taskData.title) {
            alert('Название задачи обязательно для заполнения');
            return;
        }

        try {
            saveIndicator.classList.remove('hidden');
            
            const updatedTask = await this.updateTask(this.task.id, taskData);
            
            // Уведомляем родительский компонент об успешном обновлении
            this.onTaskUpdate(updatedTask);
            
        } catch (error) {
            alert(`Ошибка при сохранении задачи: ${error.message}`);
        } finally {
            saveIndicator.classList.add('hidden');
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}