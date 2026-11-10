(function (window) {
    'use strict';

    var scopeStates = {};
    var scopeOrder = [];
    var MAX_SCOPES = 32;
    var SCOPED_ROOT = '[data-yani-navigation-scope]';

    function live(element) {
        return Boolean(element && document.documentElement.contains(element));
    }

    function asElement(value) {
        if (!value) return null;
        if (value.jquery) return value[0] || null;
        return value.nodeType ? value : null;
    }

    function touchScope(id) {
        var index = scopeOrder.indexOf(id);
        if (index >= 0) scopeOrder.splice(index, 1);
        scopeOrder.push(id);
        while (scopeOrder.length > MAX_SCOPES) delete scopeStates[scopeOrder.shift()];
    }

    function elementKey(element, root) {
        element = asElement(element);
        if (!element) return '';
        var attributes = ['data-yani-focus-key', 'data-yani-home-key', 'data-sort', 'data-yani-id', 'data-id'];
        for (var i = 0; i < attributes.length; i++) {
            var value = element.getAttribute && element.getAttribute(attributes[i]);
            if (value) return attributes[i] + ':' + value;
        }
        var data = element.card_data || $(element).data('card');
        if (data && typeof data === 'object') {
            var cardKeys = ['yani_id', 'yani_collection_id', 'yani_genre_id', 'id'];
            for (var c = 0; c < cardKeys.length; c++) {
                if (data[cardKeys[c]] !== undefined && data[cardKeys[c]] !== null && data[cardKeys[c]] !== '') {
                    return 'card:' + cardKeys[c] + ':' + String(data[cardKeys[c]]);
                }
            }
        }
        var collection = root && root.find ? root.find('.selector') : $();
        var index = collection.index(element);
        return index >= 0 ? 'index:' + index : '';
    }

    function elementByKey(key, root) {
        if (!key || !root || !root.find) return null;
        if (key.indexOf('index:') === 0) return root.find('.selector').eq(Number(key.slice(6)))[0] || null;
        if (key.indexOf('card:') === 0) {
            var parts = key.split(':');
            var cardKey = parts[1];
            var cardValue = parts.slice(2).join(':');
            var cardFound = null;
            root.find('.selector').each(function () {
                var data = this.card_data || $(this).data('card');
                if (!cardFound && data && String(data[cardKey]) === cardValue) cardFound = this;
            });
            return cardFound;
        }
        var separator = key.indexOf(':');
        if (separator < 1) return null;
        var attribute = key.slice(0, separator);
        var value = key.slice(separator + 1);
        var found = null;
        root.find('.selector').each(function () {
            if (!found && String(this.getAttribute && this.getAttribute(attribute) || '') === value) found = this;
        });
        return found;
    }

    function scrollPosition(collection) {
        var element = collection && collection.jquery ? collection[0] : collection;
        return element && typeof element.scrollTop === 'number' ? element.scrollTop : 0;
    }

    function createScope(options) {
        options = options || {};
        var id = String(options.id || 'default');
        var state = scopeStates[id] || (scopeStates[id] = {key: '', last: null, scrollTop: 0});
        var namespace = '.yaniFocus' + id.replace(/[^a-z0-9]/gi, '');
        var destroyed = false;
        touchScope(id);

        function root() {
            var value = typeof options.root === 'function' ? options.root() : options.root;
            return value && value.jquery ? value : value ? $(value) : $();
        }

        function collection() {
            var value = typeof options.collection === 'function' ? options.collection() : options.collection;
            return value && value.jquery ? value : value ? $(value) : root();
        }

        function remember(value) {
            if (destroyed) return null;
            var currentRoot = root();
            var element = asElement(value);
            if (element) {
                var selector = $(element).closest('.selector');
                if (selector.length) element = selector[0];
            }
            if (!element) return null;
            state.last = element;
            state.key = elementKey(element, currentRoot);
            state.scrollTop = scrollPosition(collection());
            touchScope(id);
            return element;
        }

        function target(preferred) {
            var currentRoot = root();
            var element = asElement(preferred);
            if (live(element)) return element;
            if (live(state.last)) return state.last;
            element = elementByKey(state.key, currentRoot);
            if (element) return element;
            if (typeof options.fallback === 'function') element = asElement(options.fallback());
            return element || currentRoot.find(options.selector || '.selector').first()[0] || null;
        }

        function restore(preferred, updateScroll) {
            if (destroyed) return null;
            var currentCollection = collection();
            var element = target(preferred);
            if (currentCollection.length && state.scrollTop && currentCollection[0] && typeof currentCollection[0].scrollTop === 'number') {
                currentCollection[0].scrollTop = state.scrollTop;
            }
            if (Lampa.Controller && Lampa.Controller.collectionSet) Lampa.Controller.collectionSet(currentCollection);
            if (element && Lampa.Controller && Lampa.Controller.collectionFocus) {
                if (window.Navigator && Navigator.add) Navigator.add(element);
                Lampa.Controller.collectionFocus(element, currentCollection, true);
                remember(element);
                if (updateScroll !== false && options.scroll && options.scroll.update) options.scroll.update($(element), true);
            }
            return element;
        }

        function bind(container) {
            var host = container && container.jquery ? container : root();
            if (!host || !host.length) return;
            root().attr('data-yani-navigation-scope', id);
            host.off('hover:focus' + namespace).on('hover:focus' + namespace, options.selector || '.selector', function (event) {
                var element = remember(event.currentTarget || this);
                if (element && options.scroll && options.scroll.update) options.scroll.update($(element), true);
            });
        }

        function snapshot() {
            return {scope: id, key: state.key, element: state.last, collection: collection(), scrollTop: state.scrollTop, controller: 'content'};
        }

        function destroy(forget) {
            destroyed = true;
            var currentRoot = root();
            if (currentRoot && currentRoot.length) currentRoot.off(namespace);
            state.last = null;
            if (forget) {
                delete scopeStates[id];
                var index = scopeOrder.indexOf(id);
                if (index >= 0) scopeOrder.splice(index, 1);
            }
        }

        return {id: id, bind: bind, remember: remember, restore: restore, target: target, snapshot: snapshot, destroy: destroy};
    }

    function restoreSnapshot(snapshot) {
        if (!snapshot) return null;
        var state = snapshot.scope && scopeStates[snapshot.scope];
        var element = live(snapshot.element) ? snapshot.element : null;
        var collection = snapshot.collection;
        if (state && !element) element = state.last;
        if (!live(element) && state && snapshot.scope) {
            var roots = $(SCOPED_ROOT + '[data-yani-navigation-scope="' + String(snapshot.scope).replace(/"/g, '\\"') + '"]');
            element = elementByKey(state.key || snapshot.key, roots);
        }
        if (!collection || !collection.length || !live(collection[0])) collection = element ? $(element).closest('.scroll, ' + SCOPED_ROOT) : null;
        var controller = snapshot.controller && snapshot.controller !== 'select' && snapshot.controller !== 'input' ? snapshot.controller : 'content';
        if (Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle(controller);
        if (collection && collection.length && Lampa.Controller && Lampa.Controller.collectionSet) Lampa.Controller.collectionSet(collection);
        if (element && Lampa.Controller && Lampa.Controller.collectionFocus) {
            // After Select, Navigator can still point at hidden selectbox nodes.
            if (window.Navigator && Navigator.add) Navigator.add(element);
            Lampa.Controller.collectionFocus(element, collection && collection.length ? collection : undefined, true);
        }
        return element;
    }

    function captureSnapshot() {
        var element = document.querySelector(SCOPED_ROOT + ' .selector.focus') ||
            document.querySelector('.selector.focus') ||
            document.querySelector(SCOPED_ROOT + ' .selector') ||
            document.querySelector('.selector');
        var scopeRoot = element ? $(element).closest(SCOPED_ROOT) : $();
        var scope = scopeRoot.attr('data-yani-navigation-scope') || '';
        var collection = element ? $(element).closest('.scroll, ' + SCOPED_ROOT) : null;
        var state = scope && scopeStates[scope];
        return {scope: scope, controller: 'content', element: element || null, collection: collection && collection.length ? collection : null, key: state && state.key || elementKey(element, scopeRoot.length ? scopeRoot : collection)};
    }

    function attachComponent(component, options) {
        options = options || {};
        var scope = createScope(options);

        function patch(controller) {
            if (!controller || controller.yaniFocusScope === scope.id) return;
            var originalToggle = controller.toggle;
            controller.yaniFocusScope = scope.id;
            controller.toggle = function () {
                if (originalToggle) originalToggle.apply(this, arguments);
                setTimeout(function () { scope.restore(null, true); }, 0);
            };
        }

        if (component.on) {
            component.on('controller', patch);
            component.on('toggle', function () { scope.bind(); });
            component.on('scroll', function () { scope.bind(); });
        }
        var originalStart = component.start;
        component.start = function () {
            var result = originalStart && originalStart.apply(this, arguments);
            scope.bind();
            var enabled = Lampa.Controller && Lampa.Controller.enabled ? Lampa.Controller.enabled() : null;
            if (enabled && enabled.name === 'content') patch(enabled.controller);
            setTimeout(function () { scope.restore(null, true); }, 0);
            return result;
        };
        var originalDestroy = component.destroy;
        component.destroy = function () {
            scope.destroy();
            if (originalDestroy) return originalDestroy.apply(this, arguments);
        };
        return scope;
    }

    function moveDown(scroll) {
        if (Navigator.canmove('down')) Navigator.move('down');
        else if (scroll && scroll.wheel) scroll.wheel(250);
    }

    function moveUp(scroll) {
        if (Navigator.canmove('up')) Navigator.move('up');
        else if (scroll && scroll.wheel) scroll.wheel(-250);
    }

    function bindFocus(element, scroll, state) {
        element.on('hover:focus', function (event) {
            // `target` can be an icon or a text node inside a selector.  Lampa
            // Scroll must receive the selector itself, otherwise the focus can
            // travel below the viewport without moving the visible area.
            var target = event.currentTarget || event.target;
            if (state) state.last = target;
            if (scroll) scroll.update($(target), true);
        });
        return element;
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Navigation = window.LampaYaniNavigation = {
        moveDown: moveDown,
        moveUp: moveUp,
        bindFocus: bindFocus,
        createScope: createScope,
        attachComponent: attachComponent,
        captureSnapshot: captureSnapshot,
        restoreSnapshot: restoreSnapshot,
        elementKey: elementKey
    };
}(window));
