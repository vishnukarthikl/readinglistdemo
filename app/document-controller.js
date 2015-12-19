function DocumentController($scope) {
    $scope.baseUrl = "http://www.aclweb.org/anthology/";
    $scope.getDocumentUrl = function () {
        return $scope.baseUrl + $scope.documentInfo.ID;
    }
}