(function (window) {
    'use strict';

    function rawValue(value) {
        return value === undefined || value === null ? '' : String(value).trim();
    }

    // Different video sources may identify the same episode as `01` and `1`.
    // Strip leading zeroes only from purely numeric values so labels such as
    // `OVA 1` and `Special 01` keep their original meaning.
    function normalize(value) {
        var text = rawValue(value);
        if (!/^\d+$/.test(text)) return text;
        return text.replace(/^0+(?=\d)/, '');
    }

    function valueOf(item) {
        item = item || {};
        var values = [item.number, item.episode, item.index];
        for (var index = 0; index < values.length; index++) {
            if (values[index] !== undefined && values[index] !== null && values[index] !== '') {
                return normalize(values[index]);
            }
        }
        return '';
    }

    function key(value) {
        return normalize(value).toLowerCase();
    }

    function same(left, right) {
        var leftKey = key(left);
        var rightKey = key(right);
        return leftKey !== '' && leftKey === rightKey;
    }

    function number(value) {
        var normalized = normalize(value).replace(',', '.');
        if (!/^\d+(?:\.\d+)?$/.test(normalized)) return NaN;
        return Number(normalized);
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Episode = window.LampaYaniEpisode = {
        normalize: normalize,
        valueOf: valueOf,
        key: key,
        same: same,
        number: number
    };
}(window));
