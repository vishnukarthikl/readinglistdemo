function DocumentController($scope, $uibModal) {
    $scope.setSummary = function (showMore) {
        $scope.showMore = showMore;
        var abstractText = $scope.documentInfo.document.abstractText;
        if (showMore) {
            $scope.abstract = abstractText;
        } else {
            $scope.abstract = abstractText.split(/\s+/).slice(0, 12).join(" ");
        }
    };

    $scope.showMore = false;
    $scope.setSummary();

    $scope.calculatePercentage = function () {
        var field = $scope.order.field;
        var value = $scope.documentInfo.document[field];
        return (value - $scope.stats.min) / ($scope.stats.max - $scope.stats.min) * 100
    };

    $scope.showAbstract = function () {
        var modalInstance = $uibModal.open({
            size: 'lg',
            templateUrl: 'abstract.html',
            controller: ["$scope", "$uibModalInstance", "documentInfo", function ($scope, $modalInstance, documentInfo) {
                $scope.documentInfo = documentInfo;
                $scope.getDocumentUrl = function () {
                    var baseUrl = "http://www.aclweb.org/anthology/";
                    return baseUrl + $scope.documentInfo.document.id;
                };
            }],
            resolve: {
                documentInfo: function () {
                    return $scope.documentInfo;
                }
            }
        });

    };
}