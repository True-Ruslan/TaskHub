export class TaskForm {
    constructor(onTaskCreate) {
        this.onTaskCreate = onTaskCreate;
        this.form = null;
    }

    render(container) {
        container.innerHTML = '';
        
        const formDiv = document.createElement('div');
        formDiv.innerHTML = `
            <form id="task-create-form" class="space-y-6">
                <div>
                    <label for="task-title" class="block text-sm font-medium text-gray-700 mb-2">
                        Заголовок задачи *
                    </label>
                    <input 
                        type="text" 
                        id="task-title" 
                        name="title"
                        required
                        maxlength="255"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Введите заголовок задачи..."
                    >
                    <p class="mt-1 text-xs text-gray-500">Максимум 255 символов</p>
                </div>

                <div>
                    <label for="task-description" class="block text-sm font-medium text-gray-700 mb-2">
                        Описание задачи
                    </label>
                    <textarea 
                        id="task-description" 
                        name="description"
                        rows="6"
                        maxlength="1000"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                        placeholder="Опишите детали задачи..."
                    ></textarea>
                    <p class="mt-1 text-xs text-gray-500">Максимум 1000 символов (необязательно)</p>
                </div>

                <div class="flex space-x-4">
                    <button 
                        type="submit" 
                        class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        id="submit-btn"
                    >
                        <span class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Создать задачу
                        </span>
                    </button>
                    <button 
                        type="button" 
                        id="clear-btn"
                        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        Очистить
                    </button>
                </div>
            </form>

            <!-- Превью задачи -->
            <div id="task-preview" class="hidden mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 class="text-sm font-medium text-gray-900 mb-2">Превью задачи:</h4>
                <div id="preview-content" class="text-sm text-gray-700">
                    <!-- Превью будет здесь -->
                </div>
            </div>
        `;

        container.appendChild(formDiv);
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.form = document.getElementById('task-create-form');
        const titleInput = document.getElementById('task-title');
        const descriptionInput = document.getElementById('task-description');
        const clearBtn = document.getElementById('clear-btn');
        const preview = document.getElementById('task-preview');
        const previewContent = document.getElementById('preview-content');

        // Обработчик отправки формы
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });

        // Кнопка очистки
        clearBtn.addEventListener('click', () => {
            this.clearForm();
        });

        // Превью задачи в реальном времени
        const updatePreview = () => {
            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();

            if (title || description) {
                preview.classList.remove('hidden');
                previewContent.innerHTML = `
                    <div class="space-y-2">
                        ${title ? `<div><strong>Заголовок:</strong> ${this.escapeHtml(title)}</div>` : ''}
                        ${description ? `<div><strong>Описание:</strong> ${this.escapeHtml(description)}</div>` : ''}
                    </div>
                `;
            } else {
                preview.classList.add('hidden');
            }
        };

        titleInput.addEventListener('input', updatePreview);
        descriptionInput.addEventListener('input', updatePreview);

        // Счетчик символов
        this.addCharacterCounters();
    }

    addCharacterCounters() {
        const titleInput = document.getElementById('task-title');
        const descriptionInput = document.getElementById('task-description');

        // Счетчик для заголовка
        const titleCounter = document.createElement('div');
        titleCounter.className = 'text-right text-xs text-gray-400 mt-1';
        titleInput.parentNode.appendChild(titleCounter);

        // Счетчик для описания
        const descriptionCounter = document.createElement('div');
        descriptionCounter.className = 'text-right text-xs text-gray-400 mt-1';
        descriptionInput.parentNode.appendChild(descriptionCounter);

        const updateCounters = () => {
            titleCounter.textContent = `${titleInput.value.length}/255`;
            descriptionCounter.textContent = `${descriptionInput.value.length}/1000`;
            
            // Меняем цвет при приближении к лимиту
            titleCounter.className = `text-right text-xs mt-1 ${titleInput.value.length > 200 ? 'text-orange-500' : 'text-gray-400'}`;
            descriptionCounter.className = `text-right text-xs mt-1 ${descriptionInput.value.length > 800 ? 'text-orange-500' : 'text-gray-400'}`;
        };

        titleInput.addEventListener('input', updateCounters);
        descriptionInput.addEventListener('input', updateCounters);
        updateCounters(); // Инициализация
    }

    async handleSubmit() {
        const formData = new FormData(this.form);
        const taskData = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim() || null
        };

        // Валидация
        if (!taskData.title) {
            this.showError('Заголовок задачи обязателен');
            return;
        }

        if (taskData.title.length > 255) {
            this.showError('Заголовок не может быть длиннее 255 символов');
            return;
        }

        if (taskData.description && taskData.description.length > 1000) {
            this.showError('Описание не может быть длиннее 1000 символов');
            return;
        }

        // Отключаем кнопку во время отправки
        const submitBtn = document.getElementById('submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Создаем...
            </span>
        `;

        try {
            await this.onTaskCreate(taskData);
            this.clearForm();
        } catch (error) {
            this.showError('Ошибка при создании задачи');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    clearForm() {
        this.form.reset();
        document.getElementById('task-preview').classList.add('hidden');
        this.clearError();
        
        // Обновляем счетчики
        document.getElementById('task-title').dispatchEvent(new Event('input'));
        document.getElementById('task-description').dispatchEvent(new Event('input'));
    }

    showError(message) {
        this.clearError();
        const errorDiv = document.createElement('div');
        errorDiv.id = 'form-error';
        errorDiv.className = 'mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600';
        errorDiv.textContent = message;
        this.form.appendChild(errorDiv);
    }

    clearError() {
        const existingError = document.getElementById('form-error');
        if (existingError) {
            existingError.remove();
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}