angular.module('upet.factory', [])

.factory('Loader', ['$ionicLoading', '$timeout', function($ionicLoading, $timeout) {

    var LOADERAPI = {

        showLoading: function(text) {
            text = text || 'Loading...';
            $ionicLoading.show({
                template: text
            });
        },

        hideLoading: function() {
            $ionicLoading.hide();
        },

        toggleLoadingWithMessage: function(text, timeout) {
            var self = this;

            self.showLoading(text);

            $timeout(function() {
                self.hideLoading();
            }, timeout || 2000);
        }

    };
    return LOADERAPI;
}])

.factory('LSFactory', [function() {

    var LSAPI = {

        clear: function() {
            return localStorage.clear();
        },

        get: function(key) {
            return JSON.parse(localStorage.getItem(key));
        },

        set: function(key, data) {
            return localStorage.setItem(key, JSON.stringify(data));
        },

        delete: function(key) {
            return localStorage.removeItem(key);
        },

        getAll: function() {
            var pets = [];
            var items = Object.keys(localStorage);

            for (var i = 0; i < items.length; i++) {
                if (items[i] !== 'user' ) {
                    pets.push(JSON.parse(localStorage[items[i]]));
                }
            }

            return pets;
        }

    };

    return LSAPI;

}])


.factory('AuthFactory', ['LSFactory', function(LSFactory) {

    var userKey = 'user';


    var AuthAPI = {

        isLoggedIn: function() {
            return this.getUser() === null ? false : true;
        },

        getUser: function() {
            return LSFactory.get(userKey);
        },

        setUser: function(user) {
            return LSFactory.set(userKey, user);
        },


        deleteAuth: function() {
            LSFactory.delete(userKey);
           
        }

    };

    return AuthAPI;

}])


.factory('PetsFactory', ['$http', function($http) {

    var API = {
        get: function(page) {
            return $http.get(base + '/api/v1/pets/' + page + '/' + perPage);
        }
    };

    return API;
}])

.factory('UserFactory', ['$http', 'AuthFactory',
    function($http, AuthFactory) {

        var UserAPI = {

            
            logout: function() {
                AuthFactory.deleteAuth();
            },

            getCartItems: function() {
                var userId = AuthFactory.getUser()._id;
                return $http.get(base + '/api/v1/users/' + userId + '/cart');
            },

            addToCart: function(book) {
                var userId = AuthFactory.getUser()._id;
                return $http.post(base + '/api/v1/users/' + userId + '/cart', book);
            },

            getPurchases: function() {
                var userId = AuthFactory.getUser()._id;
                return $http.get(base + '/api/v1/users/' + userId + '/purchases');
            },

            addPurchase: function(cart) {
                var userId = AuthFactory.getUser()._id;
                return $http.post(base + '/api/v1/users/' + userId + '/purchases', cart);
            }

        };

        return UserAPI;
    }
])
