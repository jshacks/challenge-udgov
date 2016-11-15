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
        _self.data.api = "http://192.168.2.255:8001";

        _self.actions = {};
        _self.actions.setActiveDataset = setActiveDataset;
        _self.actions.getDocumentData = getDocumentData;

        _self.watchers = {};
        _self.watchers.init = init;

        function getDocumentData(dataset, document, event) {
            if(_self.data.supportedDocumentTypes.indexOf(document.format.toUpperCase()) < 0) {
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('Unsupported format')
                        .textContent('File type is not supported. Make sure you are trying to view a CSV, XML, XLS or XLSX.')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('Got it!')
                        .targetEvent(event)
                );
                return;
            }

            $http
                .get(_self.data.api + '/api/package/' + dataset.id + '/resource/' + document.id)
                .then(function (response) {
                    $mdDialog.show({
                        template:
                            '<div class="pop-up">' +
                                '<div class="header-title" >'+
                                    '<div class="end-point-label">' + 'GET' + '</div>'+
                                    '<div class="end-point-info">' +' http://192.168.2.255:8001/api/document/' + document.id + '</div>'+
                                '</div>'+
                                '<div class="json-parsed">'+
                                    '<pre>{{ json }}</pre>' +
                                '</div>'+
                            '</div>',
                        locals: {
                            json: JSON.stringify(response.data, undefined, 2)
                        },
                        controller: DialogController,
                        targetEvent: event
                    });

                    DialogController.$inject = ['$scope', 'json'];
                    function DialogController($scope, json) {
                        $scope.json = json;
                    }
                });
        }

        function setActiveDataset(dataset) {
            if(_self.data.activeDataset && dataset && _self.data.activeDataset.id == dataset.id) return;
            dataset.resources_number = dataset.resources.length;
            _self.data.activeDataset = dataset;
        }

        function init() {
            _self.data.datasetInfo = [
                'title',
                'notes',
                'licence_title',
                'author',
                'author_email',
                'maintainer',
                'resources_number'
            ];

            _self.data.supportedDocumentTypes = [
                'CSV',
                'XML',
                'XLS',
                'XLSX'
            ];

            $http
                .get(_self.data.api + '/api/datasets')
                .then(function (response) {
                    _self.data.datasets = response.data.results;
                    setActiveDataset(_self.data.datasets[0]);
                });
        }
    }
})();
