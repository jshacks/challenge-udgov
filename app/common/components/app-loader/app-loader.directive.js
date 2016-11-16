(function () {
    "use strict";

    angular
        .module("app")
        .directive("appLoader", function () {
            return {
                restrict: "A",
                /**
                 * @param element           - element object
                 * @param attrs             - attribute object
                 * @param attrs.appLoader   - attribute loader field
                 * @returns {string}
                 */
                template: function (element, attrs) {
                    return [
                        '<div class="loader-container" layout="row" layout-align="center center" ng-show="' + attrs.appLoader + '">',
                            '<md-progress-circular md-mode="indeterminate" md-diameter="35"></md-progress-circular>',
                        '</div>',
                        '<div class="data-container" ng-hide="' + attrs.appLoader + '">', element.html(), '</div>'
                    ].join('')
                }
            };
        });

})();
