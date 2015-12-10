angular.module('app', ['treeControl'])
    .controller('ReadingListCtrl', ['$scope', '$http', function ReadingListCtrl($scope, $http) {

        $scope.treeOptions = {
            nodeChildren: "dependentTopics",
            dirSelectable: true,
            multiSelection: true
        };

        $scope.topicSelected = function (node, selected) {
            console.log(node);
        };

        $http.get('matches.json').success(function (data) {
            $scope.result = data;
            $scope.keyword = data['keyword'];
            $scope.matchedTopics = data['matchTopics'];
        });
    }])
    .directive('document', function () {
        return {
            restrict: 'E',
            scope: {
                documentInfo: '=info'
            },
            templateUrl: 'document.html'
        };
    })
    .directive('topic', function () {
        return {
            restrict: 'E',
            scope: {
                data: '=data'
            },
            templateUrl: 'topic.html'
        };

    });