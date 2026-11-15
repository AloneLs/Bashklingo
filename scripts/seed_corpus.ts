import { SQL } from 'bun';

const sql = new SQL(process.env.DATABASE_URL || 'postgres://bashkling_user:bashkling_password@127.0.0.1:5433/bashkling_db');

try {
    await sql`
        INSERT INTO schools (name, city, total_score) VALUES
        ('Республиканская полилингвальная многопрофильная гимназия № 1', 'Уфа', 12450),
        ('Башкирский лицей-интернат № 3', 'Стерлитамак', 9820),
        ('Башкирская гимназия им. Ш. Бабича', 'Сибай', 8740),
        ('Гимназия-интернат', 'Баймак', 7630),
        ('Башкирская гимназия № 4', 'Нефтекамск', 6950)
        ON CONFLICT DO NOTHING
    `;

    await sql`
        INSERT INTO achievements (id, title, description, icon, category, target_val) VALUES
        ('first_step', 'Первый шаг', 'Пройдите первый урок на экотропе', 'star', 'lesson', 1),
        ('daily_goal', 'Цель дня', 'Завершите ежедневное задание', 'target', 'daily', 1),
        ('streak_3', '3 дня подряд', 'Удерживайте серию 3 дня', 'fire', 'streak', 3),
        ('honey_week', 'Неделя с мёдом', 'Соберите 100 капель мёда', 'drop', 'honey', 100),
        ('streak_5', 'Серия из 5', 'Пройдите 5 уроков без ошибок', 'shield', 'lesson', 5),
        ('sharp_eye', 'Зоркий глаз', 'Исправьте неточный перевод корпуса', 'eye', 'corpus', 1),
        ('editor', 'Редактор корпуса', 'Верифицируйте 10 фрагментов', 'edit', 'corpus', 10),
        ('vocab_50', 'Словарь: 50 слов', 'Выучите 50 башкирских слов', 'book', 'vocab', 50),
        ('fragments_50', '50 фрагментов', 'Помогите перевести 50 цитат', 'archive', 'corpus', 50)
        ON CONFLICT (id) DO NOTHING
    `;

    await sql`
        INSERT INTO trail_nodes (node_key, title, biome, order_index, icon, lesson_type) VALUES
        ('shulgan_1', 'Вход в пещеру: Сәләмләү', 'shulgan-tash', 1, 'cave', 'lesson'),
        ('shulgan_2', 'Наскальные рисунки: Ғаилә', 'shulgan-tash', 2, 'paint', 'lesson'),
        ('shulgan_3', 'Сундук предков: 9 уникальных букв', 'shulgan-tash', 3, 'chest', 'chest'),
        ('shulgan_4', 'Зал рисунков: Сандар (1-10)', 'shulgan-tash', 4, 'calc', 'lesson'),
        ('shulgan_5', 'Врата Шульган-Таш: Контрольный зачёт', 'shulgan-tash', 5, 'gate', 'gate'),

        ('agidel_1', 'Истоки Агидели: Тәбиғәт', 'agidel', 6, 'river', 'lesson'),
        ('agidel_2', 'Бортевая пасека: Башҡорт балы', 'agidel', 7, 'honey', 'lesson'),
        ('agidel_3', 'Сундук пасечника: Заморозка серии', 'agidel', 8, 'chest', 'chest'),
        ('agidel_4', 'Прибрежный лес: Ҡоштар һәм йәнлектәр', 'agidel', 9, 'tree', 'lesson'),
        ('agidel_5', 'Переправа Агидели: Послелоги буйлап/аша', 'agidel', 10, 'gate', 'gate'),

        ('toratau_1', 'Подножие шихана: Үндәшлек законы', 'toratau', 11, 'mountain', 'lesson'),
        ('toratau_2', 'Степные травы: Күплек ялғауҙары (-лар/-ләр)', 'toratau', 12, 'leaf', 'lesson'),
        ('toratau_3', 'Сундук геолога: 100 капель мёда', 'toratau', 13, 'chest', 'chest'),
        ('toratau_4', 'Священный склон: Ҡылымдар (Глаголы)', 'toratau', 14, 'compass', 'lesson'),
        ('toratau_5', 'Вершина Торатау: Синтаксис SOV', 'toratau', 15, 'gate', 'gate'),

        ('iremel_1', 'Тропа богатырей: Урал-батыр эпосы', 'iremel', 16, 'shield', 'lesson'),
        ('iremel_2', 'Плато ветров: Диалекты и аймаки', 'iremel', 17, 'wind', 'lesson'),
        ('iremel_3', 'Сундук Урал-батыра: Титул Проводника', 'iremel', 18, 'chest', 'chest'),
        ('iremel_4', 'Беседка мудреца: Мәҡәлдәр (Пословицы)', 'iremel', 19, 'scroll', 'lesson'),
        ('iremel_5', 'Пик Иремеля: Финал тропы Башкортостана', 'iremel', 20, 'flag', 'gate')
        ON CONFLICT (node_key) DO NOTHING
    `;

    const nodes = await sql`SELECT id, node_key FROM trail_nodes`;
    const nodeMap = new Map(nodes.map((n: { id: number; node_key: string }) => [n.node_key, n.id]));

    const shulgan1Id = nodeMap.get('shulgan_1');
    if (shulgan1Id) {
        await sql`
            INSERT INTO questions (node_id, type, prompt_ba, prompt_ru, audio_text, correct_answer, options, word_bank) VALUES
            (${shulgan1Id}, 'word_match', 'Һаумыһығыҙ', 'Здравствуйте (уважительно)', 'Һаумыһығыҙ', 'Здравствуйте', '["Здравствуйте", "До свидания", "Спасибо", "Пожалуйста"]'::jsonb, null),
            (${shulgan1Id}, 'sentence_builder', 'Сәләм, дуҫым!', 'Привет, мой друг!', 'Сәләм, дуҫым!', 'Сәләм дуҫым', null, '["Сәләм", "дуҫым", "һаумы", "хәйерле", "көн"]'::jsonb),
            (${shulgan1Id}, 'keyboard_input', 'Хәйерле иртә', 'Доброе утро', 'Хәйерле иртә', 'Хәйерле иртә', null, null),
            (${shulgan1Id}, 'listening', 'Рәхим итегеҙ!', 'Добро пожаловать!', 'Рәхим итегеҙ', 'Добро пожаловать', '["Добро пожаловать", "Счастливого пути", "Спокойной ночи", "До встречи"]'::jsonb, null),
            (${shulgan1Id}, 'word_match', 'Рәхмәт', 'Спасибо', 'Рәхмәт', 'Спасибо', '["Спасибо", "Извините", "Пока", "Привет"]'::jsonb, null)
        `;
    }

    const agidel1Id = nodeMap.get('agidel_1');
    if (agidel1Id) {
        await sql`
            INSERT INTO questions (node_id, type, prompt_ba, prompt_ru, audio_text, correct_answer, options, word_bank) VALUES
            (${agidel1Id}, 'word_match', 'Бал', 'Мёд', 'Бал', 'Мёд', '["Мёд", "Вода", "Река", "Цветок"]'::jsonb, null),
            (${agidel1Id}, 'sentence_builder', 'Бал ҡорто бал ташый.', 'Пчела носит мёд.', 'Бал ҡорто бал ташый.', 'Бал ҡорто бал ташый', null, '["Бал", "ҡорто", "ташый", "йыя", "сәскә"]'::jsonb),
            (${agidel1Id}, 'keyboard_input', 'Ағиҙел — ҙур йылға', 'Агидель — большая река', 'Ағиҙел — ҙур йылға', 'Ағиҙел ҙур йылға', null, null)
        `;
    }

    await sql`
        INSERT INTO translation_fragments (fragment_id, text_ba, lang_pair, translation, source_title, source_chapter, confirmed_count, status, difficulty_level) VALUES
        ('FRAG_001', 'Башҡортостан — дуҫлыҡ һәм берҙәмлек төйәге.', 'ba-ru', 'Башкортостан — край дружбы и единства.', 'Башҡорт энциклопедияһы', 'Том 1', 12, 'confirmed', 1),
        ('FRAG_002', 'Урал-батыр халыҡ бәхете өсөн үлемһеҙлек шишмәһен эҙләгән.', 'ba-ru', 'Урал-батыр искал родник бессмертия ради народного счастья.', 'Эпос «Урал-батыр»', 'Песнь 3', 8, 'confirmed', 2),
        ('FRAG_003', 'Шүлгәнташ мәмерйәһендәге боронғо һүрәттәр бөтә донъяға билдәле.', 'ba-ru', 'Древние наскальные рисунки пещеры Шульган-Таш известны всему миру.', 'Башҡортостан тәбиғәте', 'Глава 4', 5, 'confirmed', 2),
        ('FRAG_004', 'Ағиҙел йылғаһы буйлап ҡарағай һәм ҡайын урмандары шаулай.', 'ba-ru', 'Вдоль реки Агидель шумят сосновые и берёзовые леса.', 'Мостай Кәрим әҫәрҙәре', 'Очерки', 3, 'new', 2),
        ('FRAG_005', 'Торатау — башҡорт халҡының изге һәм бөйөк шиханы.', 'ba-ru', 'Торатау — священный и великий шихан башкирского народа.', 'Шихандар тарихы', 'Раздел 2', 15, 'confirmed', 1),
        ('FRAG_006', 'Бортсолоҡ — боронғо замандарҙан килгән милли кәсеп.', 'ba-ru', 'Бортничество — национальный промысел, пришедший из древних времён.', 'Урал халыҡтары', 'Глава 1', 4, 'new', 2),
        ('FRAG_007', 'Ирәмәл түбәһенән Урал тауҙарының гүзәл күренеше асыла.', 'ba-ru', 'С вершины Иремеля открывается прекрасный вид на Уральские горы.', 'Туризм в Башкортостане', 'Маршрут 7', 9, 'confirmed', 2),
        ('FRAG_008', 'Ҡурай моңо халыҡтың йөрәгендә мәңге йәшәй.', 'ba-ru', 'Мелодия курая вечно живёт в сердце народа.', 'Башҡорт музыкаһы', 'Введение', 21, 'confirmed', 1),
        ('FRAG_009', 'Өләсәйем тәмле сәй ҡайнатып, бал менән ҡунаҡ итте.', 'ba-ru', 'Бабушка вскипятила вкусный чай и угостила мёдом.', 'Зәйнәб Биишева «Яҡтыға»', 'Глава 2', 6, 'new', 1),
        ('FRAG_010', 'Йәйге көндә урман сәскәләре хуш еҫ тарата.', 'ba-ru', 'В летний день лесные цветы источают приятный аромат.', 'Башҡорт теле уҡыулығы', 'Урок 14', 11, 'confirmed', 1)
        ON CONFLICT (fragment_id) DO NOTHING
    `;

    console.log('Seed data successfully loaded');
} catch (e: unknown) {
    console.error('Seed failed:', e);
    process.exit(1);
} finally {
    await sql.close();
}
