(function () {
    "use strict";

    angular
        .module('app')
        .config(RouterConfig);

    RouterConfig.$inject = [
        '$urlMatcherFactoryProvider'
    ];

    function RouterConfig($urlMatcherFactoryProvider) {
        // trims trail slashes
        $urlMatcherFactoryProvider.defaultSquashPolicy();
    }

    angular
        .module('app')
        .config(RouterStatesConfig);

    RouterStatesConfig.$inject = [
        '$stateProvider', '$urlRouterProvider'
    ];

    function RouterStatesConfig($stateProvider, $urlRouterProvider) {
        // unmatched urls redirect to root
        $urlRouterProvider.otherwise('/datasets');

        // url states
        $stateProvider
        // authentication
            .state('Datasets', {
                url: '/datasets',
                views: {
                    main: {
                        templateUrl: 'components/datasets/datasets.view.html'
                    }
                }
            });
    }
})();
