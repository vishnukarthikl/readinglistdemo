function TopicController($scope) {
    $scope.topicStrengthStyle = function (allTopics, topic) {
        var strength = (255 - topic.value / allTopics[0].value * 255).toFixed(0);
        var greenStrength = 180;

        if (!($scope.isSelected() && greenStrength > strength)) {
            greenStrength = strength
        }
        var topicColor = 'rgb(' + strength + ',' + greenStrength + ',' + strength + ')';
        return {color: topicColor}
    };
    $scope.isSelected = function () {
        return R.contains($scope.data, $scope.selected)
    }
}