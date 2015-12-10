function TopicController($scope) {
    $scope.topicStrengthStyle = function (allTopics, topic) {
        var strength = (255 - topic.value / allTopics[0].value * 255).toFixed(0);
        var topicColor = 'rgb(' + strength + ',' + strength + ',' + strength + ')';
        return {color: topicColor}
    };
}