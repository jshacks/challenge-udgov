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

        _self.actions = {};
        _self.actions.setActiveDataset = setActiveDataset;
        _self.actions.getDocumentData = getDocumentData;

        _self.watchers = {};
        _self.watchers.init = init;

        function getDocumentData(document, event) {
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
                .get('http://localhost:8001/api/document/' + document.id, {
                    params: {
                        url: document.download_url,
                        format: document.format
                    }
                })
                .then(function (response) {
                    // $mdDialog.show({
                    //     template:
                    //     '<div>' +
                    //         '{{ ctrl.data }}' +
                    //     '</div>',
                    //     locals: {
                    //         data: response.data
                    //     },
                    //     bindToController: true,
                    //     controllerAs: 'ctrl',
                    //     controller: 'DialogController',
                    //     targetEvent: event,
                    //     clickOutsideToClose: true
                    // });

                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Done')
                            .textContent(response.data)
                            .ok('Got it!')
                            .targetEvent(event)
                    );
                });
        }

        function setActiveDataset(dataset) {
            if(_self.data.activeDataset && dataset && _self.data.activeDataset.id == dataset.id) return;
            dataset.resources_number = dataset.resources.length;
            _self.data.activeDataset = dataset;
        }

        function init() {
            _self.data.datasetInfo = [
                'author',
                'author_email',
                'licence_title',
                'maintainer',
                'notes',
                'title',
                'resources_number'
            ];

            _self.data.supportedDocumentTypes = [
                'CSV',
                'XML',
                'XLS',
                'XLSX'
            ];

            $http
                .get('http://localhost:8001/api/datasets')
                .then(function (response) {
                    _self.data.datasets = response.data.results;
                    setActiveDataset(_self.data.datasets[0]);
                });
        }
    }
})();