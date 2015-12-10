angular.module('app', ['treeControl'])
    .controller('ReadingListCtrl', ['$scope', '$http', function ReadingListCtrl($scope, $http) {
        $scope.selectedTopics = [];
        $scope.treeOptions = {
            nodeChildren: "dependentTopics",
            dirSelectable: true,
            multiSelection: true
        };
        $scope.topicSelected = function (node, selected) {
            if (selected) {
                $scope.selectedTopics.push(node);
            } else {
                $scope.selectedTopics = R.filter(function (topic) {
                    return topic != node
                }, $scope.selectedTopics);
            }
        };

        $scope.filteredDocuments = function () {
            return R.chain(function (topic) {
                return topic.documents
            }, $scope.selectedTopics);
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
            controller: TopicController,
            scope: {
                data: '=data'
            },
            templateUrl: 'topic.html'
        };

    });