(function () {
    'use strict';

    function startPlugin() {
        // Версия 8 - сброс кэша
        window.plugin_fast_torrents_v8_ready = true;

        // Внедряем CSS-стили для наших кнопок напрямую в Lampa
        var customStyles = '<style>' +
            /* Стили для красной кнопки (Онлайн) */
            '.btn--custom-red { background-color: rgba(220, 53, 69, 0.3) !important; transition: background-color 0.2s; }' +
            '.btn--custom-red.focus { background-color: #dc3545 !important; color: #fff !important; }' +
            
            /* Стили для зеленой кнопки (Торренты) */
            '.btn--custom-green { background-color: rgba(40, 167, 69, 0.3) !important; transition: background-color 0.2s; }' +
            '.btn--custom-green.focus { background-color: #28a745 !important; color: #fff !important; }' +
            '</style>';
        $('head').append(customStyles);

        function add() {
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    
                    var render = e.object.activity.render();
                    
                    if (render.find('.view--torrent_fast').length) return;

                    // Добавили класс btn--custom-green нашей кнопке торрентов
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

                    var playBtn = render.find('.button--play');
                    
                    var onlineBtn = render.find('.view--online').filter(function() {
                        return $(this).text().indexOf('Онлайн') !== -1;
                    });
                    
                    // Если нашли кнопку "Онлайн", добавляем ей красный класс
                    if (onlineBtn.length) {
                        onlineBtn.addClass('btn--custom-red');
                    }
                    
                    if (playBtn.length) {
                        playBtn.after(btn);
                        
                        if (onlineBtn.length) {
                            btn.before(onlineBtn);
                        }
                        
                        playBtn.hide().removeClass('selector');
                    } else {
                        var buttonsContainer = render.find('.full-start-new__buttons, .full-start__buttons').first();
                        buttonsContainer.append(btn);
                        
                        if (onlineBtn.length) {
                            btn.before(onlineBtn);
                        }
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

    if (!window.plugin_fast_torrents_v8_ready) {
        startPlugin();
    }

})();