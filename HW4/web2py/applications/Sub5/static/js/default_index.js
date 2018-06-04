// This is the js for the default/index.html view.

var app = function() {
  var self = {};

  Vue.config.silent = false; // show all warnings

  // Extends an array
  self.extend = function(a, b) {
    for (var i = 0; i < b.length; i++) {
      a.push(b[i]);
    }
  };

  // Enumerates an array.
  var enumerate = function(v) {
    var k = 0;
    return v.map(function(e) {
      e._idx = k++;
    });
  };

  self.open_uploader = function() {
    $("div#uploader_div").show();
    self.vue.is_uploading = true;
  };

  self.close_uploader = function() {
    $("div#uploader_div").hide();
    self.vue.is_uploading = false;
    $("input#file_input").val(""); // This clears the file choice once uploaded.
  };

  self.upload_file = function(event) {
    // Reads the file.
    var input = event.target;
    var file = input.files[0];
    if (file) {
      // First, gets an upload URL.
      console.log("Trying to get the upload url");
      $.getJSON(
        "https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url",
        function(data) {
          // We now have upload (and download) URLs.
          var put_url = data["signed_url"];
          var get_url = data["access_url"];
          console.log("Received upload url: " + put_url);
          // Uploads the file, using the low-level interface.
          var req = new XMLHttpRequest();
          req.addEventListener("load", self.upload_complete(get_url));
          // TODO: if you like, add a listener for "error" to detect failure.
          req.open("PUT", put_url, true);
          req.send(file);
        }
      );
    }
  };

  self.upload_complete = function(get_url) {
    // Hides the uploader div.
    self.close_uploader();
    console.log("The file was uploaded; it is now available at " + get_url);
    setTimeout(function() {
      $.post(
        add_photo_url,
        {
          image_url: get_url
        },
        function(data) {
          console.log(data);
        }
      );
      self.vue.images.unshift({ image_url: get_url });
    }, 3145);
  };

  self.get_users = function(callback) {
    $.getJSON(get_users_url, function(data) {
      console.log(data);
      self.vue.users = data.users;
      self.vue.logged_in_user = data.logged_in_user;
      callback(data.logged_in_user);
    });
  };

  self.get_images = function(user_id) {
    self.vue.images = [];
    $.post(get_photos_url, { user_id: user_id }, function(data) {
      console.log(data);
      self.vue.images = data.images;
    });
  };

  self.change_user = function(user_id) {
    if (user_id !== self.vue.logged_in_user.id) {
      self.vue.self_page = false;
    } else {
      self.vue.self_page = true;
    }
    self.get_images(user_id);
  };

  self.vue = new Vue({
    el: "#vue-div",
    delimiters: ["${", "}"],
    unsafeDelimiters: ["!{", "}"],
    data: {
      is_uploading: false,
      self_page: true, // Leave it to true, so initially you are looking at your own images.
      images: [],
      logged_in_user: null,
      users: []
    },
    methods: {
      open_uploader: self.open_uploader,
      close_uploader: self.close_uploader,
      upload_file: self.upload_file,
      change_user: self.change_user
    }
  });

  $("#vue-div").show();
  self.get_users(function(logged_in_user) {
    if (logged_in_user) {
      self.get_images(logged_in_user.id);
    }
  });

  return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function() {
  APP = app();
});
