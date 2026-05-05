# Лия Ханова — профильный сайт основателя LisUP

Многостраничный статический сайт на русском языке. Совместим с GitHub Pages: без backend, без серверного рендеринга, без токенов в браузере. Текущая версия объединяет личный профиль Лии и B2B-упаковку LisUP: масштаб, качество, кейсы, модель работы, блог и контакты.

## Структура

```
liya-profile-site/
├── index.html          ← главная: герой, манифест, highlights
├── about.html          ← о Лие: био, факты, портрет
├── story.html          ← путь: timeline по этапам
├── principles.html     ← принципы и подход
├── projects.html       ← проекты (LisUP — флагман)
├── thoughts.html       ← мысли + лента Telegram
├── contacts.html       ← контакты: TG / lisup.ru / email
├── styles.css          ← единая дизайн-система
├── script.js           ← тема, меню, скролл-ревил, Telegram-лента
├── assets/
│   ├── images/         ← фотографии (hero, портреты, репортаж)
│   └── data/posts.json ← список постов для Telegram-ленты
├── build/build.py      ← генератор HTML (DRY shared header/footer)
└── .github/workflows/update-telegram.yml.example  ← опциональный auto-update
```

## 7 страниц

| Файл              | Назначение                                                |
| ----------------- | --------------------------------------------------------- |
| `index.html`      | Точка входа: hero, масштаб LisUP, манифест, карточки страниц |
| `about.html`      | Путь Лии: поле → фаундер, факты, управленческий подход    |
| `story.html`      | Хронология: инженер ДВС → промоутер → предприниматель → LisUP |
| `principles.html` | Принципы жизни и системы: люди, контроль, рост, качество  |
| `projects.html`   | LisUP-флагман, модель работы, кейсы, вход для сотрудников |
| `thoughts.html`   | 3 длинных текста + сайдбар + лента Telegram               |
| `contacts.html`   | 3 канала связи + темы для разговора                       |

## Контакты (зашиты в каждой странице)

- Написать Лие: <https://t.me/liyakhanova> (на сайте отображается как `t.me/@liyakhanova`)
- Telegram-канал: <https://t.me/liya_khanova>
- LisUP: <https://lisup.ru>
- Email: <Liya.khanova@gmail.com>

## Как редактировать

### 1. Контент страниц

Все страницы генерируются из `build/build.py`. Это позволяет держать общий
header/footer/meta в одном месте.

```bash
python3 build/build.py
```

В `build.py` правьте константы:
- `NAV`, `BRAND_MARK`, `FOOTER` — общие блоки
- `INDEX_BODY`, `ABOUT_BODY`, `STORY_BODY`, … — тело каждой страницы

После правок обязательно перезапустите скрипт, чтобы пересобрать HTML.

### 2. Дизайн-токены

В `styles.css` секция `:root` содержит цвета, шрифты, пространство, скругления.
Тёмная тема — `:root[data-theme="dark"]`.

Палитра: тёплая бумага `#F4EFE7`, глубокий ink `#1C1A16`, акцент-терракота `#C8542A`.
Типографика: **Instrument Serif** (display) + **Satoshi** (body), оба через CDN.

### 3. Telegram-лента (на странице thoughts.html)

Источник правды — `assets/data/posts.json`:

```json
{
  "channel": "liya_khanova",
  "channelUrl": "https://t.me/liya_khanova",
  "posts": [
    { "url": "https://t.me/liya_khanova/12", "caption": "Опционально" },
    { "url": "https://t.me/liya_khanova/15" }
  ]
}
```

`script.js` читает этот файл и монтирует **официальный**
`telegram-widget.js?22` для каждой ссылки (sandbox-iframe от Telegram).
Если файл пустой/битый — рисуются fallback-карточки со ссылками на канал.

**Безопасность:** в браузере **никаких токенов**. GitHub Pages-совместимо.

### 4. Авто-обновление ленты (опционально)

В `.github/workflows/update-telegram.yml.example` лежит готовый workflow,
который раз в час парсит публичный `https://t.me/s/liya_khanova` и
обновляет `posts.json`. Чтобы включить — переименуйте файл в
`update-telegram.yml` и закоммитьте. Без бота, без токенов.

### 5. Фотографии

Лежат в `assets/images/`. Кастинг по страницам:

| Файл                          | Где используется                                    |
| ----------------------------- | --------------------------------------------------- |
| `liya-hero-portrait.jpg`      | index — главный B&W портрет в герое                 |
| `liya-hero-rooftop.jpg`       | index highlights, about secondary                   |
| `liya-mirror-portrait.jpg`    | index manifesto, about main, projects               |
| `liya-lisup-team.jpg`         | index, projects (LisUP flagship)                    |
| `liya-stage-speaking.jpg`     | index, projects                                     |
| `liya-stage-event.jpg`        | story «сейчас», projects                            |
| `liya-mascot-day.jpg`         | index, story «начало»                               |
| `liya-mascot-winter.jpg`      | story «путь»                                        |
| `liya-friends-kremlin.jpg`    | index, story «поворот», contacts                    |
| `liya-yellow-quiet.jpg`       | index, principles inset                             |

Заменить фото — перезапишите файл с тем же именем. Имена закреплены в `build.py`.

## Что прислать для финальной версии

1. **Telegram-посты для ленты** — 3–6 ссылок вида `https://t.me/liya_khanova/<id>`,
   которые хочется закрепить как featured.
2. **Тексты thoughts.html** — подтвердите/перепишите 3 длинных поста (или пришлите свои).
3. **Реальные даты в timeline** на `story.html` (если хотите даты, а не только этапы).
4. **Дополнительные кейсы проектов** — для каждого: лого/иконка, роль, 2 предложения, ссылка.
5. **Опционально:** отзывы, город, языки, ссылки на Instagram / YouTube / подкаст.
6. **Подтверждение цифр и формулировок** — 3000+, 20+, x5, 10 млн ₽/месяц, бренды и кейсы.
7. **Подтверждение фото** — оставляем все или какие-то заменить/убрать.

## Локальный запуск

```bash
cd liya-profile-site
python3 -m http.server 8000
# открыть http://localhost:8000
```

## Деплой на GitHub Pages

Пушните в `main` (или `gh-pages`), включите Pages в Settings → Pages.
Никаких build-шагов: всё уже статика.
