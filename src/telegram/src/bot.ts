import { Bot, InlineKeyboard } from 'grammy';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9171865235:AAGHW4J3LSBmDAC4ARCFdOm73zc1p3zL3WQ';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://10.10.10.205:3000';
const BACKEND_URL = `http://127.0.0.1:${process.env.PORT || '8765'}`;

const bot = new Bot(BOT_TOKEN);

interface UserState {
    step: 'idle' | 'reg_role' | 'reg_school' | 'reg_class' | 'reg_lang' | 'school_name' | 'school_city' | 'edit_fragment';
    tempData: Record<string, string | number>;
}

const userStates = new Map<number, UserState>();
const userVoiceState = new Map<number, boolean>();

function getState(userId: number): UserState {
    if (!userStates.has(userId)) {
        userStates.set(userId, { step: 'idle', tempData: {} });
    }
    return userStates.get(userId)!;
}

bot.command('cancel', async (ctx) => {
    const s = getState(ctx.from.id);
    s.step = 'idle';
    s.tempData = {};
    await ctx.reply('Действие отменено. Вы находитесь в главном меню.');
});

bot.command('start', async (ctx) => {
    const name = ctx.from?.first_name || 'Дуҫым';

    try {
        await ctx.api.setChatMenuButton({
            chat_id: ctx.chat.id,
            menu_button: {
                type: 'web_app',
                text: '🍯 Basklingo',
                web_app: { url: FRONTEND_URL }
            }
        });
    } catch (_) {  }

    const keyboard = new InlineKeyboard()
        .webApp('🍯 Открыть Basklingo (iOS Glass TMA)', FRONTEND_URL)
        .row()
        .text('📝 Регистрация (/register)', 'btn_register')
        .text('🏫 Зарегистрировать школу', 'btn_school_reg')
        .row()
        .text('📖 Ежедневное задание (/daily)', 'btn_daily')
        .text('📊 Мой профиль', 'btn_profile')
        .row()
        .text('👨‍🏫 Отчёт учителя', 'btn_report')
        .text('⚖️ Модерация УФИЦ РАН', 'btn_moderate');

    await ctx.reply(
        `Һаумыһығыҙ, ${name}!\n\n` +
        `Добро пожаловать в **Basklingo** («Тел-суҡмаҡ») — образовательно-туристическую платформу по изучению башкирского языка и верификации корпуса (ТЗ №3)!\n\n` +
        `Команды платформы:\n` +
        `• /register — регистрация ученика или учителя (школа, класс, языковая пара)\n` +
        `• /school_reg — регистрация нового учебного заведения\n` +
        `• /daily — ежедневное задание корпуса (верификация перевода)\n` +
        `• /report — LMS-отчёт по классу для преподавателя\n` +
        `• /moderate — модерация спорных случаев экспертами УФИЦ РАН\n` +
        `• /cancel — отмена любого текущего действия\n\n` +
        `Нажмите кнопку ниже для запуска полноэкранного Telegram Mini App:`,
        { reply_markup: keyboard, parse_mode: 'Markdown' }
    );
});

bot.command('register', async (ctx) => {
    const s = getState(ctx.from.id);
    s.step = 'reg_role';
    s.tempData = {
        telegram_id: ctx.from.id,
        first_name: ctx.from.first_name || 'Пользователь',
        username: ctx.from.username || ''
    };

    const kb = new InlineKeyboard()
        .text('👨‍🎓 Я ученик', 'role_student')
        .text('👩‍🏫 Я преподаватель', 'role_teacher')
        .row()
        .text('🔬 Эксперт УФИЦ РАН', 'role_linguist_expert');

    await ctx.reply('Выберите вашу роль в системе Basklingo:', { reply_markup: kb });
});

bot.command('school_reg', async (ctx) => {
    const s = getState(ctx.from.id);
    s.step = 'school_name';
    s.tempData = {};
    await ctx.reply('Введите официальное название школы (например: «Башкирская гимназия № 4»):\nДля отмены введите /cancel');
});

