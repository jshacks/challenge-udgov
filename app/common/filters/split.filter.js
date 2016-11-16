(function () {

    angular.module('app').filter('replace', replace);

    function replace() {
        "use strict";

        return function(item, char, replaceWith) {
            return item.split(char).join(replaceWith);
        }
    }

})();