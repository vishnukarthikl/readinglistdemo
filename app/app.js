angular.module('app', ['treeControl', 'ui.bootstrap', 'ui.materialize', 'angucomplete-alt', 'angularUtils.directives.dirPagination'])
    .controller('ReadingListCtrl', ['$scope', '$http', 'paginationService', function ReadingListCtrl($scope, $http, paginationService) {
        $scope.selectedTopics = [];
        $scope.expandedNodes = [];
        $scope.selectedTerms = [];
        $scope.filteredDocuments = [];

        $http.get('topic_terms.json').success(function (data) {
            $scope.topicTerms = R.map(function (term) {
                return {term: term}
            }, data);
        });

        $scope.selectedOrder = 'pageRankScore';
        $scope.documentOrderOptions = [{name: 'Pagerank score', field: 'pageRankScore'},
            {name: 'Relevance', field: 'relevanceScore'},
            {name: 'Time', field: 'year'},
            {name: 'Author reputation', field: 'authorScore'}];

        $scope.treeOptions = {
            nodeChildren: "dependentTopics",
            dirSelectable: true,
            multiSelection: true,
            injectClasses: {
                "li": "topic-li"
            }
        };

        $scope.$watch('selectedOrder', function () {
            $scope.selectedOrderOption = $scope.getOrder();
            $scope.stats = $scope.calculateStats();
            paginationService.setCurrentPage('__default', 1);
        });

        $scope.$watch('selectedTopics', function () {
            $scope.filteredDocuments = $scope.filterDocuments();
            $scope.stats = $scope.calculateStats();
            paginationService.setCurrentPage('__default', 1);
        }, true);

        $scope.$watch('selectedTerm', function (term) {
            if (term == undefined || $scope.selectedTerms.indexOf(term) > -1) {
                return
            }
            $scope.selectedTerms.push(term.title);
        }, true);

        $scope.removeTerm = function (term) {
            $scope.selectedTerms = R.filter(function (x) {
                return x != term
            }, $scope.selectedTerms)
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
                $scope.selectedTopics.unshift(node);
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

        $scope.filterDocuments = function () {
            return R.chain(function (topic) {
                return R.map(function (document) {
                    return {document: document, topic: topic.topic}
                }, topic.documents)
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

        $scope.getOrder = function () {
            return R.find(function (order) {
                return order.field == $scope.selectedOrder;
            }, $scope.documentOrderOptions)
        };

        function setSelection(topics, selection) {
            return $scope.forEachTopic(topics, function (topic) {
                topic.isSelected = selection;
            });
        }

        $scope.expandAll = function () {
            $scope.expandedNodes = [];
            $scope.forEachTopic($scope.matchedTopics, function (topic) {
                if (topic.dependentTopics) {
                    $scope.expandedNodes.push(topic);
                }
            });
        };

        $scope.calculateStats = function () {
            var max = R.reduce(function (max, current) {
                var currentVal = current.document[$scope.selectedOrder];
                if (currentVal > max) {
                    return currentVal;
                }
                return max;
            }, 0, $scope.filteredDocuments);
            var min = R.reduce(function (max, current) {
                var currentVal = current.document[$scope.selectedOrder];
                if (currentVal < max) {
                    return currentVal;
                }
                return max;
            }, Infinity, $scope.filteredDocuments);
            return {max: max, min: min}
        };

        $http.get('matches.json').success(function (data) {
            $scope.result = data;
            $scope.keyword = data['keyword'];
            $scope.matchedTopics = setSelection(data['matchTopics'], false);
            $scope.allTopicsLength = $scope.countNodes($scope.matchedTopics);
            $scope.isSelectAll = true;
            $scope.selectAll();
            $scope.expandAll();
        });
    }])
    .directive('document', function () {
        return {
            restrict: 'E',
            controller: DocumentController,
            scope: {
                documentInfo: '=info',
                order: '=order',
                stats: '=stats'
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