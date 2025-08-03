import { TaskList } from './components/TaskList.js';
import { TaskForm } from './components/TaskForm.js';
import { TaskGenerator } from './components/TaskGenerator.js';
import { TaskDetail } from './components/TaskDetail.js';
import { TaskEdit } from './components/TaskEdit.js';

// Константы
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Состояние приложения
const appState = {
    currentView: 'tasks', // 'tasks', 'create', 'generate', 'task-detail', 'task-edit'
    currentTab: 'tasks',
    tasks: [],
    loading: false,
    currentTaskId: null
};

// Основной класс приложения
class TaskHubApp {
    constructor() {
        this.taskList = new TaskList(
            this.onTaskDelete.bind(this),
            this.onTaskView.bind(this),
            this.onTaskEdit.bind(this)
        );
        this.taskForm = new TaskForm(this.onTaskCreate.bind(this));
        this.taskGenerator = new TaskGenerator(this.onTaskGenerate.bind(this));
        this.taskDetail = new TaskDetail(
            this.onBackToList.bind(this),
            this.onTaskEdit.bind(this)
        );
        this.taskEdit = new TaskEdit(
            this.onTaskUpdate.bind(this),
            this.onBackToList.bind(this)
        );
        
        this.init();
    }

    init() {
        this.initTabs();
        this.loadTasks();
        this.renderComponents();
    }

    // Инициализация табов
    initTabs() {
        const tabButtons = {
            'tab-tasks': 'tasks',
            'tab-create': 'create', 
            'tab-generate': 'generate'
        };

        Object.entries(tabButtons).forEach(([buttonId, tabName]) => {
            document.getElementById(buttonId).addEventListener('click', () => {
                this.switchTab(tabName);
            });
        });

        // Кнопка обновления
        document.getElementById('refresh-tasks').addEventListener('click', () => {
            this.loadTasks();
        });
    }

    // Переключение табов
    switchTab(tabName) {
        // Обновляем состояние
        appState.currentTab = tabName;
        appState.currentView = tabName;

        this.updateNavigation();
        this.renderCurrentView();

        // Перезагружаем задачи если перешли на таб со списком
        if (tabName === 'tasks') {
            this.loadTasks();
        }
    }

    // Обновление навигации
    updateNavigation() {
        // Показываем/скрываем табы в зависимости от текущего вида
        const tabContainer = document.querySelector('.flex.space-x-1.bg-white.rounded-lg.p-1.shadow-sm');
        const showTabs = ['tasks', 'create', 'generate'].includes(appState.currentView);
        tabContainer.style.display = showTabs ? 'flex' : 'none';

        if (showTabs) {
            // Обновляем активную кнопку
            document.querySelectorAll('[id^="tab-"]').forEach(button => {
                button.className = 'px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors';
            });
            
            const activeTab = document.getElementById(`tab-${appState.currentTab}`);
            if (activeTab) {
                activeTab.className = 'px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white transition-colors';
            }
        }
    }

    // Отрисовка текущего вида
    renderCurrentView() {
        // Скрываем все секции контента
        document.querySelectorAll('.content-section, .dynamic-content').forEach(section => {
            section.classList.add('hidden');
        });

        // Получаем контейнер для динамического контента
        let dynamicContainer = document.getElementById('dynamic-content');
        if (!dynamicContainer) {
            dynamicContainer = document.createElement('div');
            dynamicContainer.id = 'dynamic-content';
            dynamicContainer.className = 'dynamic-content';
            document.querySelector('.container').appendChild(dynamicContainer);
        }

        switch (appState.currentView) {
            case 'tasks':
            case 'create':
            case 'generate':
                dynamicContainer.classList.add('hidden');
                document.getElementById(`content-${appState.currentView}`).classList.remove('hidden');
                break;
            case 'task-detail':
                dynamicContainer.classList.remove('hidden');
                this.taskDetail.render(dynamicContainer, appState.currentTaskId);
                break;
            case 'task-edit':
                dynamicContainer.classList.remove('hidden');
                this.taskEdit.render(dynamicContainer, appState.currentTaskId);
                break;
        }
    }

    // Отрисовка компонентов
    renderComponents() {
        // Отрисовываем список задач
        this.taskList.render(document.getElementById('tasks-container'), appState.tasks);
        
        // Отрисовываем форму создания
        this.taskForm.render(document.getElementById('task-form-container'));
        
        // Отрисовываем AI генератор
        this.taskGenerator.render(document.getElementById('task-generator-container'));
    }

