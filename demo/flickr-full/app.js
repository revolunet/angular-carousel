
document.ontouchmove = function(event) {
    // provent body move (ipad)
    var sourceElement = event.target || event.srcElement;
    if(!angular.element(sourceElement).hasClass('enable_touchmove')) {
      e.preventDefault();
    }
};

function partition(items, size) {
  var p = [];
  for (var i=Math.floor(items.length/size); i-->0; ) {
      p[i]=items.slice(i*size, (i+1)*size);
  }
  return p;
}

angular.module('myApp', ['angular-carousel', 'snap', 'truncate'])
  .controller('demoController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {

    var page = 1,
        maxPages = 3,
        term = null,
        tmpPages = [];

    function fetch() {
      // fetch a single result page
      var params = {
        method: 'flickr.photos.search',
        api_key: '98a83da50faeef3886249aef8ee3903e',
        text: term,
        per_page: 50,
        page: page,
        format: 'json'
      };
      $http.jsonp('http://api.flickr.com/services/rest/', {params: params});
    }

    window.jsonFlickrApi = function(result) {
      // flickr callback
      var newPics = [];
      angular.forEach(result.photos.photo, function(data) {
        newPics.push({
          image: "http://farm" + data.farm + ".staticflickr.com/" + data.server + "/" + data.id + "_" + data.secret,
          title: data.title,
          cls: ''
        });
      });

      // add to existing data
      $scope.pics = $scope.pics.concat(newPics);

      // distribute pages with 2, 3, 4, 5 items and choose tp accordingly
      var newPages = partition(newPics, 5);
      angular.forEach(newPages, function(page) {
        page.tpl = 'page-' + 5 + '-' + parseInt(Math.floor(Math.random() * 4) + 1, 0);
      });


      tmpPages = tmpPages.concat(newPages);

      if (page < maxPages) {
        // enable display then fetch some more pages
        page += 1;
        fetch();
      } else {
        $scope.pages = tmpPages;
        $scope.loading = false;
      }
    };

    $scope.toggle = function(item) {
      $scope.current = item;
      $scope.modalCls = '';
      $scope.showModal = true;
      $scope.blurred = true;
      $timeout(function() {
        $scope.modalCls = 'open';
      }, 0);
    };
    $scope.closeModal = function() {
      $scope.modalCls = '';
      $scope.blurred = false;
      $timeout(function() {
        $scope.showModal = false;
      }, 200);
    };

    function load(kwd) {
      if ($scope.showModal) $scope.closeModal();
      tmpPages = [];
      $scope.loading = true;
      term = kwd;
      page = 1;
      $scope.pics = [];
      $scope.pages = [];
      fetch();
    }

    // default search
    load('luxury appartment');
    $scope.load = load;
  }]);

