define(['jquery', 'underscore'], function ( $, _ ) {

    //underscore mixins
    _.mixin({
        isNullOrEmpty : function ( val ) {
            var isEmpty;
            if(typeof(val) === 'string' || typeof(val) === 'number') {
                isEmpty = !(/\S/.test(val.toString()));
            } else if ($.isArray(val)) {
                isEmpty = !(_.filter(val, function ( value ) {
                    return !!value || value === false;
                }).length > 0);
            } else {
                isEmpty == !val;
            }
            return isEmpty;
        }
    });

    _.mixin({
        refine : function ( obj ) {
            if($.isArray(obj)) {
                return _.filter(obj, function ( value ) {
                    return !_.isNullOrEmpty(value);
                });
            } else {
                for(var i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        var value = obj[i];
                        if(_.isNullOrEmpty(value)) {
                            delete obj[i];
                        }
                    }
                }
                return obj;
            }
        }
    });
});