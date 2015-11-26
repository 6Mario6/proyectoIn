var app = angular.module('upet.services.authentication', []);

app.service('AuthService', function ($q, $ionicPopup,Loader) {
	var self = {
		user: Parse.User.current(),
		login: function (email, password) {
			var d = $q.defer();

			Parse.User.logIn(email, password, {
				success: function (user) {
					console.log("Logged In");
					Loader.toggleLoadingWithMessage("Ingresando...");
					self.user = user;
					d.resolve(self.user);
				},
				error: function (user, error) {
					if (error.code === 125) {
                  	 	Loader.toggleLoadingWithMessage('Por favor, ingrese una dirección de correo electrónico válida');
                	} else if (error.code === 202) {
                    	Loader.toggleLoadingWithMessage('La dirección de correo electrónico ya está registrada');
                	} else {
                   		 Loader.toggleLoadingWithMessage( error.message);
                	}
					d.reject(error);
				}
			});

			return d.promise;
		},
		signup: function (email, name, password) {
			var d = $q.defer();
			Loader.toggleLoadingWithMessage("Registrando...");
			var user = new Parse.User();
			user.set('username', email);
			user.set('password',password);
			user.set('email',email);

			user.signUp(null,{
				success: function (user) {
					console.log("Account Created");
					self.user = user;
					d.resolve(self.user);
				},
				error: function (user, error) {
                if (error.code === 125) {
                   Loader.toggleLoadingWithMessage('Por favor, ingrese una dirección de correo electrónico válida');
                } else if (error.code === 202) {
                    Loader.toggleLoadingWithMessage('La dirección de correo electrónico ya está registrada');
                } else {
                    Loader.toggleLoadingWithMessage( error.message);
                }
					d.reject(error);
				}
			});
			return d.promise;
		},
		'update': function (data)  {
			var d = $q.defer();

			var user = self.user;
			user.set("username", data.email);
			user.set("name", data.name);
			user.set("email", data.email);

			user.save(null, {
				success: function (user) {
					self.user = user;
					d.resolve(self.user);
				},
				error: function (user, error) {
					$ionicPopup.alert({
						title: "Save Error",
						subTitle: error.message
					});
					d.reject(error);
				}
			});

			return d.promise;
		}

	};

	return self;
})
;

