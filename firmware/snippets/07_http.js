load("api_http.js");

let sendInfo = function() {
  HTTP.query({
    url: "http://httpbin.org/post",
    data: getInfo(),
    success: function(body, full_http_msg) {
      print(body);
    },
    error: function(err) {
      print(err);
    } // Optional
  });
};

// on Button handler
sendInfo();
