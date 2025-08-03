export class TaskGenerator {
    constructor(onTaskGenerate) {
        this.onTaskGenerate = onTaskGenerate;
        this.form = null;
        this.generatedTask = null;
    }

    render(container) {
        container.innerHTML = '';
        
        const generatorDiv = document.createElement('div');
        generatorDiv.innerHTML = `
            <div class="space-y-6">
                <!-- Форма генерации -->
                <form id="task-generate-form" class="space-y-4">
                    <div>
                        <label for="task-topic" class="block text-sm font-medium text-gray-700 mb-2">
                            Тема для генерации задачи *
                        </label>
                        <input 
                            type="text" 
                            id="task-topic" 
                            name="topic"
                            required
                            maxlength="255"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Например: Kafka Consumer на Java, REST API для пользователей..."
                        >
                        <p class="mt-1 text-xs text-gray-500">Опишите тему, по которой нужно сгенерировать техническую задачу</p>
                        <div id="topic-counter" class="text-right text-xs text-gray-400 mt-1">0/255</div>
                    </div>

                    <button 
                        type="submit" 
                        class="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        id="generate-btn"
                    >
                        <span class="flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            Сгенерировать задачу с помощью AI
                        </span>
                    </button>
                </form>

                <!-- Результат генерации -->
                <div id="generation-result" class="hidden">
                    <div class="border-t border-gray-200 pt-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Сгенерированная задача</h3>
                        
                        <div id="generated-content" class="space-y-4">
                            <!-- Контент будет здесь -->
                        </div>

                        <div class="mt-6 flex space-x-3">
                            <button 
                                id="use-generated-btn"
                                class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                            >
                                <span class="flex items-center justify-center">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Создать задачу из этого контента
                                </span>
                            </button>
                            <button 
                                id="copy-generated-btn"
                                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                <span class="flex items-center justify-center">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                    </svg>
                                    Копировать
                                </span>
                            </button>
                            <button 
                                id="regenerate-btn"
                                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                <span class="flex items-center justify-center">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    Перегенерировать
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Примеры тем -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 class="text-sm font-medium text-blue-900 mb-2">💡 Примеры тем для генерации:</h4>
                    <div class="space-y-1 text-sm text-blue-800">
                        <button class="example-topic block text-left hover:text-blue-600 transition-colors" data-topic="Kafka Consumer на Java для обработки заказов">
                            • Kafka Consumer на Java для обработки заказов
                        </button>
                        <button class="example-topic block text-left hover:text-blue-600 transition-colors" data-topic="REST API для управления пользователями с аутентификацией">
                            • REST API для управления пользователями с аутентификацией
                        </button>
                        <button class="example-topic block text-left hover:text-blue-600 transition-colors" data-topic="React компонент для загрузки файлов с прогресс-баром">
                            • React компонент для загрузки файлов с прогресс-баром
                        </button>
                        <button class="example-topic block text-left hover:text-blue-600 transition-colors" data-topic="Система кэширования с Redis для веб-приложения">
                            • Система кэширования с Redis для веб-приложения
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(generatorDiv);
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.form = document.getElementById('task-generate-form');
        const topicInput = document.getElementById('task-topic');
        const topicCounter = document.getElementById('topic-counter');

        // Обработчик отправки формы
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleGenerate();
        });

        // Счетчик символов
        topicInput.addEventListener('input', () => {
            const length = topicInput.value.length;
            topicCounter.textContent = `${length}/255`;
            topicCounter.className = `text-right text-xs mt-1 ${length > 200 ? 'text-orange-500' : 'text-gray-400'}`;
        });

        // Примеры тем
        document.querySelectorAll('.example-topic').forEach(button => {
            button.addEventListener('click', () => {
                topicInput.value = button.dataset.topic;
                topicInput.dispatchEvent(new Event('input'));
                topicInput.focus();
            });
        });
    }

    async handleGenerate() {
        const formData = new FormData(this.form);
        const topic = formData.get('topic').trim();

        // Валидация
        if (!topic) {
            this.showError('Тема для генерации обязательна');
            return;
        }

        if (topic.length > 255) {
            this.showError('Тема не может быть длиннее 255 символов');
            return;
        }

        // Отключаем кнопку во время генерации
        const generateBtn = document.getElementById('generate-btn');
        const originalText = generateBtn.innerHTML;
        generateBtn.disabled = true;
        generateBtn.innerHTML = `
            <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Генерируем задачу...
            </span>
        `;

        this.clearError();

        try {
            this.generatedTask = await this.onTaskGenerate(topic);
            this.displayGeneratedTask(this.generatedTask);
        } catch (error) {
            this.showError('Ошибка при генерации задачи. Попробуйте еще раз.');
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalText;
        }
    }

    displayGeneratedTask(generatedTask) {
        const resultContainer = document.getElementById('generation-result');
        const contentContainer = document.getElementById('generated-content');

        // Парсим сгенерированный контент для извлечения заголовка и описания
        const parsedTask = this.parseGeneratedContent(generatedTask.content);

        contentContainer.innerHTML = `
            <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="mb-3">
                    <span class="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        AI Сгенерировано
                    </span>
                    <span class="text-xs text-gray-500 ml-2">
                        Тема: ${this.escapeHtml(generatedTask.originalTopic)}
                    </span>
                </div>
                
                ${parsedTask.title ? `
                    <div class="mb-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-1">Предлагаемый заголовок:</h4>
                        <div class="text-lg font-medium text-gray-900">${this.escapeHtml(parsedTask.title)}</div>
                    </div>
                ` : ''}
                
                <div>
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Сгенерированное описание:</h4>
                    <div class="text-sm text-gray-800 markdown-content bg-gray-50 p-3 rounded border max-h-96 overflow-y-auto">
${this.renderMarkdown(parsedTask.description || generatedTask.content)}
                    </div>
                </div>
            </div>
        `;

        resultContainer.classList.remove('hidden');
        this.attachResultEventListeners(parsedTask);

        // Прокручиваем к результату
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    attachResultEventListeners(parsedTask) {
        // Кнопка "Создать задачу"
        document.getElementById('use-generated-btn').addEventListener('click', async () => {
            const taskData = {
                title: parsedTask.title || `AI: ${this.generatedTask.originalTopic}`,
                description: parsedTask.description || this.generatedTask.content
            };

            try {
                // Используем родительский обработчик создания задачи через глобальное событие
                window.dispatchEvent(new CustomEvent('createTaskFromGenerated', { detail: taskData }));
            } catch (error) {
                this.showError('Ошибка при создании задачи');
            }
        });

        // Кнопка "Копировать"
        document.getElementById('copy-generated-btn').addEventListener('click', () => {
            const textToCopy = `${parsedTask.title ? `Заголовок: ${parsedTask.title}\n\n` : ''}${parsedTask.description || this.generatedTask.content}`;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Временно меняем текст кнопки
                const btn = document.getElementById('copy-generated-btn');
                const originalHtml = btn.innerHTML;
                btn.innerHTML = `
                    <span class="flex items-center justify-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Скопировано!
                    </span>
                `;
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                }, 2000);
            }).catch(() => {
                this.showError('Не удалось скопировать в буфер обмена');
            });
        });

        // Кнопка "Перегенерировать"
        document.getElementById('regenerate-btn').addEventListener('click', () => {
            this.handleGenerate();
        });
    }

    parseGeneratedContent(content) {
        // Пытаемся извлечь заголовок из сгенерированного контента
        // Ищем паттерны типа "Заголовок:", "Название:", "Задача:" и т.д.
        const titlePatterns = [
            /(?:заголовок|название|задача|тема):\s*(.+?)(?:\n|$)/i,
            /^(.+?)(?:\n|$)/m // Первая строка как заголовок
        ];

        let title = null;
        let description = content;

        for (const pattern of titlePatterns) {
            const match = content.match(pattern);
            if (match && match[1] && match[1].trim().length > 0 && match[1].trim().length <= 255) {
                title = match[1].trim();
                // Удаляем заголовок из описания
                description = content.replace(match[0], '').trim();
                break;
            }
        }

        // Если заголовок слишком длинный или не найден, генерируем из темы
        if (!title || title.length > 255) {
            title = null;
        }

        return {
            title,
            description: description || content
        };
    }

    showError(message) {
        this.clearError();
        const errorDiv = document.createElement('div');
        errorDiv.id = 'generator-error';
        errorDiv.className = 'mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600';
        errorDiv.textContent = message;
        this.form.appendChild(errorDiv);
    }

    clearError() {
        const existingError = document.getElementById('generator-error');
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

    /**
     * Рендерит Markdown в HTML или возвращает экранированный HTML если библиотека недоступна
     */
    renderMarkdown(text) {
        if (!text) return '';
        
        // Проверяем доступность библиотеки marked
        if (typeof marked !== 'undefined') {
            try {
                // Конфигурируем marked для безопасности
                marked.setOptions({
                    breaks: true, // Поддержка переносов строк
                    gfm: true,    // GitHub Flavored Markdown
                    sanitize: false, // Мы доверяем контенту от AI
                });
                
                return marked.parse(text);
            } catch (error) {
                console.warn('Ошибка рендеринга Markdown:', error);
                // Fallback к обычному тексту
                return this.escapeHtml(text).replace(/\n/g, '<br>');
            }
        }
        
        // Fallback: если библиотека недоступна, показываем как обычный текст
        return this.escapeHtml(text).replace(/\n/g, '<br>');
    }
}

// Глобальный обработчик для создания задачи из сгенерированного контента
window.addEventListener('createTaskFromGenerated', async (e) => {
    const taskData = e.detail;
    
    try {
        const response = await fetch('http://localhost:8080/api/v1/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const createdTask = await response.json();
        
        // Показываем уведомление об успехе
        window.dispatchEvent(new CustomEvent('showNotification', { 
            detail: { message: 'Задача создана из AI генерации успешно!', type: 'success' }
        }));

        // Переходим на страницу созданной задачи
        window.dispatchEvent(new CustomEvent('navigateToTask', {
            detail: { taskId: createdTask.id }
        }));

    } catch (error) {
        window.dispatchEvent(new CustomEvent('showNotification', { 
            detail: { message: `Ошибка создания задачи: ${error.message}`, type: 'error' }
        }));
    }
});