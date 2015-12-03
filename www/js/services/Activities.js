var app = angular.module('upet.services.activities', []);

app.service("ActivityService", function ($q, AuthService,Loader) {
	var self = {
		'page': 0,
		'page_size': 20,
		'isLoading': false,
		'isSaving': false,
		'hasMore': true,
		'results': [],
		'refresh': function () {
			self.page = 0;
			self.isLoading = false;
			self.isSaving = false;
			self.hasMore = true;
			self.results = [];
			return self.load();
		},
		'next': function () {
			self.page += 1;
			return self.load();
		},
		'load': function () {
			self.isLoading = true;
			var d = $q.defer();

			// Initialise Query
			var Activity = Parse.Object.extend("Activity");
			var activityQuery = new Parse.Query(Activity);
			activityQuery.descending('created');
			activityQuery.equalTo("owner", AuthService.user);

			// Paginate
			activityQuery.skip(self.page * self.page_size);
			activityQuery.limit(self.page_size);

			
			activityQuery.find({
				success: function (results) {
					angular.forEach(results, function (item) {
						
					
					item.attributes.id=item.id;
					
						var activity = new Activity(item);

						self.results.push(activity)
					});
					console.debug(self.results);
					
					// Are we at the end of the list?
					if (results.length == 0) {
						self.hasMore = false;
					}

					// Finished
					d.resolve();
				}
			});

			return d.promise;
		},
		'track': function (data) {
			self.isSaving = true;
			var d = $q.defer();

			var Activity = Parse.Object.extend("Activity");
			var user = AuthService.user;

			var Activity = new Activity();
			Activity.set("owner", user);
			Activity.set("title", data.title);
			Activity.set("description", data.description);
			Activity.set("dateNotification", data.dateNotification);
			

			Activity.save(null, {
				success: function (Activity) {
					
					self.results.unshift(Activity);
					Loader.toggleLoadingWithMessage("Se ingreso la actividad!", 2000);
					d.resolve(Activity);
				},
				error: function (item, error) {
					
					d.reject(error);
				}
			});

			return d.promise;
		},
		'update': function (data) {
			self.isSaving = true;
			var d = $q.defer();
			var Activity = Parse.Object.extend("Activity");
			var user = AuthService.user;

			var Activity = new Activity();
			Activity.id = data.id;
			Activity.set("owner", user);
			Activity.set("title", data.title);
			Activity.set("description", data.description);
			Activity.set("dateNotification", data.dateNotification);
			

			Activity.save(null, {
				success: function (Activity) {
				
					for (i = 0; i < self.results.length; i++) { 
						if(self.results[i].id==Activity.id){
							self.results.splice(i,1);
							break;
						}
					}
					self.results.unshift(Activity);
					Loader.toggleLoadingWithMessage("Se ingreso la actividad!", 2000);
					d.resolve(Activity);
				},
				error: function (item, error) {
					
					d.reject(error);
				}
			});
			return d.promise;
		},
		'remove': function (data) {
			var activity = Parse.Object.extend("Activity");
			var query = new Parse.Query(activity);
		
			query.get(data.id, {
  			success: function(myObj) {
  				for (i = 0; i < self.results.length; i++) { 
						if(self.results[i].id==myObj.id){
							self.results.splice(i,1);
							break;
						}
					}
   				myObj.destroy({});
   				Loader.toggleLoadingWithMessage("Se removio la actividad!", 2000);
 			 },
 			error: function(object, error) {
    			
 			 }
			});
		}

	};

	return self;
});
app.service("InternalselectionActivity",function () {
    var selectedactivity = {};
    this.setSelectedactivity =function (activity) {
        selectedactivity = activity;
    };

    this.getSelectedactivity = function () {
        return selectedactivity;

    }
});