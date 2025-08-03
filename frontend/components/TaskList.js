export class TaskList {
    constructor(onTaskDelete, onTaskView, onTaskEdit) {
        this.onTaskDelete = onTaskDelete;
        this.onTaskView = onTaskView;
        this.onTaskEdit = onTaskEdit;
    }

    render(container, tasks) {
        container.innerHTML = '';

        if (!tasks || tasks.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-card bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors';

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

        taskDiv.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1 mr-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">${this.escapeHtml(task.title)}</h3>
                    ${task.description ? `<p class="text-gray-600 text-sm mb-3">${this.escapeHtml(this.truncateText(task.description, 150))}</p>` : ''}
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status] || statusColors.TODO}">
                        ${statusLabels[task.status] || task.status}
                    </span>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <div class="text-xs text-gray-500">
                    <span>ID: ${task.id}</span>
                    ${task.createdAt ? ` • <span>Создано: ${this.formatDate(task.createdAt)}</span>` : ''}
                    ${task.updatedAt && task.updatedAt !== task.createdAt ? ` • <span>Обновлено: ${this.formatDate(task.updatedAt)}</span>` : ''}
                </div>
                <div class="flex space-x-2">
                    <button 
                        class="view-btn px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                        data-task-id="${task.id}"
                        title="Подробнее"
                    >
                        Подробнее
                    </button>
                    <button 
                        class="edit-btn px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
                        data-task-id="${task.id}"
                        title="Редактировать задачу"
                    >
                        Редактировать
                    </button>
                    <button 
                        class="delete-btn text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        data-task-id="${task.id}"
                        title="Удалить задачу"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Добавляем обработчики для кнопок
        const deleteBtn = taskDiv.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onTaskDelete(task.id);
        });

        const viewBtn = taskDiv.querySelector('.view-btn');
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onTaskView(task.id);
        });

        const editBtn = taskDiv.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onTaskEdit(task.id);
        });

        return taskDiv;
    }

    renderEmptyState() {
        return `
            <div class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Нет задач</h3>
                <p class="mt-1 text-sm text-gray-500">Начните с создания новой задачи или сгенерируйте её с помощью AI.</p>
                <div class="mt-6">
                    <button 
                        id="create-first-task" 
                        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                        </svg>
                        Создать первую задачу
                    </button>
                </div>
            </div>
        `;
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
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    }
}