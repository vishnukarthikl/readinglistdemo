angular.module('app', [])
    .controller('ReadingListCtrl', ['$scope', '$http', function ReadingListCtrl($scope, $http) {
        $scope.filterTolerance = 10;
        $scope.numTags = 10;
        $http.get('matches.json').success(function (data) {
            $scope.result = data;
            $scope.matchedTopic = data['matched-topic'];
            $scope.dependentTopics = data['dependent-topics'];
            $scope.filterTag = "All"
        });
        $scope.changeFilterTag = function (newTag) {
            $scope.filterTag = newTag;
        };
        $scope.filterBySelectedTag = function (dependentTopic) {
            if ($scope.filterTag == "All") {
                return true;
            }
            var words = dependentTopic.words.map(function (word) {
                return word.word;
            });
            var foundIndex = words.indexOf($scope.filterTag);
            return (foundIndex > -1 ) && (foundIndex < $scope.filterTolerance);
        };
    }])
    .directive('document', function () {
        return {
            restrict: 'E',
            scope: {
                documentInfo: '=info'
            },
            templateUrl: 'document.html'
        };
    });
;