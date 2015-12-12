angular.module('app', ['treeControl'])
    .controller('ReadingListCtrl', ['$scope', '$http', function ReadingListCtrl($scope, $http) {
        $scope.selectedTopics = [];
        $scope.treeOptions = {
            nodeChildren: "dependentTopics",
            dirSelectable: true,
            multiSelection: true,
            injectClasses: {
                "li": "topic-li"
            }
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

        function countNodes(topics, childNode) {
            if (topics == undefined) {
                return 0;
            }
            return R.reduce(function (total, topic) {
                return total + countNodes(topic[childNode], childNode)
            }, topics.length, topics);
        }

        $http.get('matches.json').success(function (data) {
            $scope.result = data;
            $scope.keyword = data['keyword'];
            $scope.matchedTopics = data['matchTopics'];
            $scope.allTopicsLength = countNodes($scope.matchedTopics, 'dependentTopics')
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
                data: '=data',
                selected: '=selected'
            },
            templateUrl: 'topic.html'
        };

    });