// This is the js for the default/index.html view.


var app = function() {

    var self = {};
    var users = [];
    Vue.config.silent = false; // show all warnings
    var curr_user = "";
    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    $.getJSON(get_users_url, function (data) {
      for (var key in data.users) {
        var curr_user = {id: +key, name: data.users[key]}
        users.push(curr_user)
    }
      console.log(users)
      self.vue.users = users
      console.log(data.curr_user)
      for (var key in data.curr_user) {
         self.vue.curr_user = {id: +key, name: data.curr_user[key]}
    }
    if(self.vue.curr_user != null){
      $.post(get_images_url,{id:self.vue.curr_user.id},function (data) {
          self.vue.user_images = data
          console.log(data)
      })
   }
      //self.vue.curr_user = data.curr_user
    });
    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };

    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); // This clears the file choice once uploaded.

    };

    self.upload_file = function (event) {
        // Reads the file.
        var input = event.target;
        var file = input.files[0];
        if (file) {
            // First, gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };

    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        $.post(add_image_url,
            {
                image_url: get_url
            });
         window.location.reload();
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
    };
    self.get_images = function(event){
      id = event.path[0].id;
      $.post(get_images_url,{id:id},function (data) {
         self.vue.user_images = data
         console.log(data)
      })
   }
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_uploading: false,
            self_page: true, // Leave it to true, so initially you are looking at your own images.
            users: null,
            curr_user: null,
            user_images: null
        },
        methods: {
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
            get_images: self.get_images
        }

    });

    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
