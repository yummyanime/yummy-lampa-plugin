(function (window) {
    'use strict';

    var descriptions = {
        ru: {
            'bisenen': 'Истории с акцентом на привлекательных мужских персонажей, их отношения, характеры и эмоциональные конфликты.',
            'dzesej': 'Аниме для взрослой женской аудитории: зрелые отношения, повседневные проблемы, карьера и реалистичные жизненные решения.',
            'maho-sedze': 'Истории о героинях, которые используют магию, превращения и особые способности, чтобы защищать близких и противостоять злу.',
            'sedze': 'Аниме, ориентированное на юную женскую аудиторию, с особым вниманием к чувствам, отношениям и взрослению героев.',
            'sedze-aj': 'Романтические и эмоциональные истории об отношениях между девушками.',
            'senen': 'Динамичные истории о взрослении, дружбе, соперничестве и преодолении испытаний, рассчитанные прежде всего на подростковую аудиторию.',
            'senen-aj': 'Романтические и эмоциональные истории об отношениях между юношами.',
            'sejnen': 'Произведения для взрослой мужской аудитории со сложными конфликтами, серьёзными темами и более реалистичной подачей.',
            'detektiv': 'Расследования, загадки и поиск скрытых связей, где герои шаг за шагом раскрывают тайну или преступление.',
            'drama': 'Эмоциональные истории о сложных жизненных ситуациях, потерях, выборе и внутренних переживаниях персонажей.',
            'komediya': 'Лёгкие или сатирические истории, построенные на юморе, забавных ситуациях и ярких характерах.',
            'parodiya': 'Комедийное переосмысление известных жанров, сюжетных штампов, персонажей и произведений.',
            'meha': 'Фантастические истории о больших роботах, пилотах, технологиях и масштабных сражениях.',
            'mistika': 'Таинственные события, необъяснимые явления и скрытые силы, находящиеся за пределами обычного мира.',
            'priklyucheniya': 'Путешествия, открытия и испытания, которые ведут героев в новые места и меняют их жизнь.',
            'romantika': 'Истории о зарождении и развитии чувств, отношениях, признаниях и эмоциональной близости.',
            'triller': 'Напряжённые истории с опасностью, интригой и неожиданными поворотами, поддерживающими постоянное чувство тревоги.',
            'ugasy': 'Мрачные истории, созданные для ощущения страха и тревоги, с чудовищами, сверхъестественными угрозами или психологическим ужасом.',
            'fantastika': 'Миры будущего, научные открытия и необычные технологии, меняющие общество и жизнь героев.',
            'kosmicheskie-priklyucheniya': 'Путешествия между планетами, космические экспедиции, далёкие цивилизации и конфликты за пределами Земли.',
            'puteshestviya-vo-vremeni': 'Сюжеты, в которых перемещение во времени меняет судьбы персонажей, события прошлого или возможное будущее.',
            'fentezi': 'Вымышленные миры с магией, мифическими существами, древними легендами и необычными законами реальности.',
            'povsednevnost': 'Спокойные истории о повседневной жизни, дружбе, учёбе, работе и небольших событиях, раскрывающих характеры героев.',
            'sport': 'Истории о тренировках, соревнованиях, командной работе и стремлении спортсменов превзойти себя.',
            'psihologiya': 'Произведения, исследующие внутренний мир, мотивацию, страхи и психическое состояние персонажей.',
            'shkola': 'Истории, разворачивающиеся вокруг школьной жизни, учёбы, дружбы, клубов и отношений между учениками.',
            'istoricheskij': 'События в исторических эпохах или мирах, вдохновлённых реальными периодами, культурами и личностями.',
            'kiberpank': 'Высокие технологии, корпорации и социальное неравенство в мрачном будущем, где человек сталкивается с цифровым миром.',
            'muzyka': 'Истории о музыкантах, сцене, творчестве и отношениях, которые формируются вокруг совместных выступлений.',
            'sverh-estestvennoe': 'Призраки, духи, проклятия и другие явления, нарушающие привычные законы природы.',
            'isekai': 'Герой оказывается в другом мире, где ему приходится осваивать новые правила, способности и своё место в незнакомой реальности.'
        },
        en: {
            'bisenen': 'Stories centered on attractive male characters, their relationships, personalities and emotional conflicts.',
            'dzesej': 'Anime for an adult female audience, exploring mature relationships, work and realistic life choices.',
            'maho-sedze': 'Heroines use magic, transformations and special powers to protect others and confront evil.',
            'sedze': 'Character-driven stories for a young female audience, with emphasis on feelings, relationships and growing up.',
            'sedze-aj': 'Romantic and emotional stories about relationships between girls.',
            'senen': 'Energetic stories about growth, friendship, rivalry and overcoming challenges, primarily aimed at teenage viewers.',
            'senen-aj': 'Romantic and emotional stories about relationships between boys.',
            'sejnen': 'Anime for an adult male audience, featuring complex conflicts, serious themes and a more grounded tone.',
            'detektiv': 'Mysteries and investigations in which characters uncover hidden connections and solve crimes step by step.',
            'drama': 'Emotional stories about difficult circumstances, loss, personal choices and inner conflict.',
            'komediya': 'Lighthearted or satirical stories built around humor, amusing situations and colorful characters.',
            'parodiya': 'Comedic reinterpretations of familiar genres, tropes, characters and well-known works.',
            'meha': 'Science-fiction stories about giant robots, pilots, advanced technology and large-scale battles.',
            'mistika': 'Mysterious events, unexplained phenomena and hidden forces beyond the ordinary world.',
            'priklyucheniya': 'Journeys, discoveries and challenges that take characters to new places and transform their lives.',
            'romantika': 'Stories about developing feelings, relationships, confessions and emotional intimacy.',
            'triller': 'Tense stories driven by danger, intrigue and unexpected turns that maintain a constant sense of suspense.',
            'ugasy': 'Dark stories designed to evoke fear through monsters, supernatural threats or psychological horror.',
            'fantastika': 'Futures shaped by scientific discoveries and unusual technologies that transform society and human life.',
            'kosmicheskie-priklyucheniya': 'Interplanetary journeys, space expeditions, distant civilizations and conflicts beyond Earth.',
            'puteshestviya-vo-vremeni': 'Stories in which time travel changes personal destinies, past events or possible futures.',
            'fentezi': 'Imaginary worlds of magic, mythical creatures, ancient legends and extraordinary rules of reality.',
            'povsednevnost': 'Quiet stories about everyday life, friendship, school, work and small moments that reveal the characters.',
            'sport': 'Stories about training, competition, teamwork and athletes striving to surpass themselves.',
            'psihologiya': 'Works that explore the characters’ inner worlds, motivations, fears and mental states.',
            'shkola': 'Stories centered on school life, studies, friendships, clubs and relationships between students.',
            'istoricheskij': 'Stories set in historical eras or worlds inspired by real periods, cultures and people.',
            'kiberpank': 'High technology, corporations and inequality in a dark future where humanity confronts the digital world.',
            'muzyka': 'Stories about musicians, performance, creativity and relationships formed through making music together.',
            'sverh-estestvennoe': 'Ghosts, spirits, curses and other phenomena that break the familiar laws of nature.',
            'isekai': 'A protagonist enters another world and must learn its rules, abilities and their place in a new reality.'
        }
    };

    function clean(value) {
        return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function title(genre) {
        return clean(genre && (genre.title || genre.name || genre.label || genre.alias));
    }

    function key(genre) {
        return clean(genre && (genre.href || genre.slug || genre.alias)).toLowerCase();
    }

    function fallback(genreTitle, language) {
        if (language === 'en') return 'Anime in which “' + genreTitle + '” shapes the plot, atmosphere or the characters’ relationships.';
        if (language === 'uk') return 'Аніме, у яких жанр «' + genreTitle + '» помітно впливає на сюжет, атмосферу або стосунки персонажів.';
        return 'Аниме, в которых жанр «' + genreTitle + '» заметно влияет на сюжет, атмосферу или отношения персонажей.';
    }

    function resolve(genre, language) {
        language = String(language || 'ru').slice(0, 2);
        var genreTitle = title(genre);
        if (!genreTitle) return '';
        var dictionary = descriptions[language] || descriptions.ru;
        var description = dictionary[key(genre)] || (language === 'uk' ? descriptions.ru[key(genre)] : '');
        return description || fallback(genreTitle, language);
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.GenreDescriptions = window.LampaYaniGenreDescriptions = {
        resolve: resolve
    };
}(window));
