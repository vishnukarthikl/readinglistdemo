function DocumentController($scope, $uibModal) {
    $scope.baseUrl = "http://www.aclweb.org/anthology/";
    $scope.getDocumentUrl = function () {
        return $scope.baseUrl + $scope.documentInfo.id;
    };

    $scope.showAbstract = function () {
        var modalInstance = $uibModal.open({
            size: 'lg',
            templateUrl: 'abstract.html',
            controller: ["$scope", "$uibModalInstance", "documentInfo", function ($scope, $modalInstance, documentInfo) {
                $scope.documentInfo = documentInfo
            }],
            resolve: {
                documentInfo: function () {
                    return $scope.documentInfo;
                }
            }
        });

    };
}