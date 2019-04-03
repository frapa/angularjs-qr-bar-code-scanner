// require('./qr-bar-code-scanner.directive.css');
require('./qr-bar-code-scanner.module.js');

angular.module('qrBarCodeScanner').directive('qrBarCodeScanner', [function () {
    return {
        restrict: 'E',
        template: require('./qr-bar-code-scanner.directive.html'),
        scope: {
            options: '=', // must be array of objects
        },
        bindToController: true,
        controllerAs: 'scannerCtrl',
        controller: qrBarCodeScannerController,
    };
}]);

qrBarCodeScannerController.$inject = ['$scope'];

function qrBarCodeScannerController($scope) {
    const ctrl = this;

    ctrl.$onInit = $onInit;

    // --------------------------------

    function $onInit() {
    }
}