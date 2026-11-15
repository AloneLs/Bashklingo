# Bashklingo

Платформа для изучения языков с интеграцией ИИ, озвучкой текста (TTS) и Telegram-ботом.

---

## Требования (Prerequisites)

Перед началом установки убедитесь, что на вашем компьютере установлены следующие среды выполнения (Runtime) и базы данных:

- **[BunJS](https://bun.sh/)** — версия `v1.4.4` (или новее)
- **[Python](https://www.python.org/)** — версия `v3.10.11` (необходим для работы TTS-сервера)
- **[PostgreSQL](https://www.postgresql.org/)** — запущенный инстанс базы данных

---

## Настройка окружения

1. Скопируйте файл с примером переменных окружения и переименуйте его в `.env`:

   ```bash
   cp .env.example .env
   ```

2. Откройте `.env` и заполните актуальными данными:

| Переменная | Описание | Пример значения |
| :--- | :--- | :--- |
| `PORT` | Порт для запуска Backend-сервера | `8765` |
| `HOST` | Хост, на котором слушает сервер | `0.0.0.0` |
| `DATABASE_URL` | Строка подключения к PostgreSQL | `postgresql://user:pass@localhost:5432/bashklingo` |
| `TELEGRAM_BOT_TOKEN` | Токен вашего бота от [@BotFather](https://t.me/BotFather) | `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` |
| `DEEPSEEK_API_KEY` | API-ключ для нейросети (DeepSeek или совместимый) | `sk-xxxxxxxxxxxxxxxxxxxxxxxx` |
| `DEEPSEEK_BASE_URL` | Базовый URL для API нейросети | `https://api.deepseek.com` |
| `MODEL_ID` | Идентификатор используемой языковой модели | `deepseek-chat` |
| `LOGO_PATH` | Абсолютный путь до файла логотипа | `C:\path\to\logo.png` *(или `/path/to/logo.png`)* |
| `TTS_SERVICE_URL` | Адрес локального сервиса синтеза речи (TTS) | `http://127.0.0.1:8766` |
| `FRONTEND_URL` | Адрес клиентской части приложения | `http://localhost:8764` |

---

## Установка и запуск

1. **Установите зависимости проекта:**

   ```bash
   bun install
   ```

2. **Запустите проект в режиме разработки:**

   ```bash
   bun dev
   ```

Готово! Все сервисы запустятся автоматически.

---

## Сетевые порты и настройка фаервола

После успешного запуска компоненты проекта будут доступны по следующим адресам:

| Сервис | Порт | Локальный адрес | Описание |
| :--- | :---: | :--- | :--- |
| **Frontend** | `8764` | [http://localhost:8764](http://localhost:8764) | Веб-интерфейс приложения (открывать в браузере) |
| **Backend** | `8765` | `http://localhost:8765` | Основное API и логика приложения |
| **TTS Server** | `8766` | `http://127.0.0.1:8766` | Сервер генерации голоса (Python) |

---

> **Важно для доступа по сети:** Если вы планируете открывать приложение с других устройств в локальной сети или разворачиваете его на сервере, не забудьте открыть порты **8764, 8765, 8766** (TCP) в настройках фаервола:
>
> - **Linux (UFW):**
>
>   ```bash
>   sudo ufw allow 8764:8766/tcp
>   ```
>
> - **Windows (PowerShell от имени администратора):**
>
>   ```powershell
>   New-NetFirewallRule -DisplayName "Bashklingo Ports" -Direction Inbound -LocalPort 8764-8766 -Protocol TCP -Action Allow
>   ```

---

## Лицензия

**Copyright (c) 2026 HalturMalay. All Rights Reserved.**

No permission is granted to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software without explicit written permission from the copyright holder.