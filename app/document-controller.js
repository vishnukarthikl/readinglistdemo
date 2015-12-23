function DocumentController($scope, $uibModal) {
    $scope.baseUrl = "http://www.aclweb.org/anthology/";
    $scope.getDocumentUrl = function () {
        return $scope.baseUrl + $scope.documentInfo.ID;
    };

    $scope.showAbstract = function () {
        var modalInstance = $uibModal.open({
            size: 'lg',
            templateUrl: 'abstract.html',
            controller: ["$scope", "$uibModalInstance", "document", function ($scope, $modalInstance, document) {
                $scope.document = document
            }],
            resolve: {
                document: function () {
                    return $scope.documentInfo;
                }
            }
        });

    };
}