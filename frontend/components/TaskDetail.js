export class TaskDetail {
    constructor(onBackToList, onEditTask) {
        this.onBackToList = onBackToList;
        this.onEditTask = onEditTask;
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

    render(container, taskId) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm">
                <div class="p-6">
                    <div id="task-detail-loading" class="text-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p class="mt-2 text-gray-600">Загрузка задачи...</p>
                    </div>
                    <div id="task-detail-content" class="hidden">
                        <!-- Контент задачи будет загружен сюда -->
                    </div>
                    <div id="task-detail-error" class="hidden text-center py-8">
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

        this.loadAndRenderTask(taskId);
    }

    async loadAndRenderTask(taskId) {
        const loadingEl = document.getElementById('task-detail-loading');
        const contentEl = document.getElementById('task-detail-content');
        const errorEl = document.getElementById('task-detail-error');

        try {
            loadingEl.classList.remove('hidden');
            contentEl.classList.add('hidden');
            errorEl.classList.add('hidden');

            await this.loadTask(taskId);
            this.renderTaskContent();

            loadingEl.classList.add('hidden');
            contentEl.classList.remove('hidden');
        } catch (error) {
            loadingEl.classList.add('hidden');
            errorEl.classList.remove('hidden');

            // Добавляем обработчик для кнопки повтора
            const retryBtn = document.getElementById('retry-load');
            retryBtn.addEventListener('click', () => {
                this.loadAndRenderTask(taskId);
            });
        }
    }

    renderTaskContent() {
        const contentEl = document.getElementById('task-detail-content');
        
        const statusColors = {
            'TODO': 'bg-gray-100 text-gray-800',
            'IN_PROGRESS': 'bg-blue-100 text-blue-800',
            'DONE': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800'
        };

        const statusLabels = {
            'TODO': 'К выполнению',
            'IN_PROGRESS': 'В работе',
            'DONE': 'Выполнено',
            'CANCELLED': 'Отменено'
        };

        const descriptionHtml = this.task.description 
            ? `<div class="markdown-content prose max-w-none">${marked.parse(this.task.description)}</div>`
            : '<p class="text-gray-500 italic">Описание отсутствует</p>';

        contentEl.innerHTML = `
            <!-- Заголовок и навигация -->
            <div class="flex items-center justify-between mb-6">
                <button 
                    id="back-to-list" 
                    class="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Назад к списку
                </button>
                <div class="flex space-x-2">
                    <button 
                        id="edit-task-btn" 
                        class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
                    >
                        Редактировать
                    </button>
                </div>
            </div>

            <!-- Основная информация -->
            <div class="mb-6">
                <div class="flex items-start justify-between mb-4">
                    <h1 class="text-2xl font-bold text-gray-900">${this.escapeHtml(this.task.title)}</h1>
                    <span class="px-3 py-1 text-sm font-medium rounded-full ${statusColors[this.task.status] || statusColors.TODO}">
                        ${statusLabels[this.task.status] || this.task.status}
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-6">
                    <div>
                        <span class="font-medium">ID:</span> ${this.task.id}
                    </div>
                    ${this.task.createdAt ? `
                    <div>
                        <span class="font-medium">Создано:</span> ${this.formatDate(this.task.createdAt)}
                    </div>
                    ` : ''}
                    ${this.task.updatedAt && this.task.updatedAt !== this.task.createdAt ? `
                    <div>
                        <span class="font-medium">Обновлено:</span> ${this.formatDate(this.task.updatedAt)}
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Описание -->
            <div class="mb-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-3">Описание</h2>
                <div class="bg-gray-50 rounded-lg p-4">
                    ${descriptionHtml}
                </div>
            </div>
        `;

        // Добавляем обработчики событий
        document.getElementById('back-to-list').addEventListener('click', () => {
            this.onBackToList();
        });

        document.getElementById('edit-task-btn').addEventListener('click', () => {
            this.onEditTask(this.task.id);
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }
}