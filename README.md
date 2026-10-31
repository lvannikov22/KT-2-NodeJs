# KT 2 Express REST API

## Запуск

```
npm install
copy .env.example .env
npm start
```

Сервер запускается на `http://localhost:3000`.

## Пример создания файла

```bash
curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -d "{\"name\":\"Телефон\",\"price\":10000,\"category\":\"electronics\",\"stock\":2}"
```

Список с фильтрами

```text
GET /api/products?category=electronics&minPrice=100&page=1&limit=10
```

Для изображения используется `POST /api/products/:id/image` с form-data полем `image`.
