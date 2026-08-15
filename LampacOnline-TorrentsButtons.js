(function () {
    'use strict';

    function startPlugin() {
        // Версия 9 - сброс кэша
        window.plugin_fast_torrents_v9_ready = true;

        // Внедряем CSS-стили
        var customStyles = '<style>' +
            '.btn--custom-red { background-color: rgba(220, 53, 69, 0.3) !important; transition: background-color 0.2s; }' +
            '.btn--custom-red.focus { background-color: #dc3545 !important; color: #fff !important; }' +
            '.btn--custom-green { background-color: rgba(40, 167, 69, 0.3) !important; transition: background-color 0.2s; }' +
            '.btn--custom-green.focus { background-color: #28a745 !important; color: #fff !important; }' +
            '</style>';
        $('head').append(customStyles);

        function add() {
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    
                    var render = e.object.activity.render();
                    
                    // Защита от дублирования
                    if (render.find('.view--torrent_fast').length) return;

                    // Создаем нашу кнопку Торрентов
                    var buttonHTML = '<div class="full-start__button selector view--torrent_fast btn--custom-green">' +
                        '<svg><use xlink:href="#sprite-torrent"></use></svg>' +
                        '<span>' + Lampa.Lang.translate('title_torrents') + '</span>' +
                        '</div>';
                    
                    var btn = $(buttonHTML);
                    var click_timeout = false;

                    btn.on('hover:enter click', function () {
                        if (click_timeout) return;
                        click_timeout = true;
                        setTimeout(function() { click_timeout = false; }, 500);

                        var year = ((e.data.movie.first_air_date || e.data.movie.release_date || '0000') + '').slice(0, 4);
                        var original_title = e.data.movie.original_title || e.data.movie.name || '';
                        var title = e.data.movie.title || e.data.movie.name || '';
                        
                        var combinations = {
                            'df': original_title,
                            'df_year': original_title + ' ' + year,
                            'df_lg': original_title + ' ' + title,
                            'df_lg_year': original_title + ' ' + title + ' ' + year,
                            'lg': title,
                            'lg_year': title + ' ' + year,
                            'lg_df': title + ' ' + original_title,
                            'lg_df_year': title + ' ' + original_title + ' ' + year
                        };

                        var parse_lang = Lampa.Storage.field('parse_lang') || 'lg_year';
                        var search_query = combinations[parse_lang] || (title + ' ' + year);

                        Lampa.Activity.push({
                            url: '',
                            title: Lampa.Lang.translate('title_torrents'),
                            component: 'torrents',
                            search: search_query,
                            search_one: title,
                            search_two: original_title,
                            movie: e.data.movie,
                            page: 1
                        });
                    });

                    // Ищем все необходимые оригинальные кнопки
                    var playBtn = render.find('.button--play');
                    var trailerBtn = render.find('.view--trailer');
                    var onlineBtn = render.find('.view--online').filter(function() {
                        return $(this).text().indexOf('Онлайн') !== -1;
                    });
                    
                    // Стилизуем кнопку "Онлайн" (красный цвет + замена иконки на Play)
                    if (onlineBtn.length) {
                        onlineBtn.addClass('btn--custom-red');
                        onlineBtn.find('svg').replaceWith('<svg><use xlink:href="#sprite-play"></use></svg>');
                    }
                    
                    if (playBtn.length) {
                        // 1. Ставим "Торренты" на место "Смотреть"
                        playBtn.after(btn);
                        
                        // 2. Ставим "Онлайн" ПЕРЕД кнопкой "Торренты"
                        if (onlineBtn.length) {
                            btn.before(onlineBtn);
                        }

                        // 3. Ставим "Трейлеры" ПОСЛЕ кнопки "Торренты"
                        if (trailerBtn.length) {
                            btn.after(trailerBtn);
                        }
                        
                        // Скрываем и отключаем оригинальную "Смотреть"
                        playBtn.hide().removeClass('selector');
                    } else {
                        // Резервный вариант, если вдруг кнопки "Смотреть" нет
                        var buttonsContainer = render.find('.full-start-new__buttons, .full-start__buttons').first();
                        buttonsContainer.append(btn);
                        
                        if (onlineBtn.length) btn.before(onlineBtn);
                        if (trailerBtn.length) btn.after(trailerBtn);
                    }
                }
            });
        }

        if (window.appready) {
            add();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') add();
            });
        }
    }

    if (!window.plugin_fast_torrents_v9_ready) {
        startPlugin();
    }

})();
