// require('./qr-bar-code-scanner.directive.css');
require('./qr-bar-code-scanner.module.js');
var ZXing = require('@zxing/library/esm5');

angular.module('qrBarCodeScanner').directive('qrBarCodeScanner', [function () {
    return {
        restrict: 'E',
        template: ('<div style="position: relative;">' + 
            '<span ng-if="scannerCtrl.currentCamera !== null && scannerCtrl.options.cameraSwitch && scannerCtrl.cameras.length > 1" ng-click="scannerCtrl.switchCamera()" style="position: absolute; top: 1rem; left: 1rem; z-index: 10000;">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path fill="#fff" stroke="#000" d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z"/></svg>' + 
            '</span>' +
            '<video style="width: 100%;"></video>' +
        '</div>'),
        scope: {
            options: '@', // must be object
            onError: '=', // called on error
            onScan: '=', // called on scan
        },
        bindToController: true,
        controllerAs: 'scannerCtrl',
        controller: qrBarCodeScannerController,
        link: function(scope, element, attrs, controller) {
            controller.video = element.find("video")[0];
        }
    };
}]);

qrBarCodeScannerController.$inject = ['$scope'];

function qrBarCodeScannerController($scope) {
    var ctrl = this;

    ctrl.currentCamera = null;
    ctrl.cameras = [];

    ctrl.$onInit = $onInit;
    ctrl.switchCamera = switchCamera;

    // --------------------------------

    var codeReader;
    function $onInit() {
        setTimeout(function () {
            ctrl.options = Object.assign({}, {
                frontFacing: false,
                cameraSwitch: true,
                switchOnDoubleClick: true,
            }, ctrl.options || {});
    
            var reader = new ZXing.MultiFormatReader();
            var options = new Map();
            options.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, Object.values(ZXing.BarcodeFormat));
            reader.setHints(options);
    
            codeReader = new ZXing.BrowserCodeReader(reader, 500);
    
            codeReader
                .getVideoInputDevices()
                .then(function (videoInputDevices) {
                    ctrl.cameras = videoInputDevices;
    
                    ctrl.currentCamera = 0;
                    var deviceId = ctrl.cameras[0].deviceId;
                    if (!ctrl.options.frontFacing) {
                        ctrl.cameras.forEach(function (camera, i) {
                            var label = camera.label || camera.name;
                            if (
                                label &&
                                /back/g.test(label.toLowerCase()) ||
                                /rück/g.test(label.toLowerCase()) ||
                                /world/g.test(label.toLowerCase())
                            ) {
                                ctrl.currentCamera = i;
                                deviceId = camera.deviceId;
                            }
                        });
                    }
    
                    codeReader
                        .decodeFromInputVideoDevice(deviceId, ctrl.video)
                        .then(function (result) {
                            ctrl.onScan && ctrl.onScan(result.text, result);
                        })
                        .catch(function (err) {
                            console.error('Cannot parse qr or bar code.', err);
                            ctrl.onError && ctrl.onError(err);
                        });
                    
                    $scope.$apply();
                })
                .catch(function (err) {
                    console.error('Cannot inizialize video camera stream.', err);
                    ctrl.onError && ctrl.onError(err);
                });

                ctrl.video.addEventListener('dblclick', function () {
                    if (ctrl.options.switchOnDoubleClick) {
                        switchCamera();
                    }
                });
            }, 250);
    }

    function switchCamera() {
        ctrl.currentCamera = (ctrl.currentCamera + 1) % ctrl.cameras.length;
        deviceId = ctrl.cameras[ctrl.currentCamera].deviceId;

        codeReader.reset();
        codeReader
            .decodeFromInputVideoDevice(deviceId, ctrl.video)
            .then(function (result) {
                ctrl.onScan && ctrl.onScan(result.text, result);
            })
            .catch(function (err) {
                console.error('Cannot parse qr or bar code.', err);
                ctrl.onError && ctrl.onError(err);
            });
    }
}