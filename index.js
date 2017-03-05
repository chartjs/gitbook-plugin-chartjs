'use strict';

let yaml = require('js-yaml');

let uuid = 0;

function readConfig(content) {
    let config = null;
    let error = null;

    try {
        config = JSON.parse(content);
    } catch (e) {
        error = e;
    }

    if (!error && config instanceof Object) {
        return config;
    }

    try {
        config = yaml.safeLoad(content);
    } catch (e) {
        console.error(
            'Failed to parse Chart.js config:',
            content[0] === '{'? error : e);
    }

    return config || {};
}

function snippet(id, config, width, height) {
    let attributes = '';

    if (width !== undefined || width !== null) {
        attributes += ' width=' + width;
    }
    if (height !== undefined || height !== null) {
        attributes += ' height=' + height;
    }

    return '<div class="chartjs-wrapper">'+
                '<canvas id="' + id + '" class="chartjs"' + attributes + '></canvas>'+
                '<script>'+
                    'new Chart('+
                        'document.getElementById("' + id + '"),'+
                        JSON.stringify(config) + ');'+
                '</script>'+
            '</div>';
}

module.exports = {
    book: {
        assets: './assets'
    },

    blocks: {
        chartjs: {
            process: function(block) {
                let id = 'chartjs-' + uuid++;
                let config = readConfig(block.body.trim());
                let width = config.width || block.kwargs.width;
                let height = config.height || block.kwargs.height;
                return snippet(id, config, width, height);
            }
        }
    },

    hooks: {
        'page:before': function(page) {
            // Support for chartjs code block
            page.content = page.content.replace(
                /^```chartjs((.*\r?\n)+?)?```$/igm,
                '{% chartjs %}$1{% endchartjs %}');
            return page;
        }
    }
};
