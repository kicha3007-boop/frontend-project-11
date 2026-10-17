# RSS агрегатор

[![hexlet-check](https://github.com/kicha3007-boop/frontend-project-11/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kicha3007-boop/frontend-project-11/actions)
[![CI](https://github.com/kicha3007-boop/frontend-project-11/actions/workflows/main.yml/badge.svg)](https://github.com/kicha3007-boop/frontend-project-11/actions/workflows/main.yml)

Сервис для чтения RSS-лент: добавляете ссылку на RSS, приложение показывает фиды и посты, раз в 5 секунд
проверяет ленты и добавляет новые посты. Пост можно открыть в модальном окне — тогда он помечается
прочитанным.

Учебный проект Хекслета: https://ru.hexlet.io/programs/frontend

## Стек

Vite, Tailwind CSS, Valtio (состояние для слоя представления), yup (валидация), i18next (тексты),
axios. Ленты загружаются через прокси [All Origins](https://github.com/Hexlet/hexlet-allorigins).
Приложение построено по MVC: модель — состояние Valtio, представление — `src/view.js`,
контроллеры — обработчики в `src/app.js`; парсер RSS — чистая функция `src/parser.js`.

## Требования

- Node.js 22 или новее
- npm, make

## Установка и запуск

```bash
git clone https://github.com/kicha3007-boop/frontend-project-11.git
cd frontend-project-11
make install
make develop   # dev-сервер Vite
make build     # сборка в dist/
make lint      # oxlint + проверка форматирования oxfmt
```

Пример ленты: https://lorem-rss.hexlet.app/feed