bot.command('daily', async (ctx) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/translations/daily`);
        const data = await res.json() as { fragment?: { id: number; text_ba: string; translation: string; source_title: string; source_chapter?: string; confirmed_count: number } };
        if (!data.fragment) {
            await ctx.reply('На сегодня все фрагменты корпуса верифицированы!');
            return;
        }

        const f = data.fragment;
        const kb = new InlineKeyboard()
            .text('✅ Подтвердить перевод (+15 XP, +10 💧)', `vote_confirm_${f.id}`)
            .row()
            .text('✏️ Предложить исправление (+35 XP, +20 💧)', `vote_edit_${f.id}`)
            .row()
            .text('🔊 Синтез речи (TTS)', `tts_${f.id}`);

        await ctx.reply(
            `📜 **Ежедневный фрагмент корпуса (ТЗ №3)**\n\n` +
            `🔹 **Башкирский текст:**\n«${f.text_ba}»\n\n` +
            `🔸 **Автоперевод:**\n«${f.translation}»\n\n` +
            `📍 **Источник:** ${f.source_title} ${f.source_chapter ? `(${f.source_chapter})` : ''}\n` +
            `👥 **Подтверждений носителей:** ${f.confirmed_count}`,
            { reply_markup: kb, parse_mode: 'Markdown' }
        );
    } catch (_) {
        
        await ctx.reply('Сервер базы данных временно недоступен.');
    }
});

bot.command('report', async (ctx) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/lms/class-report?class_name=7А`);
        const data = await res.json() as { class_name: string; total_students: number; class_averages?: { avg_accuracy: number; avg_words: number; total_corrections: number }; students: Array<{ first_name: string; total_xp: number; accuracy_percent: number; words_learned: number }> };

        let text = `📊 **LMS-отчёт для преподавателя (Класс ${data.class_name})**\n\n`;
        text += `👥 Всего учеников: ${data.total_students}\n`;
        if (data.class_averages) {
            text += `🎯 Средняя точность: ${Math.round(data.class_averages.avg_accuracy || 0)}%\n`;
            text += `📚 Средний словарь: ${Math.round(data.class_averages.avg_words || 0)} слов\n`;
            text += `✏️ Исправлений корпуса классом: ${data.class_averages.total_corrections || 0}\n\n`;
        }
        text += `**Топ учеников по успеваемости:**\n`;
        data.students.slice(0, 5).forEach((st, i) => {
            text += `${i + 1}. ${st.first_name}: ${st.total_xp} XP | Точность ${st.accuracy_percent}% | ${st.words_learned} слов\n`;
        });

        await ctx.reply(text, { parse_mode: 'Markdown' });
    } catch (_) {
        
        await ctx.reply('Не удалось сформировать отчёт.');
    }
});

bot.command('moderate', async (ctx) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/translations/expert-review`);
        const data = await res.json() as { disputed_fragments?: Array<{ id: number; text_ba: string; translation: string; source_title: string; user_votes?: Array<{ suggested_text?: string }> }> };
        if (!data.disputed_fragments || data.disputed_fragments.length === 0) {
            await ctx.reply('Спорных переводов, требующих решения УФИЦ РАН, на данный момент нет.');
            return;
        }

        const f = data.disputed_fragments[0];
        let text = `⚖️ **Спорный случай для эксперта УФИЦ РАН (ID #${f.id})**\n\n`;
        text += `🔹 Башкирский оригинал: «${f.text_ba}»\n`;
        text += `🔸 Исходный автоперевод: «${f.translation}»\n`;
        text += `📍 Источник: ${f.source_title}\n\n`;

        if (f.user_votes && f.user_votes.length > 0) {
            text += `Предложения носителей языка:\n`;
            f.user_votes.forEach((v, i) => {
                if (v.suggested_text) text += `${i + 1}. «${v.suggested_text}»\n`;
            });
        }

        const kb = new InlineKeyboard()
            .text('✅ Утвердить перевод источника', `expert_approve_orig_${f.id}`)
            .row()
            .text('✏️ Утвердить первый вариант правок', `expert_approve_edit_${f.id}`);

        await ctx.reply(text, { reply_markup: kb, parse_mode: 'Markdown' });
    } catch (_) {
        
        await ctx.reply('Ошибка получения списка модерации.');
    }
});

bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from.id;
    const s = getState(userId);
    await ctx.answerCallbackQuery();

    if (data === 'btn_register') {
        s.step = 'reg_role';
        s.tempData = { telegram_id: userId, first_name: ctx.from.first_name || 'Пользователь', username: ctx.from.username || '' };
        const kb = new InlineKeyboard()
            .text('👨‍🎓 Ученик', 'role_student')
            .text('👩‍🏫 Преподаватель', 'role_teacher')
            .row()
            .text('🔬 Эксперт УФИЦ РАН', 'role_linguist_expert');
        await ctx.reply('Выберите вашу роль:', { reply_markup: kb });
        return;
    }

    if (data === 'btn_school_reg') {
        s.step = 'school_name';
        s.tempData = {};
        await ctx.reply('Введите официальное название школы (например: «Гимназия № 1»):');
        return;
    }

    if (data === 'btn_daily') {
        await ctx.reply('Загружаю задание дня...');
        return;
    }

    if (data === 'btn_report') {
        const res = await fetch(`${BACKEND_URL}/api/lms/class-report?class_name=7А`);
        const rep = await res.json() as { total_students: number };
        await ctx.reply(`📊 В классе 7А зарегистрировано ${rep.total_students || 0} учеников.`);
        return;
    }

    if (data === 'btn_moderate') {
        await ctx.reply('Для модерации введите команду /moderate');
        return;
    }

    if (data.startsWith('role_')) {
        const role = data.replace('role_', '');
        s.tempData.role = role;
        s.step = 'reg_school';

        const res = await fetch(`${BACKEND_URL}/api/schools/list`);
        const scData = await res.json() as { schools: Array<{ id: number; name: string; city: string }> };

        const kb = new InlineKeyboard();
        scData.schools.slice(0, 5).forEach((sc) => {
            kb.text(`${sc.city}: ${sc.name.slice(0, 20)}...`, `select_school_${sc.id}`).row();
        });

        await ctx.reply('Выберите вашу школу из реестра Республики Башкортостан:', { reply_markup: kb });
        return;
    }

    if (data.startsWith('select_school_')) {
        const scId = Number(data.replace('select_school_', ''));
        s.tempData.school_id = scId;
        s.step = 'reg_class';
        await ctx.reply('Напишите ваш учебный класс (например: 7А, 8Б или 10Л):');
        return;
    }

    if (data.startsWith('select_lang_')) {
        const langPair = data.replace('select_lang_', '');
        s.tempData.selected_lang_pair = langPair;

        const regRes = await fetch(`${BACKEND_URL}/api/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(s.tempData)
        });
        const regJson = await regRes.json() as { message: string };

        s.step = 'idle';
        s.tempData = {};

        const kb = new InlineKeyboard().webApp('🍯 Запустить Basklingo TMA', FRONTEND_URL);
        await ctx.reply(`🎉 ${regJson.message}!\nЯзыковая пара: ${langPair.toUpperCase()}.\nНажмите кнопку ниже для старта:`, { reply_markup: kb });
        return;
    }

    if (data.startsWith('vote_confirm_')) {
        const fid = Number(data.replace('vote_confirm_', ''));
        await fetch(`${BACKEND_URL}/api/translations/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: 1, fragment_id: fid, action: 'confirm' })
        });
        await ctx.reply('✅ Перевод подтверждён! Вам начислено +10 капель мёда 💧 и +15 опыта проводника 🤝');
        return;
    }

    if (data.startsWith('vote_edit_')) {
        const fid = Number(data.replace('vote_edit_', ''));
        s.step = 'edit_fragment';
        s.tempData.edit_fragment_id = fid;
        await ctx.reply('✏️ Напишите в ответном сообщении ваш точный вариант перевода на русский:');
        return;
    }

    if (data.startsWith('tts_')) {
        await ctx.reply('🔊 Синтез речи: озвучивание доступно в веб-приложении через локальный Silero TTS.');
        return;
    }

    if (data.startsWith('expert_approve_')) {
        const parts = data.split('_');
        const fid = Number(parts[3]);
        await fetch(`${BACKEND_URL}/api/translations/expert-decision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fragment_id: fid, final_translation: 'Утверждённый экспертом перевод' })
        });
        await ctx.reply('✅ Решение эксперта зафиксировано в академическом корпусе Республики Башкортостан.');
        return;
    }
});

bot.on('message:text', async (ctx) => {
    const text = ctx.message.text.trim();
    const userId = ctx.from.id;
    const s = getState(userId);

    if (text === '<voice/on/>') {
        userVoiceState.set(userId, true);
        await ctx.reply('🔊 Голосовой режим бота активирован');
        return;
    }
    if (text === '<voice/off/>') {
        userVoiceState.set(userId, false);
        await ctx.reply('🔇 Переключено в текстовый режим');
        return;
    }

    if (s.step === 'reg_class') {
        s.tempData.class_name = text;
        s.step = 'reg_lang';
        const kb = new InlineKeyboard()
            .text('Башкирский ↔ Русский (ba-ru)', 'select_lang_ba-ru')
            .row()
            .text('Башкирский ↔ Казахский (ba-kk)', 'select_lang_ba-kk')
            .row()
            .text('Башкирский ↔ English (ba-en)', 'select_lang_ba-en');
        await ctx.reply('Выберите основную языковую пару для изучения:', { reply_markup: kb });
        return;
    }

    if (s.step === 'school_name') {
        s.tempData.school_name = text;
        s.step = 'school_city';
        await ctx.reply('В каком городе или районе находится школа (например: Уфа, Стерлитамак, Баймак)?:');
        return;
    }

    if (s.step === 'school_city') {
        const schoolName = String(s.tempData.school_name);
        const city = text;
        s.step = 'idle';
        s.tempData = {};

        const res = await fetch(`${BACKEND_URL}/api/schools/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: schoolName, city })
        });
        const d = await res.json() as { message: string };
        await ctx.reply(`🏫 ${d.message}!\nТеперь ученики могут выбирать «${schoolName}» при регистрации.`);
        return;
    }

    if (s.step === 'edit_fragment') {
        const fid = Number(s.tempData.edit_fragment_id);
        s.step = 'idle';
        s.tempData = {};

        await fetch(`${BACKEND_URL}/api/translations/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: 1, fragment_id: fid, action: 'suggest_edit', suggested_text: text })
        });
        await ctx.reply('🎉 Спасибо! Ваш перевод отправлен на экспертную верификацию в УФИЦ РАН. Вам начислено +20 капель мёда 💧 и +35 опыта проводника 🤝');
        return;
    }

    const aiRes = await fetch(`${BACKEND_URL}/api/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
    });
    const aiData = await aiRes.json() as { answer?: string };
    const answer = aiData.answer || 'Һаумыһығыҙ! Мин һеҙгә нисек ярҙам итә алам?';

    await ctx.reply(`🦉 **«Тел-Остаһы»:**\n\n${answer}`, { parse_mode: 'Markdown' });
});

bot.catch((err) => {
    console.warn('[Telegram Bot Warning]:', err.message || err);
});

if (process.env.RUN_TELEGRAM_BOT === 'true') {
    bot.start({
        onStart(botInfo) {
            console.log(`Basklingo Telegram Bot (@${botInfo.username}) with FSM & Registration started successfully`);
        }
    }).catch((err) => {
        console.warn('[Telegram Bot Notice]: Polling inactive (network or VPN unreachable):', err.message || err);
    });
} else {
    console.log('[Telegram Bot] Бот отключен (RUN_TELEGRAM_BOT != true). Веб-платформа и TTS работают автономно.');
}
