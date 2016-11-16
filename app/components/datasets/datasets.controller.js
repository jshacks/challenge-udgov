(function () {
    "use strict";

    angular
        .module('app')
        .controller('DatasetsController', DatasetsController);

    DatasetsController.$inject = [
        '$http', '$mdDialog'
    ];

    function DatasetsController($http, $mdDialog) {
        var _self = this;

        _self.data = {};
        // _self.data.api = "http://138.68.87.126:8000";
        _self.data.api = "http://localhost:8000";

        _self.actions = {};
        _self.actions.setActiveDataset = setActiveDataset;
        _self.actions.getDocumentData = getDocumentData;

        _self.loaders = {};
        _self.loaders.page = false;
        _self.loaders.resource = false;

        _self.watchers = {};
        _self.watchers.getActiveDataset = getActiveDataset;

        function getDocumentData(dataset, document, event) {
            _self.loaders.resource = true;

            if (_self.data.supportedDocumentsEnum.indexOf(document.format.toUpperCase()) < 0) {
                var _supportedFormats = "<ul>";
                for (var i = 0; i < _self.data.supportedDocumentsEnum.length; i++) {
                    _supportedFormats += "<li>" + _self.data.supportedDocumentsEnum[i] + "</li>";
                }
                _supportedFormats += "</ul>";

                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('Unsupported format')
                        .htmlContent('<div>File type is not supported.</div><div>We are currently supporting:</div>' + _supportedFormats)
                        .ariaLabel('Alert Dialog Demo')
                        .ok('Got it!')
                        .targetEvent(event)
                );
                return;
            }

            var _url = _self.data.api + '/api/package/' + dataset.id + '/resource/' + document.id;
            $mdDialog.show({
                template: [
                    '<section id="resource-dialog">',
                        '<md-toolbar layout="row">',
                            '<div flex class="resource-url" layout="row" layout-align="center center"><span>{{ url }}</span></div>',
                        '</md-toolbar>',
                        '<md-content app-loader="loaders.resource">',
                            '<div class="resource-viewer-container">',
                                '<json-formatter class="resource-viewer" json="json" open="5"></json-formatter>',
                            '</div>',
                    '</md-content>',
                    '</section>'
                ].join(''),
                locals: {
                    url: _url
                },
                controller: DialogController,
                targetEvent: event
            });

            DialogController.$inject = ['$scope', 'url'];
            function DialogController($scope, url) {
                $scope.loaders = {};
                $scope.loaders.resource = true;

                $scope.url = url;

                $http
                    .get(url)
                    .then(function (response) {
                        $scope.json = response.data;
                    })
                    .then(function () {
                        $scope.loaders.resource = false;
                    });
            }
        }

        function setActiveDataset(dataset) {
            if (_self.data.activeDataset && dataset && _self.data.activeDataset.id == dataset.id) return;

            dataset.resources_number = dataset.resources.length;

            for (var i = 0; i < dataset.resources.length; i++) {
                dataset.resources[i].name = dataset.resources[i].name || dataset.resources[i].url.match(/([^\/]+)(?=\.\w+$)/)[0];
                dataset.resources[i].format = dataset.resources[i].format || dataset.resources[i].url.match(/([^\/]+)(?=\.\w+$)/)[1];
            }

            _self.data.activeDataset = dataset;
        }

        function getActiveDataset(dataset) {
            return _self.data.activeDataset.id == dataset.id;
        }

        _self.$onInit = function () {
            _self.loaders.page = true;

            _self.data.datasetInfoEnum = [
                'notes',
                'licence_title',
                'author',
                'author_email',
                'maintainer',
                'resources_number'
            ];
            _self.data.supportedDocumentsEnum = [
                'CSV',
                'XLS',
                'XLSX',
                'XML'
            ];

            $http
                .get(_self.data.api + '/api/datasets')
                .then(function (response) {
                    _self.data.datasets = response.data.results;
                    setActiveDataset(_self.data.datasets[0]);
                })
                .then(function () {
                    _self.loaders.page = false;
                });
        }
    }
})();
