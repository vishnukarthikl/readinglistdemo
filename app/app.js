angular.module('app', [])
    .controller('ReadingListCtrl', ['$scope', '$http', function ReadingListCtrl($scope, $http) {
        $http.get('matches.json').success(function (data) {
            $scope.result = data
        })
    }])
    .directive('topic', function () {
        return {
            restrict: 'E',
            scope: {
                data: '=data',
                tags: '=tags'
            },
            templateUrl: 'topic.html'
        };
    })
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