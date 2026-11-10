(function (window) {
    'use strict';

    function definitions(t, currentYear) {
        currentYear = Number(currentYear) || new Date().getFullYear();
        return [
            {
                key: 'type',
                title: t('catalog_filter_type'),
                values: [
                    {key: 'all', title: t('catalog_filter_all'), value: ''},
                    {key: 'tv', title: t('catalog_filter_tv'), value: 'tv'},
                    {key: 'movie', title: t('catalog_filter_movie'), value: 'movie'},
                    {key: 'shortfilm', title: t('catalog_filter_shortfilm'), value: 'shortfilm'},
                    {key: 'ova', title: 'OVA', value: 'ova'},
                    {key: 'ona', title: 'ONA', value: 'ona'},
                    {key: 'special', title: t('catalog_filter_special'), value: 'special'},
                    {key: 'shorttv', title: t('catalog_filter_shorttv'), value: 'shorttv'}
                ]
            },
            {
                key: 'status',
                title: t('catalog_filter_status'),
                values: [
                    {key: 'all', title: t('catalog_filter_all'), value: ''},
                    {key: 'ongoing', title: t('catalog_filter_ongoing'), value: 'ongoing'},
                    {key: 'released', title: t('catalog_filter_released'), value: 'released'},
                    {key: 'announcement', title: t('catalog_filter_announced'), value: 'announcement'}
                ]
            },
            {
                key: 'year',
                title: t('catalog_filter_year'),
                values: [
                    {key: 'all', title: t('catalog_filter_all'), value: null},
                    {key: 'current', title: String(currentYear), value: {from_year: currentYear, to_year: currentYear}},
                    {key: 'last3', title: t('catalog_filter_last_3_years'), value: {from_year: currentYear - 2, to_year: currentYear}},
                    {key: 'last5', title: t('catalog_filter_last_5_years'), value: {from_year: currentYear - 4, to_year: currentYear}},
                    {key: 'from2020', title: t('catalog_filter_from_2020'), value: {from_year: 2020}},
                    {key: 'from2010', title: t('catalog_filter_from_2010'), value: {from_year: 2010}}
                ]
            }
        ];
    }

    function isSet(value) {
        return value !== undefined && value !== null && value !== '';
    }

    function currentValue(params, field) {
        params = params || {};
        if (field.key === 'type') return String(params.types || '');
        if (field.key === 'status') return String(params.status || '');
        if (field.key === 'year') {
            var from = isSet(params.from_year) ? Number(params.from_year) : null;
            var to = isSet(params.to_year) ? Number(params.to_year) : null;
            return {from_year: from, to_year: to};
        }
        return '';
    }

    function selected(field, params) {
        var current = currentValue(params, field);
        return field.values.filter(function (item) {
            if (field.key !== 'year') return String(item.value || '') === String(current || '');
            var value = item.value || {};
            return (value.from_year || null) === current.from_year && (value.to_year || null) === current.to_year;
        })[0] || field.values[0];
    }

    function apply(params, field, value) {
        var result = Object.assign({}, params || {});
        result.offset = 0;
        if (field.key === 'type') {
            if (value) result.types = value;
            else delete result.types;
        } else if (field.key === 'status') {
            if (value) result.status = value;
            else delete result.status;
        } else if (field.key === 'year') {
            delete result.from_year;
            delete result.to_year;
            if (value && isSet(value.from_year)) result.from_year = Number(value.from_year);
            if (value && isSet(value.to_year)) result.to_year = Number(value.to_year);
        }
        return result;
    }

    function activeCount(params) {
        params = params || {};
        return (isSet(params.types) ? 1 : 0) +
            (isSet(params.status) ? 1 : 0) +
            (isSet(params.from_year) || isSet(params.to_year) ? 1 : 0);
    }

    function clear(params) {
        var result = Object.assign({}, params || {});
        ['types', 'status', 'from_year', 'to_year'].forEach(function (key) { delete result[key]; });
        result.offset = 0;
        return result;
    }

    function signature(params) {
        params = params || {};
        return [params.types || 'all', params.status || 'all', params.from_year || 'any', params.to_year || 'any'].join('-');
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.CatalogFilters = window.LampaYaniCatalogFilters = {
        definitions: definitions,
        selected: selected,
        apply: apply,
        clear: clear,
        activeCount: activeCount,
        signature: signature
    };
}(window));
