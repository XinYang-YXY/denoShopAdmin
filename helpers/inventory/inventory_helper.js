const moment = require('moment');

module.exports = {
    readMore: (str) => {
        if (str.length >= 30) {
            return str.substring(0, 30) + '.....';
        } else {
            return str
        }
    },
    formatDate: function (date, targetFormat) {
        return moment(date).format(targetFormat);
    },
    imageUrl: function (string, ind) {
        return JSON.parse(string)[ind];
    },
    select: function (value, options) {
        return options.fn(this).split('\n').map(function (v) {
                var t = 'value="' + value + '"'
                return !RegExp(t).test(v) ? v : v.replace(t, t + ' selected="selected"')
            }).join('\n')
    }
};