    // Загрузка задач
    async loadTasks() {
        try {
            this.setLoading(true);
            const response = await fetch(`${API_BASE_URL}/tasks`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const tasks = await response.json();
            appState.tasks = tasks;
            
            // Обновляем список задач
            this.taskList.render(document.getElementById('tasks-container'), tasks);
            
            this.showNotification('Задачи загружены успешно', 'success');
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
            this.showNotification(`Ошибка загрузки задач: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Обработчик создания задачи
    async onTaskCreate(taskData) {
        try {
            this.setLoading(true);
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const newTask = await response.json();
            appState.tasks.unshift(newTask); // Добавляем в начало
            
            this.showNotification('Задача создана успешно', 'success');
            
            // Переключаемся на список задач
            this.switchTab('tasks');
            
        } catch (error) {
            console.error('Ошибка создания задачи:', error);
            this.showNotification(`Ошибка создания задачи: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Обработчик удаления задачи
    async onTaskDelete(taskId) {
        if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
            return;
        }

        try {
            this.setLoading(true);
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Удаляем из состояния
            appState.tasks = appState.tasks.filter(task => task.id !== taskId);
            
            // Обновляем список
            this.taskList.render(document.getElementById('tasks-container'), appState.tasks);
            
            this.showNotification('Задача удалена успешно', 'success');
        } catch (error) {
            console.error('Ошибка удаления задачи:', error);
            this.showNotification(`Ошибка удаления задачи: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Обработчик генерации задачи
    async onTaskGenerate(topic) {
        try {
            this.setLoading(true);
            const response = await fetch(`${API_BASE_URL}/tasks/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const generatedTask = await response.json();
            this.showNotification('Задача сгенерирована успешно', 'success');
            
            return generatedTask;
        } catch (error) {
            console.error('Ошибка генерации задачи:', error);
            this.showNotification(`Ошибка генерации задачи: ${error.message}`, 'error');
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Обработчик просмотра задачи
    onTaskView(taskId) {
        appState.currentView = 'task-detail';
        appState.currentTaskId = taskId;
        this.updateNavigation();
        this.renderCurrentView();
    }

    // Обработчик редактирования задачи
    onTaskEdit(taskId) {
        appState.currentView = 'task-edit';
        appState.currentTaskId = taskId;
        this.updateNavigation();
        this.renderCurrentView();
    }

    // Обработчик возврата к списку
    onBackToList() {
        appState.currentView = 'tasks';
        appState.currentTab = 'tasks';
        appState.currentTaskId = null;
        this.updateNavigation();
        this.renderCurrentView();
        this.loadTasks(); // Перезагружаем список задач
    }

    // Обработчик обновления задачи
    onTaskUpdate(updatedTask) {
        // Обновляем задачу в состоянии
        const taskIndex = appState.tasks.findIndex(task => task.id === updatedTask.id);
        if (taskIndex !== -1) {
            appState.tasks[taskIndex] = updatedTask;
        }

        this.showNotification('Задача успешно обновлена', 'success');
        
        // Возвращаемся к списку задач
        this.onBackToList();
    }

    // Управление состоянием загрузки
    setLoading(loading) {
        appState.loading = loading;
        document.body.classList.toggle('loading', loading);
    }

    // Показ уведомлений
    showNotification(message, type = 'info') {
        const notificationsContainer = document.getElementById('notifications');
        const notification = document.createElement('div');
        
        const typeStyles = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-black'
        };

        notification.className = `${typeStyles[type]} px-4 py-3 rounded-md shadow-lg transform transition-all duration-300 translate-x-full`;
        notification.textContent = message;

        notificationsContainer.appendChild(notification);

        // Анимация появления
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notificationsContainer.removeChild(notification);
            }, 300);
        }, 5000);
    }
}

// Глобальные обработчики событий
window.addEventListener('navigateToTask', (e) => {
    const taskId = e.detail.taskId;
    const app = window.taskHubApp;
    if (app) {
        app.onTaskView(taskId);
    }
});

window.addEventListener('showNotification', (e) => {
    const { message, type } = e.detail;
    const app = window.taskHubApp;
    if (app) {
        app.showNotification(message, type);
    }
});

// Инициализация приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.taskHubApp = new TaskHubApp();
});