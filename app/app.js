angular.module('app', ['treeControl', 'ui.bootstrap', 'ui.materialize', 'angucomplete-alt', 'angularUtils.directives.dirPagination'])
    .controller('ReadingListCtrl', ['$scope', '$http', 'paginationService', function ReadingListCtrl($scope, $http, paginationService) {
        $scope.selectedTopics = [];
        $scope.expandedNodes = [];
        $scope.selectedTerms = [];
        $scope.filteredDocuments = [];
        $scope.hideTopics = true;
        $scope.hideTGraph = false;
        $scope.topics = 3;
        $scope.disableButtons = false;

        $http.get('topic_terms.json').success(function (data) {
            $scope.topicTerms = R.map(function (term) {
                return {term: term}
            }, data);
        });

        $scope.selectedOrder = 'index';
        $scope.documentOrderOptions = [{name: 'Concept Graph Traversal', field: 'index', reverse: true},
            {name: 'Pagerank', field: 'pageRankScore', reverse: false}
        ];

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
            if ($scope.selectedOrderOption.field == 'pageRankScore') {
                $scope.hideGraph = true;
                $scope.hideTopics = true;
                $scope.disableButtons = true;
            } else {
                $scope.disableButtons = false;
            }
            $scope.filteredDocuments = $scope.filterDocuments();
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

        $scope.showTopics = function () {
            if (!$scope.disableButtons) {
                $scope.hideTopics = false
            }
        };

        $scope.showGraph = function () {
            if (!$scope.disableButtons) {
                $scope.hideGraph = false
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

        function selectAllSimilarNodes(node) {
            $scope.forEachTopic($scope.matchedTopics, function (topic) {
                if (topic.topicName == node.topicName) {
                    topic.isSelected = true;
                    $scope.selectedTopics.unshift(topic);
                }
            });
        }

        function deSelectAllSimilarNodes(node) {
            $scope.forEachTopic($scope.matchedTopics, function (topic) {
                if (topic.topicName == node.topicName) {
                    topic.isSelected = false;
                }
            });
            $scope.selectedTopics = R.filter(function (topic) {
                return topic.topicName != node.topicName
            }, $scope.selectedTopics);
        }

        $scope.topicSelected = function (node) {
            if (!node.isSelected) {
                selectAllSimilarNodes(node);
            } else {
                deSelectAllSimilarNodes(node);
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
            if ($scope.selectedOrder == 'pageRankScore') {
                return R.map(function (document) {
                    return {document: document, topic: {}}
                }, $scope.baselineDocuments)
            }
            return R.chain(function (topic) {
                return R.map(function (document) {
                    return {document: document, topic: topic}
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

        function groupWords(words, n) {
            groups = [];
            for (var i = 0; i < words.length; i = i + n) {
                groups.push(words.slice(i, i + n))
            }
            return R.reduce(function (result, group) {
                return result + group.join(" ") + "\n"
            }, "", groups);
        }

        function processNodes(nodes) {
            return R.map(function (node) {
                var words = node.label.split(" ");
                if (node.label.length > 10 && words.length > 3) {
                    node.label = groupWords(words, 3)
                }
                if (node.matched) {
                    node.color = '#26a69a';
                }
                return node;
            }, nodes)
        }

        function addArrow(edges) {
            return R.map(function (edge) {
                edge.arrows = {middle: {scaleFactor: 1.2}};
                edge.value = undefined;
                return edge;
            }, edges)
        }

        $http.get('matches.json').success(function (data) {
            $scope.result = data;
            $scope.keyword = data['keyword'];
            $scope.graphResponse = data['graphResponse'];
            $scope.baselineDocuments = data['baseLineDocuments'];
            $scope.matchedTopics = setSelection(data['matchTopics'], false);
            $scope.allTopicsLength = $scope.countNodes($scope.matchedTopics);
            $scope.isSelectAll = true;
            $scope.selectAll();
            $scope.expandAll();
            (function initgraph() {

                var container = document.getElementById('mynetwork');
                $scope.nodes = new vis.DataSet(processNodes($scope.graphResponse.nodes));
                $scope.edges = new vis.DataSet(addArrow($scope.graphResponse.edges));
                var data = {
                    nodes: $scope.nodes,
                    edges: $scope.edges
                };
                var options = {
                    nodes: {
                        shape: 'dot',
                        size: 10,
                        font: {
                            size: 15,
                            background: 'white'
                        }
                    },
                    autoResize: true,
                    "physics": {
                        "repulsion": {
                            "centralGravity": 0,
                            "springLength": 45

                        },
                        "maxVelocity": 38,
                        "minVelocity": 0.75,
                        "solver": "repulsion"
                    }
                };
                var network = new vis.Network(container, data, options);
                network.on('click', function (properties) {
                    var topicData = $scope.nodes.get(properties.nodes[0]);
                    R.forEach(function (document) {
                        document.highlight = document.topic.topicName == topicData.label;
                    }, $scope.filteredDocuments);
                    console.log($scope.filteredDocuments);
                    $scope.$apply();
                });

            })();

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