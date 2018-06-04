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
            //self.vue.user_images = push(reader.result);
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


    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        console.log('upload_complete was called');
        self.vue.show_img = true;
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
    
        $.post(add_image_url,
          {
            image_url: get_url,
          },
          function (data){
            self.vue.user_images.push(data.user_images);
            enumerate(self.vue.user_images);
          });
    };


    self.get_user_image = function () {
         console.log("Trying to get the user_images");
         $.getJSON(get_user_images_url(0, 20), function (data){
           self.vue.user_images = data.user_images;
           enumerate(self.vue.user_images);
       })
    };

    self.get_user_names = function (){
      console.log("Trying to get the user_names");
      $.getJSON(function (data){
          self.vue.user_name_list = data.user_name_list;
          enumerate(self.vue.user_name_list);
      })
    };

    $("#vue-div").show();


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_uploading: false,
            img_url: null,
            image_url:null,
            add_image_url: null,
            get_user_images_url: null,
            image:null,
            show_img: false,
            user_images: [],
            user_name_list: [],
            self_page: true // Leave it to true, so initially you are looking at your own images.
        },
        methods: {
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
            // upload_complete: self.upload_complete,
            get_user_image: self.get_user_image,
            get_user_names:self.get_user_names
        }

    });

    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
