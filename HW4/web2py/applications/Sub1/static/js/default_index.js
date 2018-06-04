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
        // We want to read the image file, and transform it into a data URL.
        var reader = new FileReader();

        // We add a listener for the load event of the file reader.
        // The listener is called when loading terminates.
        // Once loading (the reader.readAsDataURL) terminates, we have
        // the data URL available.
        reader.addEventListener("load", function () {
            // An image can be represented as a data URL.
            // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
            // Here, we set the data URL of the image contained in the file to an image in the
            // HTML, causing the display of the file image.
            self.vue.img_url = reader.result;
        }, false);

        if (file) {
            // Reads the file as a data URL.
            reader.readAsDataURL(file);
            // Gets an upload URL.
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

    function get_user_images_url(start_idx, end_idx) {
      var pp = {
          start_idx: start_idx,
          end_idx: end_idx
      };
      return image_url + "?" + $.param(pp);
  }

    self.get_user_images = function () {

        self.vue.show_img = true;

         console.log("Trying to get the user_images");
        $.getJSON(get_user_images_url(0,20), function (data){
            self.vue.user_images = data.user_images;
            console.log("printing push data.user images");
            console.log(self.vue.user_images);
            // enumerate(self.vue.user_images);
        })
    };
    function get_users_names(start_idx, end_idx) {
      var pp = {
          start_idx: start_idx,
          end_idx: end_idx
      };
      return user_names + "?" + $.param(pp);
    }
    self.get_users = function(){
      $.getJSON(get_users_names(0,50), function(data){
        self.vue.user_list = data.user_list;
        enumerate(self.vue.user_list);
      })
    }
    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.vue.show_img = true;
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        self.vue.img_url = get_url;
        console.log(self.vue.img_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        $.post(add_image_url,
                    {
                      image_url: self.vue.img_url,
                    },
                    function(data){
                      // self.vue.user_images.push(data.user_images);
                      setTimeout(function(){
                        self.vue.user_images.unshift(data.user_images);
                        // enumerate(self.vue.user_images);
                        console.log(data.user_images);
                      }, 1000)

                    })
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            user_images: [],
            user_list: [],
            is_uploading: false,
            img_url: null,
            show_img: false,
            self_page: true // Leave it to true, so initially you are looking at your own images.
        },
        methods: {
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,

        }

    });

    self.get_user_images();
    self.get_users();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
