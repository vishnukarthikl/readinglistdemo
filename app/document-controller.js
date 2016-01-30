function DocumentController($scope, $uibModal) {
    $scope.setSummary = function (showMore) {
        $scope.showMore = showMore;
        var abstractText = $scope.documentInfo.document.abstractText;
        if (showMore) {
            $scope.abstract = abstractText;
        } else {
            $scope.abstract = abstractText.split(/\s+/).slice(0, 40).join(" ");
        }
    };

    $scope.ratingBarsCount = 10;
    $scope.showMore = false;
    $scope.setSummary();

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
            if (percentage >= i * 10) {
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
                $scope.documentInfo = documentInfo;
                $scope.getDocumentUrl = function () {
                    var baseUrl = "http://www.aclweb.org/anthology/";
                    return baseUrl + $scope.documentInfo.document.id;
                };
                $scope.topicStrengthStyle = function (allTopics, topic) {
                    var strength = (255 - topic.value / allTopics[0].value * 255).toFixed(0);
                    var redStrength = 38;
                    var greenStrength = 166;
                    var blueStrength = 154;

                    if (greenStrength <= strength) {
                        greenStrength = strength
                    }
                    if (redStrength <= strength) {
                        redStrength = strength
                    }
                    if (blueStrength <= strength) {
                        blueStrength = strength
                    }
                    var topicColor = 'rgb(' + redStrength + ',' + greenStrength + ',' + blueStrength + ')';
                    return {color: topicColor}
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