function DocumentController($scope, $uibModal) {
    $scope.baseUrl = "http://www.aclweb.org/anthology/";
    $scope.ratingBarsCount = 10;

    $scope.getDocumentUrl = function () {
        return $scope.baseUrl + $scope.documentInfo.id;
    };

    $scope.calculatePercentage = function () {
        var field = $scope.order.field;
        var value = $scope.documentInfo.document[field];
        return (value - $scope.stats.min) / ($scope.stats.max - $scope.stats.min) * 100
    };


    $scope.getRatingBars = function () {
        var rating = new Array($scope.ratingBarsCount);
        var percentage = $scope.calculatePercentage();
        for (var i = 0; i < rating.length; i++) {
            var filled = false;
            if (percentage > i * 10) {
                filled = true;
            }
            rating[i] = {
                filled: filled
            }
        }

        return rating;
    };

    $scope.$watch('stats', function () {
        $scope.ratingBars = $scope.getRatingBars();
    }, true);


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