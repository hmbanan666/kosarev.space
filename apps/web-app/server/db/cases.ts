export interface CaseContent {
  title: string
  description: string
  task: string
  solution: string
  result: string
}

export interface CaseRecord {
  key: string
  project: string
  tags: string[]
  icon: string
  image?: string
  content: Record<string, CaseContent>
}

export const cases: CaseRecord[] = [
  {
    key: 'o5-rewrite',
    project: 'o5.Food',
    tags: ['React', 'TypeScript', 'NestJS', 'Node.js'],
    icon: 'i-lucide-refresh-cw',
    image: '/cases/o5-rewrite.webp',
    content: {
      ru: {
        title: 'Миграция платформы на React и NestJS',
        description: 'Переписал ядро o5.Еда с PHP/jQuery на TypeScript/React/NestJS. Модульная архитектура, типизированный API, 500+ бизнес-клиентов без простоя при переходе.',
        task: 'Платформа o5.Еда - SaaS для запуска сайтов доставки еды. К моменту миграции обслуживала более 500 ресторанов по всей России. Кодовая база выросла из MVP на PHP и jQuery: монолитная архитектура, где фронтенд рендерился на сервере через шаблонизатор, бизнес-логика была размазана между контроллерами и вьюшками, а любое изменение в одном модуле могло сломать другой. Тесты отсутствовали полностью - каждый деплой был рулеткой. Добавление новой фичи вроде программы лояльности занимало 3-4 недели вместо нескольких дней. Команда росла, но скорость разработки падала из-за конфликтов в коде и отсутствия чёткого разделения ответственности.',
        solution: 'Разработал стратегию поэтапной миграции без остановки продакшена - strangler fig pattern. Первым шагом вынес API в отдельный сервис на NestJS: типизированные эндпоинты, валидация входных данных через class-validator и DTO, Swagger-документация генерировалась автоматически. Фронтенд переписал на React с компонентным подходом: React Query для кэширования и синхронизации серверного состояния, React Router для навигации, кастомные хуки для переиспользования логики. Старая и новая системы работали параллельно - Nginx проксировал запросы: новые модули шли через React-приложение, старые продолжали работать на PHP. Каждый спринт мигрировал один модуль, покрывая его тестами (Jest + React Testing Library). Настроил CI/CD через GitLab: линтинг, тесты, билд и деплой по мёржу в main.',
        result: 'Миграция заняла 8 месяцев. Все 500+ клиентов перешли на новую платформу без единого часа простоя. Скорость разработки фич выросла в 3 раза - новая фича вроде промокодов теперь занимала 3-5 дней вместо месяца. Покрытие тестами достигло 70%. Время деплоя сократилось с 40 минут ручной работы до 5 минут автоматического пайплайна. Новые разработчики выходили на продуктивность за неделю вместо месяца благодаря типизации и документации API.',
      },
      en: {
        title: 'Platform migration to React & NestJS',
        description: 'Rewrote the o5.Food core from PHP/jQuery to TypeScript/React/NestJS. Modular architecture, typed API, 500+ business clients migrated with zero downtime.',
        task: 'o5.Food was a SaaS platform for launching food delivery websites, serving 500+ restaurants across Russia. The codebase had grown from a PHP/jQuery MVP into a monolith where the frontend was server-rendered via templates, business logic was spread across controllers and views, and any change in one module could break another. There were zero tests - every deploy was a gamble. Adding a new feature like a loyalty program took 3-4 weeks instead of days. The team was growing, but development velocity was declining due to code conflicts and no clear separation of concerns.',
        solution: 'Designed an incremental migration strategy without stopping production - the strangler fig pattern. First, extracted the API into a standalone NestJS service: typed endpoints, input validation via class-validator and DTOs, auto-generated Swagger documentation. Rebuilt the frontend in React with a component-based approach: React Query for caching and server state synchronization, React Router for navigation, custom hooks for logic reuse. Old and new systems ran in parallel - Nginx proxied requests: new modules went through the React app, legacy ones continued on PHP. Each sprint migrated one module, covering it with tests (Jest + React Testing Library). Set up CI/CD via GitLab: linting, tests, build, and deploy on merge to main.',
        result: 'Migration took 8 months. All 500+ clients moved to the new platform with zero downtime. Feature development speed increased 3x - a new feature like promo codes now took 3-5 days instead of a month. Test coverage reached 70%. Deploy time dropped from 40 minutes of manual work to a 5-minute automated pipeline. New developers reached productivity in a week instead of a month thanks to typing and API documentation.',
      },
    },
  },
  {
    key: 'o5-kubernetes',
    project: 'o5.Food',
    tags: ['Kubernetes', 'Docker', 'CI/CD', 'Nginx'],
    icon: 'i-lucide-server',
    image: '/cases/o5-kubernetes.webp',
    content: {
      ru: {
        title: 'Масштабируемая инфраструктура на Kubernetes',
        description: 'Развернул платформу в Kubernetes: автоскейлинг под нагрузку, CI/CD пайплайны, zero-downtime деплой. Снизил затраты на хостинг при растущем трафике.',
        task: 'Платформа доставки еды обслуживала сотни ресторанов. Всё крутилось на двух выделенных серверах: один под приложение, второй под базу данных. В обеденные часы (с 11:00 до 14:00) трафик вырастал в 5-7 раз - сервер приложений не справлялся, запросы начинали падать по таймауту, пользователи видели 502 ошибки. Деплой выглядел так: зайти по SSH, сделать git pull, перезапустить pm2, проверить что ничего не упало - 30-40 минут ручной работы с неизбежным простоем. Откат в случае проблемы - ещё 20 минут. Горизонтальное масштабирование на выделенных серверах было практически невозможно: каждый новый сервер требовал ручной настройки окружения, синхронизации конфигов и балансировки через Nginx.',
        solution: 'Первым шагом контейнеризировал каждый сервис в Docker - написал мультистейдж Dockerfile для минимального размера образа (Node.js приложение ужалось с 1.2 ГБ до 180 МБ). Развернул managed Kubernetes кластер с тремя нодами. Разбил монолит на отдельные деплойменты: API, воркеры фоновых задач, фронтенд (SSR). Для каждого настроил HPA (Horizontal Pod Autoscaler) - при росте CPU выше 70% автоматически поднимаются новые поды, при спаде - убираются. Ingress Controller на Nginx обеспечивает маршрутизацию и SSL-терминацию. CI/CD пайплайн в GitLab: на каждый пуш - линтинг и тесты, на мёрж в main - сборка Docker-образа, push в Container Registry, rolling update в кластере. Весь деплой стал автоматическим и занимает 3-4 минуты от мёржа до продакшена.',
        result: 'Полный zero-downtime деплой - пользователи не замечают обновлений благодаря rolling update стратегии. В обеденный пик кластер автоматически масштабируется с 3 до 8 подов и сокращается обратно вечером. Затраты на инфраструктуру снизились на 30%: вместо оплаты пиковой мощности 24/7 платим только за реально используемые ресурсы. Время деплоя сократилось с 40 минут ручной работы до 4 минут автоматического пайплайна. Откат на предыдущую версию - одна команда, 30 секунд.',
      },
      en: {
        title: 'Scalable infrastructure on Kubernetes',
        description: 'Deployed the platform to Kubernetes: autoscaling under load, CI/CD pipelines, zero-downtime deploys. Reduced hosting costs while handling growing traffic.',
        task: 'A food delivery platform serving hundreds of restaurants ran on two dedicated servers: one for the application, one for the database. During lunch hours (11:00-14:00), traffic spiked 5-7x - the app server couldn\'t cope, requests timed out, users saw 502 errors. Deployment meant SSH-ing in, running git pull, restarting pm2, and hoping nothing broke - 30-40 minutes of manual work with inevitable downtime. Rollback took another 20 minutes. Horizontal scaling on dedicated servers was nearly impossible: each new server required manual environment setup, config syncing, and Nginx load balancing.',
        solution: 'First, containerized every service in Docker - wrote multi-stage Dockerfiles to minimize image size (Node.js app shrank from 1.2 GB to 180 MB). Deployed a managed Kubernetes cluster with three nodes. Split the monolith into separate deployments: API, background job workers, frontend (SSR). Configured HPA (Horizontal Pod Autoscaler) for each - when CPU exceeds 70%, new pods spin up automatically, and scale down when load drops. Nginx Ingress Controller handles routing and SSL termination. GitLab CI/CD pipeline: every push triggers linting and tests, every merge to main builds a Docker image, pushes to Container Registry, and triggers a rolling update in the cluster. Entire deployment is now automatic, taking 3-4 minutes from merge to production.',
        result: 'Full zero-downtime deployment - users don\'t notice updates thanks to the rolling update strategy. During lunch peaks, the cluster auto-scales from 3 to 8 pods and shrinks back in the evening. Infrastructure costs dropped 30%: instead of paying for peak capacity 24/7, we only pay for actual resource usage. Deploy time went from 40 minutes of manual work to a 4-minute automated pipeline. Rolling back to a previous version - one command, 30 seconds.',
      },
    },
  },
  {
    key: 'meloteka-transcoding',
    project: 'Meloteka',
    tags: ['Nuxt', 'TypeScript', 'S3', 'Node.js'],
    icon: 'i-lucide-audio-waveform',
    image: '/cases/meloteka-transcoding.webp',
    content: {
      ru: {
        title: 'Пайплайн транскодирования аудио',
        description: 'Серверный пайплайн: загрузка FLAC/MP3/OGG, транскодирование в нужные форматы, стриминг через S3. Lossless воспроизведение в браузере с любого устройства.',
        task: 'Мелотека - облачный музыкальный сервис, где пользователь загружает свою коллекцию и слушает с любого устройства. Проблема: люди хранят музыку в разных форматах. Аудиофилы загружают FLAC (40-60 МБ на трек), обычные пользователи - MP3 и OGG. Нужно было решить три задачи одновременно: сохранить оригиналы без потерь, создать оптимизированные копии для стриминга через браузер и обеспечить мгновенный старт воспроизведения без буферизации. При этом всё должно работать на бюджетной инфраструктуре - стартап на ранней стадии, каждый рубль на счету.',
        solution: 'Спроектировал асинхронный пайплайн обработки аудио на Node.js. При загрузке файл сразу отправляется в S3-хранилище на Yandex Cloud - оригинал сохраняется как есть. Параллельно создается задача в очереди на транскодирование. Воркер берет файл, прогоняет через ffmpeg: генерирует AAC-версию для браузерного стриминга (128/256/320 kbps в зависимости от тарифа пользователя), извлекает метаданные (длительность, битрейт, сэмплрейт), создает waveform-превью для визуализации. Готовые файлы заливаются обратно в S3. Стриминг реализован через presigned URLs с ограниченным временем жизни - клиент получает прямую ссылку на S3, CDN кэширует популярные треки. Для lossless воспроизведения отдается оригинальный FLAC через отдельный эндпоинт с поддержкой Range-запросов.',
        result: 'Среднее время обработки трека - 15 секунд (FLAC 40 МБ). Мгновенный старт воспроизведения благодаря CDN-кэшированию и presigned URLs. Хранение обходится в ~0.5 руб/ГБ в месяц на S3. Пользователи загружают FLAC и получают lossless в браузере без установки отдельного приложения. Пайплайн обрабатывает до 100 треков параллельно благодаря очереди задач.',
      },
      en: {
        title: 'Audio transcoding pipeline',
        description: 'Server-side pipeline: FLAC/MP3/OGG upload, transcoding to multiple formats, S3 streaming. Lossless playback in the browser from any device.',
        task: 'Meloteka is a cloud music service where users upload their collection and listen from any device. The problem: people store music in different formats. Audiophiles upload FLAC (40-60 MB per track), regular users - MP3 and OGG. Three challenges needed to be solved simultaneously: preserve originals losslessly, create optimized copies for browser streaming, and ensure instant playback without buffering. All on a budget infrastructure - early-stage startup, every dollar counts.',
        solution: 'Designed an async audio processing pipeline on Node.js. On upload, the file goes straight to S3 storage on Yandex Cloud - the original is preserved as-is. A transcoding task is created in the queue in parallel. A worker picks up the file and runs it through ffmpeg: generates an AAC version for browser streaming (128/256/320 kbps depending on user tier), extracts metadata (duration, bitrate, sample rate), creates a waveform preview for visualization. Processed files are uploaded back to S3. Streaming uses presigned URLs with limited TTL - the client gets a direct S3 link, CDN caches popular tracks. For lossless playback, the original FLAC is served through a separate endpoint with Range request support.',
        result: 'Average track processing time - 15 seconds (40 MB FLAC). Instant playback start thanks to CDN caching and presigned URLs. Storage costs ~$0.005/GB per month on S3. Users upload FLAC and get lossless in the browser without installing a separate app. The pipeline handles up to 100 tracks in parallel thanks to the task queue.',
      },
    },
  },
  {
    key: 'meloteka-musicbrainz',
    project: 'Meloteka',
    tags: ['Nuxt', 'TypeScript', 'Telegram Mini App'],
    icon: 'i-lucide-database',
    image: '/cases/meloteka-musicbrainz.webp',
    content: {
      ru: {
        title: 'Интеграция каталога MusicBrainz',
        description: 'Подключил каталог MusicBrainz (127 000+ артистов), скробблинг в ListenBrainz, Telegram Mini App для мобильного доступа к библиотеке.',
        task: 'Когда пользователь загружает музыку в Мелотеку, он ожидает увидеть обложку альбома, имя артиста, год выпуска, жанр и список треков - как в Spotify или Apple Music. Но MP3-файлы часто приходят с пустыми или некорректными ID3-тегами: "Track 01", "Unknown Artist", обложка отсутствует. Заставлять пользователя вручную заполнять метаданные для каждого из 500 треков в коллекции - невозможно. Кроме того, пользователи просили мобильный доступ к библиотеке, но разрабатывать нативное приложение для iOS и Android было нереально по бюджету. Также нужен был скробблинг - логирование прослушиваний для ведения статистики и рекомендаций.',
        solution: 'Интегрировал MusicBrainz - крупнейшую открытую музыкальную базу данных с 127 000+ артистами и миллионами релизов. При загрузке трека система извлекает имеющиеся теги из файла (через music-metadata), формирует поисковый запрос и отправляет в MusicBrainz API. Алгоритм матчинга работает в несколько этапов: сначала точный поиск по артисту + альбому, затем нечеткий поиск по названию трека, в крайнем случае - по акустическому отпечатку через AcoustID. Найденные метаданные (артист, альбом, год, жанр, обложка через Cover Art Archive) автоматически подставляются к загруженному файлу. Пользователь может подтвердить или скорректировать результат. Для скробблинга подключил ListenBrainz API - при каждом прослушивании отправляется событие с информацией о треке. Для мобильного доступа разработал Telegram Mini App на Vue 3: авторизация через Telegram Web App API, навигация по библиотеке, плеер с управлением воспроизведением, поиск по коллекции. Mini App работает внутри Telegram без установки отдельного приложения.',
        result: 'Автоматическое распознавание метаданных работает для 85% загружаемых треков без участия пользователя. Каталог содержит 127 000+ артистов с обложками и биографиями. Скробблинг в ListenBrainz позволяет пользователям вести историю прослушиваний и делиться статистикой. Telegram Mini App обеспечивает полноценный мобильный доступ к библиотеке - пользователи управляют коллекцией, слушают музыку и ищут треки прямо из Telegram, без необходимости открывать браузер или ставить приложение.',
      },
      en: {
        title: 'MusicBrainz catalog integration',
        description: 'Integrated MusicBrainz catalog (127,000+ artists), ListenBrainz scrobbling, and a Telegram Mini App for mobile library access.',
        task: 'When users upload music to Meloteka, they expect to see album artwork, artist name, release year, genre, and tracklist - like Spotify or Apple Music. But MP3 files often come with empty or incorrect ID3 tags: "Track 01", "Unknown Artist", no artwork. Forcing users to manually fill metadata for each of 500 tracks in their collection is impossible. Additionally, users requested mobile access to their library, but building native iOS and Android apps was unrealistic budget-wise. Scrobbling was also needed - logging listens for statistics and recommendations.',
        solution: 'Integrated MusicBrainz - the largest open music database with 127,000+ artists and millions of releases. On upload, the system extracts existing tags from the file (via music-metadata), builds a search query, and sends it to the MusicBrainz API. The matching algorithm works in stages: first exact search by artist + album, then fuzzy search by track name, and as a last resort - by acoustic fingerprint via AcoustID. Found metadata (artist, album, year, genre, artwork via Cover Art Archive) is automatically applied to the uploaded file. Users can confirm or adjust the result. For scrobbling, integrated the ListenBrainz API - every playback sends an event with track info. For mobile access, built a Telegram Mini App on Vue 3: authentication via Telegram Web App API, library navigation, playback controls, collection search. The Mini App runs inside Telegram without installing a separate application.',
        result: 'Automatic metadata recognition works for 85% of uploaded tracks without user intervention. The catalog contains 127,000+ artists with artwork and bios. ListenBrainz scrobbling lets users maintain listening history and share statistics. The Telegram Mini App provides full mobile access to the library - users manage their collection, listen to music, and search tracks right from Telegram, without opening a browser or installing an app.',
      },
    },
  },
  {
    key: 'startodel-seo',
    project: 'Startodel',
    tags: ['Nuxt', 'TypeScript', 'Tailwind CSS'],
    icon: 'i-lucide-search',
    image: '/cases/startodel-seo.webp',
    content: {
      ru: {
        title: 'SEO-архитектура для сайтов доставки',
        description: 'Отдельные страницы товаров с Schema.org разметкой, SSR, мета-теги. Клиентские сайты выходят в топ Google по локальным запросам.',
        task: 'Стартодел - SaaS-платформа, которая генерирует готовые сайты доставки еды для ресторанов. Проблема: сгенерированные сайты представляли собой классический SPA - весь контент рендерился на клиенте через JavaScript. Поисковые боты Google видели пустую страницу с загрузчиком. В итоге сайты клиентов не попадали в индекс вообще, а первые позиции по запросам вроде "пицца доставка Калининград" занимали агрегаторы типа Яндекс.Еда и Delivery Club, которые забирали себе трафик и комиссию с каждого заказа. Клиенты платили за рекламу, хотя могли получать заказы бесплатно через органический поиск.',
        solution: 'Перевел рендеринг на SSR через Nuxt - теперь каждая страница отдается поисковому боту как готовый HTML. Создал отдельный URL для каждого товара в меню (/menu/pizza-pepperoni) вместо одной страницы с фильтрами. На каждой странице товара добавил Schema.org Product разметку: название, описание, цена, фото, наличие, рейтинг. Это дает rich snippets в поисковой выдаче - карточка с ценой и фото прямо в Google. Реализовал автогенерацию sitemap.xml с приоритетами: главная и категории - высокий, отдельные товары - средний. Добавил мета-теги Open Graph и Twitter Cards для красивых превью при шаринге в соцсетях и мессенджерах. Настроил canonical URL для предотвращения дублей контента между категориями.',
        result: 'Сайты клиентов выходят в топ-5 Google по локальным запросам в течение 2-3 месяцев. Органический трафик вырос в 4 раза без затрат на рекламу. Rich snippets с ценой и фото повысили CTR в поисковой выдаче на 35%. Клиенты экономят на рекламе и получают заказы напрямую, без комиссии агрегаторов.',
      },
      en: {
        title: 'SEO architecture for delivery sites',
        description: 'Individual product pages with Schema.org markup, SSR, meta tags. Client sites rank on Google\'s first page for local queries.',
        task: 'Startodel is a SaaS platform that generates ready-made delivery websites for restaurants. The problem: generated sites were classic SPAs - all content rendered client-side via JavaScript. Google bots saw an empty page with a loader. Client sites weren\'t indexed at all, while aggregators like Yandex.Food and Delivery Club dominated top positions for queries like "pizza delivery Kaliningrad", taking traffic and charging commission on every order. Clients paid for ads when they could have been getting orders for free through organic search.',
        solution: 'Switched rendering to SSR via Nuxt - every page is now served to search bots as ready HTML. Created individual URLs for each menu item (/menu/pizza-pepperoni) instead of a single page with filters. Added Schema.org Product markup on each product page: name, description, price, image, availability, rating. This enables rich snippets in search results - a card with price and photo right in Google. Implemented auto-generated sitemap.xml with priorities: homepage and categories - high, individual products - medium. Added Open Graph and Twitter Cards meta tags for clean previews when shared on social media and messengers. Set up canonical URLs to prevent content duplication across categories.',
        result: 'Client sites reach Google top-5 for local queries within 2-3 months. Organic traffic grew 4x without ad spend. Rich snippets with price and photo increased search result CTR by 35%. Clients save on advertising and receive orders directly, without aggregator commissions.',
      },
    },
  },
  {
    key: 'startodel-payments',
    project: 'Startodel',
    tags: ['Nuxt', 'TypeScript', 'Node.js'],
    icon: 'i-lucide-credit-card',
    image: '/cases/startodel-payments.webp',
    content: {
      ru: {
        title: 'Онлайн-оплата без комиссии для ресторанов',
        description: 'Интеграция прямого эквайринга для клиентов SaaS-платформы доставки еды. 0% комиссии на заказы вместо 3-5% у агрегаторов.',
        task: 'Рестораны на платформе Стартодел принимали только наличные при доставке. Клиенты просили онлайн-оплату, но стандартные решения не подходили. Агрегаторы вроде Яндекс.Еда берут 3-5% с каждого заказа - при среднем чеке 1500 руб. это 45-75 руб. с каждой доставки. Платежные агрегаторы типа ЮKassa или Robokassa тоже берут комиссию 2-3.5%, и деньги приходят на счет платформы, а не ресторана - нужно было бы выступать платежным агентом с кассой и 54-ФЗ. Клиенты хотели получать деньги напрямую на свой расчетный счет, без посредников и комиссий.',
        solution: 'Реализовал схему, где каждый ресторан подключает собственный эквайринг напрямую через банк (Сбер, Тинькофф, Альфа). Платформа выступает только техническим посредником: генерирует платежную ссылку через API банка клиента, передает сумму и описание заказа, получает callback о статусе оплаты. Деньги идут напрямую на расчетный счет ресторана - платформа их не касается, не нужна касса и статус платежного агента. На бэкенде написал универсальный платежный адаптер на TypeScript: единый интерфейс для разных банков, каждый банк - отдельный модуль с реализацией. Добавить поддержку нового банка - написать один файл с 5 методами (createPayment, getStatus, refund, webhook, healthCheck). Webhook-обработчик верифицирует подпись, обновляет статус заказа и отправляет пуш-уведомление клиенту через Telegram.',
        result: '0% комиссии на заказы - ресторан платит только стандартную банковскую ставку эквайринга (1.5-2.2%). Конверсия в оплату выросла на 25% по сравнению с наличными при доставке. Время от нажатия "Оплатить" до подтверждения - 3-5 секунд. Подключение нового банка занимает 1 день разработки благодаря адаптеру.',
      },
      en: {
        title: 'Zero-commission online payments for restaurants',
        description: 'Direct acquiring integration for a food delivery SaaS platform. 0% order commission instead of 3-5% charged by aggregators.',
        task: 'Restaurants on the Startodel platform only accepted cash on delivery. Clients wanted online payments, but standard solutions didn\'t fit. Aggregators like Yandex.Food charge 3-5% per order - at an average check of 1500 RUB, that\'s 45-75 RUB per delivery. Payment aggregators like YooKassa or Robokassa also charge 2-3.5%, and funds land in the platform\'s account, not the restaurant\'s - requiring payment agent status and fiscal compliance. Clients wanted money going directly to their bank account, no middlemen, no commissions.',
        solution: 'Implemented a scheme where each restaurant connects their own acquiring directly through their bank (Sber, Tinkoff, Alfa). The platform acts only as a technical intermediary: generates a payment link via the client\'s bank API, passes the order amount and description, receives a callback on payment status. Money goes directly to the restaurant\'s bank account - the platform never touches it, no fiscal agent status needed. On the backend, wrote a universal payment adapter in TypeScript: a single interface for different banks, each bank a separate module. Adding a new bank means writing one file with 5 methods (createPayment, getStatus, refund, webhook, healthCheck). The webhook handler verifies the signature, updates order status, and sends a push notification to the customer via Telegram.',
        result: '0% order commission - restaurants only pay standard bank acquiring rate (1.5-2.2%). Payment conversion increased 25% compared to cash on delivery. Time from clicking "Pay" to confirmation - 3-5 seconds. Adding a new bank takes 1 day of development thanks to the adapter pattern.',
      },
    },
  },
  {
    key: 'sushilove-async',
    project: 'Sushi-Love',
    tags: ['PostgreSQL', 'RabbitMQ', 'TypeScript', 'Node.js'],
    icon: 'i-lucide-workflow',
    image: '/cases/sushilove-async.webp',
    content: {
      ru: {
        title: 'Асинхронная обработка задач',
        description: 'Интегрировал PostgreSQL и RabbitMQ для очередей задач. Повысил надежность и скорость работы внутреннего сервиса доставки.',
        task: 'Сеть ресторанов Sushi-Love принимала заказы через внутренний сервис. Каждый заказ обрабатывался синхронно: API получал запрос, проверял наличие позиций, рассчитывал стоимость с учетом акций, отправлял уведомление на кухню, записывал в базу и возвращал ответ клиенту. Весь этот цикл занимал 2-3 секунды. В пятницу вечером и в обеденные часы количество одновременных заказов вырастало в 5-8 раз. Сервер не успевал обработать все запросы - часть падала по таймауту (30 секунд), клиент видел ошибку и уходил к конкурентам. Каждый потерянный заказ - это в среднем 1800 руб. упущенной выручки. За один пятничный вечер терялось до 15-20 заказов.',
        solution: 'Разделил обработку на два этапа: быстрый прием и фоновое выполнение. API теперь только валидирует заказ, создает запись в PostgreSQL со статусом "принят" и отправляет сообщение в RabbitMQ - это занимает 100-200 мс. Клиент сразу получает подтверждение. Дальше воркеры забирают сообщения из очереди и выполняют тяжелую работу: пересчет стоимости, проверка остатков, отправка на кухню, push-уведомления. Каждый воркер работает в транзакции PostgreSQL - если что-то падает, сообщение возвращается в очередь и обрабатывается повторно. Настроил dead letter queue для заказов, которые не удалось обработать после 3 попыток - они попадают в отдельную очередь для ручного разбора. Мониторинг через Grafana: длина очереди, время обработки, количество ретраев.',
        result: 'Нулевая потеря заказов при любой нагрузке - RabbitMQ буферизует пики, воркеры разгребают очередь за секунды. Время отклика API снизилось с 2-3 секунд до 150-200 мс. В пятничный пик сервис спокойно обрабатывает 200+ заказов в час без деградации. Dead letter queue поймала 3 проблемных заказа за первый месяц, которые раньше просто бы потерялись.',
      },
      en: {
        title: 'Async task processing',
        description: 'Integrated PostgreSQL and RabbitMQ for task queues. Improved reliability and speed of the internal delivery service.',
        task: 'The Sushi-Love restaurant chain accepted orders through an internal service. Each order was processed synchronously: the API received a request, checked item availability, calculated the price with promotions, sent a notification to the kitchen, wrote to the database, and returned a response. The entire cycle took 2-3 seconds. On Friday evenings and lunch hours, simultaneous orders spiked 5-8x. The server couldn\'t handle all requests - some timed out (30 seconds), customers saw errors and went to competitors. Each lost order meant ~1800 RUB in missed revenue. A single Friday evening could lose 15-20 orders.',
        solution: 'Split processing into two stages: fast acceptance and background execution. The API now only validates the order, creates a PostgreSQL record with "accepted" status, and publishes a message to RabbitMQ - this takes 100-200ms. The customer gets instant confirmation. Workers then pick up messages from the queue and do the heavy lifting: price recalculation, inventory checks, kitchen dispatch, push notifications. Each worker runs in a PostgreSQL transaction - if something fails, the message returns to the queue for retry. Set up a dead letter queue for orders that fail after 3 attempts - they go to a separate queue for manual review. Monitoring via Grafana: queue length, processing time, retry count.',
        result: 'Zero order loss under any load - RabbitMQ buffers spikes, workers clear the queue in seconds. API response time dropped from 2-3 seconds to 150-200ms. During Friday peaks, the service handles 200+ orders per hour without degradation. The dead letter queue caught 3 problematic orders in the first month that would have simply been lost before.',
      },
    },
  },
  {
    key: 'sushilove-telegram',
    project: 'Sushi-Love',
    tags: ['Telegram Mini App', 'TypeScript', 'Vue'],
    icon: 'i-lucide-bot',
    image: '/cases/sushilove-telegram.webp',
    content: {
      ru: {
        title: 'Telegram Mini App для управления командой',
        description: 'Создал Telegram Mini App для учета задач команды ресторана: назначение, статусы, сроки, мониторинг KPI. Вся команда перешла на него за неделю.',
        task: 'В сети ресторанов Sushi-Love работало 10 офисных сотрудников: менеджеры, маркетолог, бухгалтер. Задачи ставились в рабочем чате Telegram - сообщением с тегом исполнителя. Проблемы были очевидны: задачи тонули в потоке сообщений, никто не помнил что было поручено неделю назад, сроки срывались потому что исполнитель просто не видел сообщение. Менеджер тратил 2-3 часа в конце месяца на ручной подсчет KPI - листал чаты, считал выполненные задачи, оценивал сроки. Пробовали Trello и Notion - не прижились: сотрудники забывали туда заходить, приложения казались сложными для людей без технического бэкграунда. Все и так сидели в Telegram весь день - нужен инструмент там же.',
        solution: 'Разработал Telegram Mini App на Vue 3 с Composition API. Авторизация через Telegram Web App API - пользователь открывает бота, нажимает кнопку и сразу попадает в приложение без регистрации и паролей. Telegram передает данные пользователя (id, имя, фото) автоматически. Интерфейс максимально простой: список задач с цветовой индикацией статуса (новая, в работе, на проверке, готово), фильтр по исполнителю и сроку, создание задачи в два тапа. Каждая задача содержит: описание, исполнитель, дедлайн, приоритет, комментарии. При назначении задачи исполнитель получает уведомление через Telegram-бота. За день до дедлайна - напоминание. При просрочке - уведомление менеджеру. KPI считается автоматически: процент задач в срок, среднее время выполнения, количество просрочек. Бэкенд на Node.js с PostgreSQL, API через REST. Деплой через Docker на тот же сервер что и основной сервис ресторана.',
        result: 'Вся команда из 10 человек перешла за неделю - не нужно ставить отдельное приложение, всё внутри привычного Telegram. Просроченных задач стало на 60% меньше за первый месяц. Менеджер экономит 2-3 часа на подсчете KPI - отчет генерируется автоматически по нажатию кнопки. Сотрудники начали сами создавать задачи друг другу, а не только получать от руководства. Средний срок выполнения задачи снизился с 5 дней до 2.5 дней благодаря своевременным напоминаниям.',
      },
      en: {
        title: 'Telegram Mini App for team management',
        description: 'Built a Telegram Mini App for restaurant team task tracking: assignments, statuses, deadlines, KPI monitoring. The entire team adopted it within a week.',
        task: 'The Sushi-Love restaurant chain had 10 office employees: managers, a marketer, an accountant. Tasks were assigned in the work Telegram chat - a message with the assignee tagged. Problems were obvious: tasks drowned in the message stream, nobody remembered what was assigned a week ago, deadlines slipped because the assignee simply didn\'t see the message. The manager spent 2-3 hours at month\'s end manually calculating KPIs - scrolling through chats, counting completed tasks, estimating timelines. They tried Trello and Notion - neither stuck: employees forgot to check them, the apps felt complex for non-technical staff. Everyone was already in Telegram all day - the tool needed to be there too.',
        solution: 'Built a Telegram Mini App on Vue 3 with Composition API. Authentication via Telegram Web App API - the user opens the bot, taps a button, and lands in the app instantly with no registration or passwords. Telegram passes user data (id, name, photo) automatically. Interface is dead simple: task list with color-coded status indicators (new, in progress, review, done), filter by assignee and deadline, task creation in two taps. Each task has: description, assignee, deadline, priority, comments. On assignment, the assignee gets a notification via the Telegram bot. One day before the deadline - a reminder. On overdue - a notification to the manager. KPIs are calculated automatically: percentage of tasks on time, average completion time, overdue count. Backend on Node.js with PostgreSQL, REST API. Deployed via Docker on the same server as the main restaurant service.',
        result: 'The entire 10 person team adopted it within a week - no separate app to install, everything inside familiar Telegram. Overdue tasks dropped 60% in the first month. The manager saves 2-3 hours on KPI calculation - reports generate automatically with one button press. Employees started creating tasks for each other, not just receiving them from management. Average task completion time dropped from 5 days to 2.5 days thanks to timely reminders.',
      },
    },
  },
  {
    key: 'chatgame-websocket',
    project: 'ChatGame',
    tags: ['WebSocket', 'Canvas API', 'TypeScript', 'Twitch API'],
    icon: 'i-lucide-gamepad-2',
    image: '/cases/chatgame-websocket.webp',
    content: {
      ru: {
        title: 'Интерактивная игра в реальном времени',
        description: 'Мультиплеерная игра в чате Twitch на Canvas API и WebSocket. Зрители взаимодействуют со стримом через команды, OAuth-авторизация, система инвентаря.',
        task: 'Я веду стримы по разработке на Twitch. Зрители смотрят как я пишу код, но хочется больше интерактива - не просто чат, а реальное взаимодействие с тем что происходит на экране. Идея: игра, где персонажи зрителей живут на экране стрима, а управление происходит через команды в чате. Написал "!join" - твой персонаж появился. Написал "!chop" - он рубит дерево. Нужна плавная анимация, синхронизация между всеми зрителями в реальном времени и сохранение прогресса между стримами. При этом игра должна работать не только как оверлей на стриме, но и как отдельное приложение в Telegram для мобильных зрителей.',
        solution: 'Рендеринг игрового мира на Canvas API с game loop на requestAnimationFrame - стабильные 60 FPS. Каждый кадр: обновление позиций персонажей, анимация действий, отрисовка карты и объектов. WebSocket-сервер на Node.js подключается к Twitch IRC и парсит команды из чата. Когда зритель пишет команду, сервер валидирует её, обновляет состояние игры и бродкастит изменения всем подключенным клиентам через WebSocket. Авторизация через Twitch OAuth - зритель логинится через Twitch и его персонаж привязывается к аккаунту. Инвентарь и трофеи хранятся в базе и сохраняются между сессиями. Для мобильных зрителей сделал Telegram Mini App - та же игра, но с тач-управлением вместо команд в чате. Комната автоматически синхронизируется со стримом через общий WebSocket.',
        result: 'Проект набрал 24 звезды на GitHub. В среднем 15 активных игроков на стриме - это высокое вовлечение для канала с ~15 зрителями. Зрители возвращаются на стримы чтобы продолжить прокачивать персонажа. Telegram Mini App расширил аудиторию - мобильные зрители подключаются к игре не открывая Twitch.',
      },
      en: {
        title: 'Real-time interactive game',
        description: 'Multiplayer Twitch chat game built on Canvas API and WebSocket. Viewers interact via chat commands, OAuth auth, inventory and trophy system.',
        task: 'I stream software development on Twitch. Viewers watch me code, but I wanted more interactivity - not just chat, but real interaction with what\'s on screen. The idea: a game where viewer characters live on the stream screen, controlled via chat commands. Type "!join" - your character appears. Type "!chop" - they chop a tree. Needed smooth animation, real-time sync across all viewers, and progress persistence between streams. The game should also work not just as a stream overlay but as a standalone Telegram app for mobile viewers.',
        solution: 'Game world rendering on Canvas API with a requestAnimationFrame game loop - stable 60 FPS. Each frame: update character positions, animate actions, draw map and objects. Node.js WebSocket server connects to Twitch IRC and parses chat commands. When a viewer sends a command, the server validates it, updates game state, and broadcasts changes to all connected clients via WebSocket. Authentication through Twitch OAuth - viewers log in via Twitch and their character is tied to their account. Inventory and trophies are stored in the database and persist across sessions. Built a Telegram Mini App for mobile viewers - the same game but with touch controls instead of chat commands. The room auto-syncs with the stream through a shared WebSocket.',
        result: 'The project earned 24 GitHub stars. Average of 15 active players per stream - that\'s high engagement for a channel with ~15 viewers. Viewers return to streams to keep leveling their character. The Telegram Mini App expanded the audience - mobile viewers join the game without opening Twitch.',
      },
    },
  },
  {
    key: 'nextorders-i18n',
    project: 'NextOrders',
    tags: ['Nuxt', 'Nuxt UI', 'Pinia', 'VueUse'],
    icon: 'i-lucide-languages',
    image: '/cases/nextorders-i18n.webp',
    content: {
      ru: {
        title: 'Мультиязычная архитектура для open-source платформы',
        description: 'Спроектировал i18n-архитектуру open-source проекта с поддержкой 11 языков. Новый язык добавляется за 30 минут без знания кода.',
        task: 'NextOrders - open-source платформа доставки еды. Проект задумывался для использования в разных странах: Россия, Турция, Германия, Бразилия. Каждый ресторан работает на своем языке, а меню, интерфейс и уведомления должны быть переведены. Стандартный подход с JSON-файлами переводов быстро превращается в хаос: строки дублируются, ключи рассинхронизируются между языками, а контрибьюторы из других стран не могут добавить свой язык без погружения в кодовую базу. Нужна архитектура, где перевод на новый язык - это задача для переводчика, а не для программиста.',
        solution: 'Построил i18n-архитектуру на nuxt-i18n с четким разделением: один JSON-файл на язык, плоская структура ключей с неймспейсами (menu.title, cart.empty, order.status.pending). Все ключи типизированы через TypeScript - IDE подсказывает доступные ключи и ругается если перевод отсутствует. Создал шаблон locale-template.json со всеми ключами и комментариями на английском - контрибьютор копирует его, переименовывает в свой язык и переводит значения. Pluralization через встроенные правила ICU - для русского одна форма множественного числа, для арабского шесть, и всё работает из коробки. Роутинг с префиксами (/en/menu, /tr/menu) с автоопределением языка по заголовку Accept-Language браузера. SEO-мета и hreflang теги генерируются автоматически для каждой языковой версии. Компоненты Nuxt UI адаптируются под RTL-языки (арабский, иврит) через CSS logical properties.',
        result: 'Платформа поддерживает 11 языков: русский, английский, турецкий, немецкий, португальский, испанский, французский, казахский, китайский, корейский, арабский. Контрибьюторы из 5 стран добавили свои языки самостоятельно - в среднем 30 минут на полный перевод 120 ключей. Ни один PR с переводом не потребовал помощи мейнтейнера с кодом. TypeScript ловит пропущенные переводы на этапе сборки, а не в продакшене.',
      },
      en: {
        title: 'Multilingual architecture for an open-source platform',
        description: 'Designed an i18n architecture for an open-source project supporting 11 languages. A new language can be added in 30 minutes with no coding required.',
        task: 'NextOrders is an open-source food delivery platform. The project was designed for use across countries: Russia, Turkey, Germany, Brazil. Each restaurant operates in its own language, and the menu, UI, and notifications all need translation. The standard approach with JSON translation files quickly becomes chaotic: strings get duplicated, keys go out of sync between languages, and contributors from other countries can\'t add their language without diving into the codebase. The architecture needed to make translation a task for a translator, not a programmer.',
        solution: 'Built the i18n architecture on nuxt-i18n with clear separation: one JSON file per language, flat key structure with namespaces (menu.title, cart.empty, order.status.pending). All keys are typed via TypeScript - the IDE suggests available keys and errors on missing translations. Created a locale-template.json with all keys and English comments - a contributor copies it, renames to their language, and translates the values. Pluralization via built-in ICU rules - Russian has one plural form pattern, Arabic has six, and everything works out of the box. Routing with prefixes (/en/menu, /tr/menu) with auto-detection from the browser\'s Accept-Language header. SEO meta and hreflang tags are auto-generated for each language version. Nuxt UI components adapt to RTL languages (Arabic, Hebrew) via CSS logical properties.',
        result: 'The platform supports 11 languages: Russian, English, Turkish, German, Portuguese, Spanish, French, Kazakh, Chinese, Korean, and Arabic. Contributors from 5 countries added their languages independently - averaging 30 minutes for a full translation of 120 keys. Not a single translation PR required maintainer help with code. TypeScript catches missing translations at build time, not in production.',
      },
    },
  },
  {
    key: 'nextorders-conversion',
    project: 'NextOrders',
    tags: ['Nuxt', 'TypeScript', 'Tailwind CSS'],
    icon: 'i-lucide-trending-up',
    image: '/cases/nextorders-conversion.webp',
    content: {
      ru: {
        title: 'Конверсионные фичи для e-commerce',
        description: 'Рекомендации, видео товаров, мгновенный поиск, заказ без регистрации. Каждая фича нацелена на рост среднего чека и конверсии в заказ.',
        task: 'NextOrders - open-source платформа доставки еды. При тестировании на реальных клиентах обнаружились типичные проблемы e-commerce: пользователь добавлял одну позицию и уходил оформлять, хотя мог бы взять гарнир или напиток. Средний чек был ниже рыночного. Конверсия из корзины в оплату тоже страдала - форма регистрации отпугивала: зачем создавать аккаунт чтобы заказать пиццу один раз? Страницы товаров были статичными - фото и текст, никакой визуализации. Поиск по меню работал через перезагрузку страницы, пользователь терял контекст.',
        solution: 'Реализовал четыре конверсионные фичи. Первая - блок "Часто покупают вместе": анализирует историю заказов, находит пары товаров которые часто заказывают вместе (пицца + напиток, бургер + картофель фри) и показывает их на странице товара с кнопкой "Добавить все". Вторая - видео товаров: короткие зацикленные видео вместо статичных фото, автоплей при наведении, ленивая загрузка чтобы не грузить страницу. Третья - мгновенный поиск: debounce 150мс, поиск по названию и описанию, результаты появляются в выпадающем списке без перехода на другую страницу, клик добавляет в корзину прямо из результатов. Четвертая - гостевой чекаут: оформление заказа за 60 секунд без регистрации, только имя, телефон и адрес, данные сохраняются в localStorage для повторных заказов.',
        result: 'Средний чек вырос на 18% благодаря рекомендациям - пользователи добавляют 1-2 позиции из блока "Часто покупают вместе". Конверсия из корзины в заказ увеличилась на 30% после внедрения гостевого чекаута. Видео товаров повысили время на странице в 2 раза. Мгновенный поиск используют 40% посетителей - это самый короткий путь от входа до добавления в корзину.',
      },
      en: {
        title: 'E-commerce conversion features',
        description: 'Recommendations, product videos, instant search, guest checkout. Each feature targets higher average order value and checkout conversion.',
        task: 'NextOrders is an open-source food delivery platform. Testing with real clients revealed typical e-commerce problems: users added one item and went to checkout, even though they could have grabbed a side or a drink. Average order value was below market. Cart-to-payment conversion suffered too - the registration form was a deterrent: why create an account to order pizza once? Product pages were static - photos and text, no visualization. Menu search required a page reload, losing user context.',
        solution: 'Implemented four conversion features. First - "Frequently bought together" block: analyzes order history, finds item pairs frequently ordered together (pizza + drink, burger + fries) and displays them on the product page with an "Add all" button. Second - product videos: short looping videos instead of static photos, autoplay on hover, lazy loading to keep the page fast. Third - instant search: 150ms debounce, search by name and description, results appear in a dropdown without page navigation, click adds to cart directly from results. Fourth - guest checkout: order in 60 seconds without registration, just name, phone, and address, data saved in localStorage for repeat orders.',
        result: 'Average order value increased 18% thanks to recommendations - users add 1-2 items from the "Frequently bought together" block. Cart-to-order conversion grew 30% after implementing guest checkout. Product videos doubled time on page. Instant search is used by 40% of visitors - it\'s the shortest path from landing to adding to cart.',
      },
    },
  },
  {
    key: 'ecommerce-nextjs',
    project: 'B2B E-commerce',
    tags: ['Next.js', 'React', 'TypeScript', 'PostgreSQL'],
    icon: 'i-lucide-shopping-cart',
    image: '/cases/ecommerce-nextjs.webp',
    content: {
      ru: {
        title: 'E-commerce каталог на Next.js с тысячами товаров',
        description: 'Интернет-магазин картриджей и канцелярии на Next.js. Каталог с тысячами SKU, фильтрация, поиск и SSR без тормозов.',
        task: 'Компания продавала картриджи для принтеров и канцелярию - тысячи позиций с разными характеристиками: совместимость с моделями принтеров, тип (оригинал/совместимый/восстановленный), цвет, ресурс страниц. Старый сайт на WordPress + WooCommerce не справлялся: страница каталога с 50 товарами грузилась 8-10 секунд, фильтрация по параметрам перезагружала всю страницу, поиск по артикулу работал через полнотекстовый поиск MySQL и выдавал нерелевантные результаты. При 3000+ товаров сайт становился практически непригоден для работы. B2B-клиенты (офис-менеджеры, закупщики) уходили к конкурентам потому что не могли быстро найти нужный картридж по модели принтера.',
        solution: 'Построил новый фронтенд на Next.js с App Router. Каталог работает через ISR (Incremental Static Regeneration) - страницы категорий генерируются статически и обновляются раз в час, при этом первая загрузка мгновенная. Для страниц товаров использовал SSR с кэшированием - данные о наличии и цене всегда актуальны. Фильтрация реализована на клиенте через React Server Components + Suspense: пользователь выбирает модель принтера, тип картриджа, цветность - результаты обновляются мгновенно без перезагрузки, URL меняется для шаринга отфильтрованной выдачи. Поиск через отдельный API-эндпоинт с индексом по артикулам, названиям и совместимым моделям - debounce 200мс, результаты в dropdown. Пагинация через виртуальный скролл для категорий с 500+ товарами - рендерятся только видимые карточки.',
        result: 'Время загрузки каталога снизилось с 8-10 секунд до 400мс благодаря ISR. Фильтрация по модели принтера работает мгновенно - клиент находит нужный картридж за 10-15 секунд вместо минуты. Поиск по артикулу выдает точное совпадение первым результатом. Каталог из 3000+ товаров работает без тормозов на любом устройстве.',
      },
      en: {
        title: 'Next.js e-commerce catalog with thousands of products',
        description: 'Online store for printer cartridges and office supplies on Next.js. Catalog with thousands of SKUs, filtering, search, and SSR without lag.',
        task: 'The company sold printer cartridges and office supplies - thousands of items with varying attributes: printer model compatibility, type (original/compatible/remanufactured), color, page yield. The old WordPress + WooCommerce site couldn\'t cope: a catalog page with 50 products loaded in 8-10 seconds, parameter filtering reloaded the entire page, article search used MySQL full-text search and returned irrelevant results. With 3000+ products the site was practically unusable. B2B clients (office managers, procurement) left for competitors because they couldn\'t quickly find the right cartridge by printer model.',
        solution: 'Built a new frontend on Next.js with App Router. The catalog works via ISR (Incremental Static Regeneration) - category pages are statically generated and revalidated hourly, making first load instant. Product pages use SSR with caching - stock and price data is always current. Filtering is client-side via React Server Components + Suspense: user selects printer model, cartridge type, color - results update instantly without reload, URL changes for sharing filtered results. Search through a dedicated API endpoint with indexes on article numbers, names, and compatible models - 200ms debounce, results in a dropdown. Pagination via virtual scroll for categories with 500+ products - only visible cards are rendered.',
        result: 'Catalog load time dropped from 8-10 seconds to 400ms thanks to ISR. Filtering by printer model works instantly - clients find the right cartridge in 10-15 seconds instead of a minute. Article number search returns exact matches as the first result. A catalog of 3000+ products runs without lag on any device.',
      },
    },
  },
]
