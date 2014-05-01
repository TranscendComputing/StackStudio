define(['URIjs/URI'], function (URI) {

    // Check for valid URL, and return callback with true or false
    URI.validate = function(url, callback) {
        var tag = document.createElement('script');
        tag.src = url;
        tag.async = true;
        tag.onload = function (e) {
            document.getElementsByTagName('head')[0].removeChild(tag);
            callback(true);
        }
        tag.onerror = function (e) {
            document.getElementsByTagName('head')[0].removeChild(tag);
            callback(false)
        }
        document.getElementsByTagName('head')[0].appendChild(tag);
    };

    return URI;
});
