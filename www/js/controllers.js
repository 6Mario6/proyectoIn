angular.module('upet.controllers', [])
.controller('AppCtrl', ['$rootScope', '$ionicModal', 'AuthFactory', '$location', 'UserFactory', '$scope', 'Loader', 'AuthService',
    function($rootScope, $ionicModal, AuthFactory, $location, UserFactory, $scope, Loader,AuthService) {
       
           $rootScope.$on('showLoginModal', function($event, scope, cancelCallback, callback) {
           $scope.user = {
                "name": "",
                "email": "",
                "password": ""
            };
            $scope = scope || $scope;
            $scope.viewLogin = true;
            $ionicModal.fromTemplateUrl('templates/login.html', {
                scope: $scope
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
                $scope.switchTab = function(tab) {
                    if (tab === 'login') {
                        $scope.viewLogin = true;
                    } else {
                        $scope.viewLogin = false;
                    }
                }
                $scope.hide = function() {
                    $scope.modal.hide();
                    if (typeof cancelCallback === 'function') {
                        cancelCallback();
                    }
                }
                $scope.login = function() {
                    var email = this.user.email;
                    var password = this.user.password;
                    if (!email || !password) {
                      Loader.showLoading("Por favor ingresar campos validos");
                      return false;
                     }
                   
                    AuthService.login($scope.user.email, $scope.user.password)
                    .then(function (user) {
                        $rootScope.userEmail = $scope.user.email;
                        $rootScope.isAuthenticated = true;
                        $scope.modal.hide();
                         
                    });

                }
                $scope.register = function() {
                    var name = this.user.name;
                    var email = this.user.email;
                    var password = this.user.password;
            
                    if (!name||!email || !password) {
                      Loader.toggleLoadingWithMessage("Por favor ingresar campos validos");
                      return false;
                     }
                    AuthService.signup($scope.user.email,
                    $scope.user.name,
                    $scope.user.password)
                     .then(function(user) {
                        $rootScope.userEmail = user.email;
                        AuthFactory.setUser(user);
                        $rootScope.isAuthenticated = true;
                        $scope.modal.hide();
                    });

                }
            });
        });
        $rootScope.loginFromMenu = function() {
            $rootScope.$broadcast('showLoginModal', $scope, null, null);
        }
        $rootScope.logout = function() {
        Parse.User.logOut();
        Loader.toggleLoadingWithMessage('Sesión cerrada con éxito !', 2000);
        UserFactory.logout();
        $rootScope.isAuthenticated = false;
        $location.path('/app/welcome');
     
        };
    }
])
.controller('PetlistsCtrl', ['$scope', 'PetsFactory', 'LSFactory', 'Loader','$ionicModal','PetService','$ionicLoading','Internalselection','$ionicPopup',
    function($scope, PetsFactory, LSFactory, Loader,$ionicModal,PetService,$ionicLoading,Internalselection,$ionicPopup) {
        $scope.pets = PetService;
        $ionicLoading.show();
        $scope.pets.load().then(function () {
        $ionicLoading.hide();  
        });

        $scope.refreshItems = function () {
        $scope.pets.refresh().then(function () {
            $scope.$broadcast('scroll.refreshComplete');
        });
        };

        $scope.nextPage = function () {
        $scope.pets.next().then(function () {
            $scope.$broadcast('scroll.refreshComplete');
        });
        };

        $scope.selectPet=function(pet){
          Internalselection.setSelectedpet(pet);
        };
       

        $scope.showConfirm = function(pet) {
          var confirmPopup = $ionicPopup.confirm({
          title: 'Borrar mascota',
          template: '¿Seguro que quieres borrar esta mascota?',
          okType: 'button-royal'
          });
          confirmPopup.then(function(res) {
            if(res) {
            PetService.remove(pet);
            console.log('You are not sure');
              
            } else {
              console.log('You are not sure');
            }
          });
        };
    }
])
.controller('detailCtrl', function($scope, $stateParams,Internalselection) {
  $scope.pet = Internalselection.getSelectedpet();
})
.controller('newCtrl', function($rootScope,$state, $ionicPopup, $ionicLoading, $scope, $window, Loader,PetService) {
 $scope.datepickerObject = {
      titleLabel: 'Fecha de nacimiento', 
      todayLabel: 'Hoy',  
      closeLabel: 'Cerrar',  
      setLabel: 'OK',  
      setButtonType : 'button-royal',  
      todayButtonType : 'button-royal',  
      closeButtonType : 'button-royal',  
      inputDate: new Date(),   
      mondayFirst: true,  
      templateType: 'popup', 
      showTodayButton: 'false', 
      modalHeaderColor: 'bar-positive',
      modalFooterColor: 'bar-positive', 
      from: new Date(1988, 8, 2),  
      to: new Date(2018, 8, 25),   
      callback: function (val) {    
        datePickerCallback(val);
      }
    };
  var datePickerCallback = function (val) {
  if (typeof(val) === 'undefined') {
    console.log('No date selected');
  } else {
    $scope.datepickerObject.inputDate = val;
  }
};
$scope.resetFormData = function () {
        $scope.formData = {  
            'name': '',
            'species': '',
            'breed': '',
            'gender': '',
            'birthdate': '',
            'picture': null
        };
    };
$scope.resetFormData();
$scope.trackPet = function (form) {
        $scope.formData.birthdate = $scope.datepickerObject.inputDate ;
            if (!$scope.formData.name   || !$scope.formData.species|| !$scope.formData.breed|| !$scope.formData.gender|| !$scope.formData.birthdate) {
             Loader.toggleLoadingWithMessage("Por favor ingrese los datos", 2000);
            return false;
            }
            PetService.track($scope.formData).then(function () {     
                $scope.resetFormData(); 
                $state.go("app.petlist");                         
            });
        
};
$scope.addPicture = function () {
  var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA, // CAMERA
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 480,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
    $cordovaCamera.getPicture(options).then(function (imageData) {
      $scope.formData.picture = imageData;
    }, function (err) {
      console.error(err);
      $ionicPopup.alert({
        title:'Error getting picture',
        subTitle: 'We had a problem trying to get that picture, please try again'
      });
    });
  };

})
.controller('editCtrl', function($rootScope,$state, $ionicPopup, $ionicLoading, $scope, $window, Loader,PetService,Internalselection) {
 $scope.pet = Internalselection.getSelectedpet();
 $scope.datepickerObject = {
      titleLabel: 'Fecha de nacimiento', 
      todayLabel: 'Hoy',  
      closeLabel: 'Cerrar',  
      setLabel: 'OK',  
      setButtonType : 'button-royal',  
      todayButtonType : 'button-royal',  
      closeButtonType : 'button-royal',  
      inputDate: new Date(),   
      mondayFirst: true,  
      templateType: 'popup', 
      showTodayButton: 'false', 
      modalHeaderColor: 'bar-positive',
      modalFooterColor: 'bar-positive', 
      from: new Date(1988, 8, 2),  
      to: new Date(2018, 8, 25),   
      callback: function (val) {    
        datePickerCallback(val);
      }
    };
  var datePickerCallback = function (val) {
  if (typeof(val) === 'undefined') {
    console.log('No date selected');
  } else {
    $scope.datepickerObject.inputDate = val;
  }
};
$scope.resetFormData = function () {
        $scope.formData = {  
            'name': '',
            'species': '',
            'breed': '',
            'gender': '',
            'birthdate': '',
            'picture': null
        };
    };

$scope.resetFormData();
$scope.editPet = function (form) {
 $scope.formData.id=$scope.pet.id;   
 $scope.formData.birthdate = $scope.datepickerObject.inputDate ;

        
            console.log("newCtrl::trackPet");
            if (!$scope.formData.name   || !$scope.formData.species|| !$scope.formData.breed|| !$scope.formData.gender|| !$scope.formData.birthdate) {
             Loader.toggleLoadingWithMessage("Por favor ingrese los datos", 2000);
            return false;
            }
            PetService.update($scope.formData).then(function () {     
                $scope.resetFormData(); 
                $state.go("app.petlist");                         
            });
        
};
$scope.addPicture = function () {
    alert("rockout");

  var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA, // CAMERA
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 480,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };

    $cordovaCamera.getPicture(options).then(function (imageData) {
      $scope.formData.picture = imageData;
    }, function (err) {
      console.error(err);
      $ionicPopup.alert({
        title:'Error getting picture',
        subTitle: 'We had a problem trying to get that picture, please try again'
      });
    });
  };


})
.controller('locationsCtrl', function($scope,$http, $state,$ionicLoading,$localstorage) {
$ionicLoading.show(); 
var whichoption=$state.params.aId;
var baseGoogleMaps="https://maps.googleapis.com/maps/api/place/textsearch/json?query=";
var apiKey="&key=AIzaSyAemxSjzF8S6j9ND6dB2j6clMKygtK7e9U";
$scope.posts =[];
var base;
 $scope.refreshItems = function () {
  switch (whichoption) {
      case "1":
        base= 'peluqueria+canina+medellin';
        $http.get(baseGoogleMaps+base+apiKey)
        .success(function(posts){
        $localstorage.setObject("Peluquerias",posts.results);
        $scope.posts=posts.results;
        $scope.$broadcast('scroll.refreshComplete');
        });
        break;
      case "2":
        base= 'pet+hotel+Medellin';
        $http.get(baseGoogleMaps+base+apiKey)
        .success(function(posts){
        $localstorage.setObject("Guarderias",posts.results);
        $scope.posts=posts.results;
        $scope.$broadcast('scroll.refreshComplete');
        });
        break;
      case "3":
      base= 'mascotas+tienda+Medellin';
      $http.get(baseGoogleMaps+base+apiKey)
      .success(function(posts){
      $localstorage.setObject("Tiendas",posts.results);  
      $scope.posts=posts.results;
      $scope.$broadcast('scroll.refreshComplete');
      });
        break;
      case "4":
      base= 'veterinaria+Medellin';
      $http.get(baseGoogleMaps+base+apiKey)
      .success(function(posts){
      $localstorage.setObject("Veterinarias",posts.results);  
      $scope.posts=posts.results;
      $scope.$broadcast('scroll.refreshComplete');
      });
      break;
      case "5":
      base= 'pet+Medellin';
      $http.get(baseGoogleMaps+base+apiKey)
      .success(function(posts){
      $localstorage.setObject("Otros",posts.results);   
      $scope.posts=posts.results;
      $scope.$broadcast('scroll.refreshComplete');
      });
      break;
    }
      
};
switch (whichoption) {
      case "1":
      $scope.titleLocation="Peluquerias";
      posts = $localstorage.getObject("Peluquerias");
      if (posts.length > 0) {
          $scope.posts = posts;
          console.log(posts);
          $ionicLoading.hide();
      }else{
        base= 'peluqueria+canina+medellin';
        $http.get(baseGoogleMaps+base+apiKey)
        .success(function(posts){
        $localstorage.setObject("Peluquerias",posts.results);
        $scope.posts=posts.results;
        $ionicLoading.hide();
        });
      }
     /* */
        break;
      case "2":
      $scope.titleLocation="Guarderias";
      posts = $localstorage.getObject("Guarderias");
      if (posts.length > 0) {
          $scope.posts = posts;
          console.log(posts);
          $ionicLoading.hide();
      }else{
        base= 'pet+hotel+Medellin';
        $http.get(baseGoogleMaps+base+apiKey)
        .success(function(posts){
        $localstorage.setObject("Guarderias",posts.results);
        $scope.posts=posts.results;
        $ionicLoading.hide();
        });
      }
        break;
      case "3":
      $scope.titleLocation="Tiendas";
      posts = $localstorage.getObject("Tiendas");
      if (posts.length > 0) {
          $scope.posts = posts;
          console.log(posts);
          $ionicLoading.hide();
      }else{
      base= 'mascotas+tienda+Medellin';
      $http.get(baseGoogleMaps+base+apiKey)
      .success(function(posts){
      $localstorage.setObject("Tiendas",posts.results);  
      $scope.posts=posts.results;
      $ionicLoading.hide();
      });
      }
        break;
      case "4":
      $scope.titleLocation="Veterinarias";
      posts = $localstorage.getObject("Veterinarias");
      if (posts.length > 0) {
          $scope.posts = posts;
          console.log(posts);
          $ionicLoading.hide();
      }else{
      base= 'veterinaria+Medellin';
      $http.get(baseGoogleMaps+base+apiKey)
      .success(function(posts){
      $localstorage.setObject("Veterinarias",posts.results);  
      $scope.posts=posts.results;
      $ionicLoading.hide();
      });
      }
        break;
      case "5":
      $scope.titleLocation="Otros";
      posts = $localstorage.getObject("Otros");
      if (posts.length > 0) {
          $scope.posts = posts;
          console.log(posts);
          $ionicLoading.hide();
      }else{
      base= 'pet+Medellin';
      $http.get(baseGoogleMaps+base+apiKey)
      .success(function(posts){
      $localstorage.setObject("Otros",posts.results);   
      $scope.posts=posts.results;
      $ionicLoading.hide();
      });
      }
      break;
}             
})
.controller('mapCtrl', function($scope, $stateParams,Internalselection) {
  $scope.map = { 
    center: { 
      latitude: 6.25578716589216,longitude: -75.56854621914067 
    }, zoom: 12 
  };
$scope.marker={};
});
