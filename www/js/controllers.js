angular.module('upet.controllers', [])
.controller('AppCtrl', ['$rootScope', '$ionicModal', 'AuthFactory', '$location', 'UserFactory', '$scope', 'Loader', 'AuthService','PetService',
    function($rootScope, $ionicModal, AuthFactory, $location, UserFactory, $scope, Loader,AuthService,PetService) {
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
        $scope.pets.refresh().then(function () {
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
.controller('newCtrl', function($rootScope,$state, $ionicPopup, $ionicLoading, $scope, $window, $cordovaCamera, Loader,PetService) {
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
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY, // CAMERA
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
.controller('editCtrl', function($rootScope,$state, $ionicPopup, $ionicLoading, $scope, $window, Loader,PetService,Internalselection, $cordovaCamera) {
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
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY, // CAMERA
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
.controller('mapCtrl', function($scope, $state,Internalselection,$ionicLoading,$localstorage,$http) {
  $ionicLoading.show(); 
  $scope.map = { 
    center: { 
      latitude: 6.25578716589216,longitude: -75.56854621914067 
    }, zoom: 15
  };
  $scope.marker={
  };
  var baseGoogleMaps="https://maps.googleapis.com/maps/api/place/details/json?placeid=";
  var apiKey="&key=AIzaSyAemxSjzF8S6j9ND6dB2j6clMKygtK7e9U";
  var whichLocation=$state.params.bId;

  $scope.placelocation = $localstorage.getObject($state.params.bId);
 
      if (JSON.stringify($scope.placelocation) != '{}') {
         console.log($scope.placelocation);
          $scope.marker={
              latitude: $scope.placelocation.geometry.location.lat,
              longitude:$scope.placelocation.geometry.location.lng,
              title: $scope.placelocation.name+ "<br/>(Tap for directions)",
              showWindow: true
           };
           $scope.map.center.latitude=$scope.placelocation.geometry.location.lat;
           $scope.map.center.longitude=$scope.placelocation.geometry.location.lng;
          $ionicLoading.hide();
      }else{
          $http.get(baseGoogleMaps+whichLocation+apiKey)
          .success(function(placelocation){
          $localstorage.setObject(whichLocation,placelocation.result);   
          $scope.placelocation=placelocation.result;
          $scope.marker={
              latitude: $scope.placelocation.geometry.location.lat,
              longitude: $scope.placelocation.geometry.location.lng,
              title: $scope.placelocation.name+ "<br/>(Tap for directions)",
              showWindow: true
          
           };
          $scope.map.center.latitude=$scope.placelocation.geometry.location.lat;
          $scope.map.center.longitude=$scope.placelocation.geometry.location.lng;
          $ionicLoading.hide();
      });

      }
})
.controller('activitylistsCtrl', ['$scope', 'LSFactory', 'Loader','$ionicModal','ActivityService','$ionicLoading','InternalselectionActivity','$ionicPopup',
    function($scope, LSFactory, Loader,$ionicModal,ActivityService,$ionicLoading,InternalselectionActivity,$ionicPopup) {
   /*    var weekday = new Array(7);
      weekday[0]=  "Domingo";
      weekday[1] = "Lunes";
      weekday[2] = "Martes";
      weekday[3] = "Miercoles";
      weekday[4] = "Jueves";
      weekday[5] = "Viernes";
      weekday[6] = "Sabado";*/
      $scope.activities = ActivityService;
        $ionicLoading.show();
        $scope.activities.refresh().then(function () {
        $ionicLoading.hide();  
        });
        $scope.refreshItems = function () {
        $scope.activities.refresh().then(function () {
          
          $scope.$broadcast('scroll.refreshComplete');
        });
        };

        $scope.nextPage = function () {
        $scope.activities.next().then(function () {
            $scope.$broadcast('scroll.refreshComplete');
        });
        };

        $scope.selectActivity=function(activity){
          InternalselectionActivity.setSelectedactivity(activity);
        };
       

        $scope.showConfirm = function(activity) {
          var confirmPopup = $ionicPopup.confirm({
          title: 'Borrar actividad',
          template: '¿Seguro que quieres borrar esta actividad?',
          okType: 'button-royal'
          });
          confirmPopup.then(function(res) {
            if(res) {
            ActivityService.remove(activity);
            console.log('You are sure');
              
            } else {
              console.log('You are not sure');
            }
          });
        };
    }
])
.controller('newactivityCtrl', function($rootScope,$state, $ionicPopup, $ionicLoading, $scope, Loader,ActivityService,PetService,$ionicModal) {   
      $ionicModal.fromTemplateUrl('templates/selectPets.html', {
          scope: $scope,
          animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal=modal;
        $scope.pets = PetService;
        $scope.pets.refresh().then(function () {
        $ionicLoading.hide();  
        });
        
      });
      $scope.openModal = function() {
          $scope.modal.show();
      };
      $scope.closeModal = function() {
         $scope.modal.hide();
         if (typeof cancelCallback === 'function') {
                        cancelCallback();
          }
      };
        //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
         $scope.modal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
    // Execute action
      }); 

 $scope.datepickerObject = {
      titleLabel: 'Fecha de actividad', 
      todayLabel: 'Hoy',  
      closeLabel: 'Cerrar',  
      setLabel: 'OK',  
      setButtonType : 'button-royal',  
      todayButtonType : 'button-royal',  
      closeButtonType : 'button-stable',  
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

  $scope.timePickerObject = {
    inputEpochTime: new Date(),  //Optional
    step: 15,  //Optional
    format: 12,  //Optional
    titleLabel: 'Hora de actividad',  //Optional
    setLabel: 'Set',  //Optional
    closeLabel: 'Close',  //Optional
    setButtonType: 'button-royal',  //Optional
    closeButtonType: 'button-stable',  //Optional
    callback: function (val) {    //Mandatory
    timePickerCallback(val);
  }
};
  var timePickerCallback = function (val) {
     if (typeof (val) === 'undefined') {
       console.log('Time not selected');
    } else {
      $scope.timePickerObject.inputEpochTime.setHours(new Date(val*1000).getUTCHours());
      $scope.timePickerObject.inputEpochTime.setMinutes(new Date(val*1000).getUTCMinutes());
      $scope.selectedTime = new Date(val * 1000);
      console.log('Selected epoch is : ', val, 'and the time is ', $scope.selectedTime.getUTCHours(), ':', $scope.selectedTime.getUTCMinutes(), 'in UTC');
    }
}

$scope.resetFormData = function () {
        $scope.formData = {  
            'title': '',
            'description': '',
            'dateNotification': ''

        };
    };
$scope.resetFormData();
$scope.trackActivity= function (form) {
        $scope.formData.dateNotification = $scope.datepickerObject.inputDate ;
        $scope.formData.dateNotification.setHours($scope.timePickerObject.inputEpochTime.getHours());
      //  $scope.formData.dateNotification.setUTCHours($scope.timePickerObject.inputEpochTime.getHours());
        $scope.formData.dateNotification.setMinutes($scope.timePickerObject.inputEpochTime.getMinutes());
            if (!$scope.formData.title   || !$scope.formData.description|| !$scope.formData.dateNotification) {
             Loader.toggleLoadingWithMessage("Por favor ingrese los datos", 2000);
            return false;
            }
            console.log($scope.formData.dateNotification);   
           ActivityService.track($scope.formData).then(function () {     
                $scope.resetFormData(); 
                $state.go("app.activities");      

            });
        
}; 
})
.controller('editActivityCtrl', function($rootScope,$state, $ionicPopup, $ionicLoading, $scope, Loader,ActivityService,PetService,$ionicModal,InternalselectionActivity) {   
      $scope.activity = InternalselectionActivity.getSelectedactivity();

      $ionicModal.fromTemplateUrl('templates/selectPets.html', {
          scope: $scope,
          animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal=modal;
        $scope.pets = PetService;
        $scope.pets.refresh().then(function () {
        $ionicLoading.hide();  
        });
        
      });
      $scope.openModal = function() {
          $scope.modal.show();
      };
      $scope.closeModal = function() {
         $scope.modal.hide();
         if (typeof cancelCallback === 'function') {
                        cancelCallback();
          }
      };
        //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
         $scope.modal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
    // Execute action
      }); 

 $scope.datepickerObject = {
      titleLabel: 'Fecha de actividad', 
      todayLabel: 'Hoy',  
      closeLabel: 'Cerrar',  
      setLabel: 'OK',  
      setButtonType : 'button-royal',  
      todayButtonType : 'button-royal',  
      closeButtonType : 'button-stable',  
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

  $scope.timePickerObject = {
    inputEpochTime: new Date(),  //Optional
    step: 15,  //Optional
    format: 12,  //Optional
    titleLabel: 'Hora de actividad',  //Optional
    setLabel: 'Set',  //Optional
    closeLabel: 'Close',  //Optional
    setButtonType: 'button-royal',  //Optional
    closeButtonType: 'button-stable',  //Optional
    callback: function (val) {    //Mandatory
    timePickerCallback(val);
  }
};
  var timePickerCallback = function (val) {
     if (typeof (val) === 'undefined') {
       console.log('Time not selected');
    } else {
      $scope.timePickerObject.inputEpochTime.setHours(new Date(val*1000).getUTCHours());
      $scope.timePickerObject.inputEpochTime.setMinutes(new Date(val*1000).getUTCMinutes());
      $scope.selectedTime = new Date(val * 1000);
      console.log('Selected epoch is : ', val, 'and the time is ', $scope.selectedTime.getUTCHours(), ':', $scope.selectedTime.getUTCMinutes(), 'in UTC');
    }
}

$scope.resetFormData = function () {
        $scope.formData = {  
            'title': '',
            'description': '',
            'dateNotification': ''

        };
    };
$scope.resetFormData();
$scope.editActivity= function (form) {
  $scope.formData.id=$scope.activity.id;
        $scope.formData.dateNotification = $scope.datepickerObject.inputDate ;
        $scope.formData.dateNotification.setHours($scope.timePickerObject.inputEpochTime.getHours());
      //  $scope.formData.dateNotification.setUTCHours($scope.timePickerObject.inputEpochTime.getHours());
        $scope.formData.dateNotification.setMinutes($scope.timePickerObject.inputEpochTime.getMinutes());
            if (!$scope.formData.title   || !$scope.formData.description|| !$scope.formData.dateNotification) {
             Loader.toggleLoadingWithMessage("Por favor ingrese los datos", 2000);
            return false;
            }
            console.log($scope.formData.dateNotification);   
           ActivityService.update($scope.formData).then(function () {     
                $scope.resetFormData(); 
                $state.go("app.activities");      

            });
        
};

  
});
