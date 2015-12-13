function TopicController($scope) {
    $scope.topicStrengthStyle = function (allTopics, topic) {
        var strength = (255 - topic.value / allTopics[0].value * 255).toFixed(0);
        var redStrength = 38;
        var greenStrength = 166;
        var blueStrength = 154;

        if (!($scope.isSelected() && greenStrength > strength)) {
            greenStrength = strength
        }
        if (!($scope.isSelected() && redStrength > strength)) {
            redStrength = strength
        }
        if (!($scope.isSelected() && blueStrength > strength)) {
            blueStrength = strength
        }
        var topicColor = 'rgb(' + redStrength + ',' + greenStrength + ',' + blueStrength + ')';
        return {color: topicColor}
    };
    $scope.isSelected = function () {
        return R.contains($scope.data, $scope.selected)
    };

    $scope.getId = function (node) {
        return node.$$hashKey.split(':')[1];
    };

    $scope.topicSelectedUnder = function (topic) {
        if (topic == undefined) {
            return 0;
        }
        var count = 0;
        if (topic.isSelected) {
            count = 1;
        }
        if (topic.dependentTopics == undefined) {
            return count;
        }
        return R.reduce(function (total, topic) {
            return total + $scope.topicSelectedUnder(topic)
        }, count, topic.dependentTopics);
    }
}