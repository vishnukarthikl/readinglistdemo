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

        $scope.$watch('isSelectAll', function (newVal) {
            if ($scope.matchedTopics) {
                if (newVal) {
                    $scope.selectAll();
                } else {
                    $scope.deSelectAll();
                }
            }
        });

        $scope.topicSelected = function (node) {
            if (!node.isSelected) {
                node.isSelected = true;
                $scope.selectedTopics.push(node);
            } else {
                node.isSelected = false;
                $scope.selectedTopics = R.filter(function (topic) {
                    return topic != node
                }, $scope.selectedTopics);
            }
        };

        $scope.selectAll = function () {
            $scope.selectedTopics = [];
            $scope.forEachTopic($scope.matchedTopics, function (topic) {
                topic.isSelected = true;
                $scope.selectedTopics.push(topic);
            });
        };

        $scope.deSelectAll = function () {
            $scope.selectedTopics = [];
            $scope.forEachTopic($scope.matchedTopics, function (topic) {
                topic.isSelected = false;
            });
        };

        $scope.forEachTopic = function recursiveApply(topics, f) {
            return R.map(function (topic) {
                f(topic);
                var childNode = 'dependentTopics';
                if (topic[childNode]) {
                    topic[childNode] = recursiveApply(topic[childNode], f)
                }
                return topic
            }, topics);

        };

        $scope.filteredDocuments = function () {
            return R.chain(function (topic) {
                return topic.documents
            }, $scope.selectedTopics);
        };

        $scope.countNodes = function (topics) {
            if (topics == undefined) {
                return 0;
            }
            return R.reduce(function (total, topic) {
                return total + $scope.countNodes(topic['dependentTopics'])
            }, topics.length, topics);
        };

        function setSelection(topics, selection) {
            return $scope.forEachTopic(topics, function (topic) {
                topic.isSelected = selection;
            });
        }

        $http.get('matches.json').success(function (data) {
            $scope.result = data;
            $scope.keyword = data['keyword'];
            $scope.matchedTopics = setSelection(data['matchTopics'], false);
            $scope.allTopicsLength = $scope.countNodes($scope.matchedTopics);
            $scope.isSelectAll = true;
            $scope.selectAll();
        });
    }])
    .directive('document', function () {
        return {
            restrict: 'E',
            controller: DocumentController,
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
                selected: '=selected',
                onselection: '=onselection',
                countNodes: '=nodecounter'
            },
            templateUrl: 'topic.html'
        };

    });