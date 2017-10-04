(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;
/**
 * In order to prevent form duplication on the same page, in cases where both a
 *   mobile and desktop version of the same form is required, we should only
 *   load the desktop form and move it in the DOM if the window is resize to
 *   mobile.
 */
(function (window, document, $, Drupal) {
    "use strict";
    $(function () {
        // Setup vars.
        var THRESHOLD,
            $altInlineForm,
            $stickyNavForm,
            $mobileForm,
            hasAltInlineForm,
            hasStickyNavForm,
            hasMobileForm,
            isPageHomepage,
            isPageModelS,
            isPageModelX,
            isPageModel3;

        // Page specific logic.
        isPageHomepage = $('#page-homepage').length > 0;
        isPageModelS = $('#page-models').length > 0;
        isPageModelX = $('#page-modelx').length > 0;
        isPageModel3 = $('#page-model3').length > 0;

        // On the homepage, remove the test drive form (used in AB test).
        // @todo Remove the whenever we end the Optimizely AB tests for the
        //   mobile form and remove test drive form from mobile.
        if (isPageHomepage) {
            $('.page-homepage').find('.test-drive-container').html("");
        }

        // Forms.
        $altInlineForm = $('#feature--newsletter-form');
        $stickyNavForm = $('.sticky-nav').find('#tesla-insider-form');
        $mobileForm = $('.insider-container').find('#tesla-insider-form');

        hasAltInlineForm = $altInlineForm.length > 0;
        hasStickyNavForm = $stickyNavForm.length > 0;
        hasMobileForm = $mobileForm.length > 0;

        // Moves the get updates form around the Model S, X and 3 page if
        //   there are multiple copies of the form within the DOM.
        if ((isPageHomepage || isPageModelS || isPageModelX || isPageModel3) && ((hasAltInlineForm || hasStickyNavForm) && hasMobileForm)) {
            // Remove the desktop form on mobile and vice versa.
            THRESHOLD = 640;
            if ($(window).width() > THRESHOLD) {
                if (hasMobileForm) {
                    $mobileForm.remove();
                }
            } else {
                if (hasAltInlineForm) {
                    $altInlineForm.remove();
                }
                if (hasStickyNavForm) {
                    $stickyNavForm.remove();
                }
            }
            // Re-attach js bindings.
            Drupal.behaviors.tesla_insider_form.attach();
        }
    });
}(this, this.document, this.jQuery, this.Drupal));

;
/*!
* Parsleyjs
* Guillaume Potier - <guillaume@wisembly.com>
* Version 2.2.0-rc1 - built Sun Aug 16 2015 14:04:07
* MIT Licensed
*
*/
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){function b(a,b){return a.parsleyAdaptedCallback||(a.parsleyAdaptedCallback=function(){var c=Array.prototype.slice.call(arguments,0);c.unshift(this),a.apply(b||x,c)}),a.parsleyAdaptedCallback}function c(a){return 0===a.lastIndexOf(z,0)?a.substr(z.length):a}"undefined"==typeof a&&"undefined"!=typeof window.jQuery&&(a=window.jQuery);var d=1,e={},f={attr:function(a,b,c){var d,e,f=new RegExp("^"+b,"i");if("undefined"==typeof c)c={};else for(var g in c)c.hasOwnProperty(g)&&delete c[g];if("undefined"==typeof a||"undefined"==typeof a[0])return c;e=a[0].attributes;for(var g=e.length;g--;)d=e[g],d&&d.specified&&f.test(d.name)&&(c[this.camelize(d.name.slice(b.length))]=this.deserializeValue(d.value));return c},checkAttr:function(a,b,c){return a.is("["+b+c+"]")},setAttr:function(a,b,c,d){a[0].setAttribute(this.dasherize(b+c),String(d))},generateID:function(){return""+d++},deserializeValue:function(b){var c;try{return b?"true"==b||("false"==b?!1:"null"==b?null:isNaN(c=Number(b))?/^[\[\{]/.test(b)?a.parseJSON(b):b:c):b}catch(d){return b}},camelize:function(a){return a.replace(/-+(.)?/g,function(a,b){return b?b.toUpperCase():""})},dasherize:function(a){return a.replace(/::/g,"/").replace(/([A-Z]+)([A-Z][a-z])/g,"$1_$2").replace(/([a-z\d])([A-Z])/g,"$1_$2").replace(/_/g,"-").toLowerCase()},warn:function(){window.console&&"function"==typeof window.console.warn&&window.console.warn.apply(window.console,arguments)},warnOnce:function(a){e[a]||(e[a]=!0,this.warn.apply(this,arguments))},_resetWarnings:function(){e={}},trimString:function(a){return a.replace(/^\s+|\s+$/g,"")},objectCreate:Object.create||function(){var a=function(){};return function(b){if(arguments.length>1)throw Error("Second argument not supported");if("object"!=typeof b)throw TypeError("Argument must be an object");a.prototype=b;var c=new a;return a.prototype=null,c}}()},g={namespace:"data-parsley-",inputs:"input, textarea, select",excluded:"input[type=button], input[type=submit], input[type=reset], input[type=hidden]",priorityEnabled:!0,multiple:null,group:null,uiEnabled:!0,validationThreshold:3,focus:"first",trigger:!1,errorClass:"parsley-error",successClass:"parsley-success",classHandler:function(){},errorsContainer:function(){},errorsWrapper:'<ul class="parsley-errors-list"></ul>',errorTemplate:"<li></li>"},h=function(){};h.prototype={asyncSupport:!0,actualizeOptions:function(){return f.attr(this.$element,this.options.namespace,this.domOptions),this.parent&&this.parent.actualizeOptions&&this.parent.actualizeOptions(),this},_resetOptions:function(a){this.domOptions=f.objectCreate(this.parent.options),this.options=f.objectCreate(this.domOptions);for(var b in a)a.hasOwnProperty(b)&&(this.options[b]=a[b]);this.actualizeOptions()},_listeners:null,on:function(a,b){this._listeners=this._listeners||{};var c=this._listeners[a]=this._listeners[a]||[];return c.push(b),this},subscribe:function(b,c){a.listenTo(this,b.toLowerCase(),c)},off:function(a,b){var c=this._listeners&&this._listeners[a];if(c)if(b)for(var d=c.length;d--;)c[d]===b&&c.splice(d,1);else delete this._listeners[a];return this},unsubscribe:function(b){a.unsubscribeTo(this,b.toLowerCase())},trigger:function(a,b){b=b||this;var c,d=this._listeners&&this._listeners[a];if(d)for(var e=d.length;e--;)if(c=d[e].call(b,b),c===!1)return c;return this.parent?this.parent.trigger(a,b):!0},reset:function(){if("ParsleyForm"!==this.__class__)return this._trigger("reset");for(var a=0;a<this.fields.length;a++)this.fields[a]._trigger("reset");this._trigger("reset")},destroy:function(){if("ParsleyForm"!==this.__class__)return this.$element.removeData("Parsley"),this.$element.removeData("ParsleyFieldMultiple"),void this._trigger("destroy");for(var a=0;a<this.fields.length;a++)this.fields[a].destroy();this.$element.removeData("Parsley"),this._trigger("destroy")},asyncIsValid:function(){return f.warnOnce("asyncIsValid is deprecated; please use whenIsValid instead"),this.whenValid.apply(this,arguments)},_findRelatedMultiple:function(){return this.parent.$element.find("["+this.options.namespace+'multiple="'+this.options.multiple+'"]')}};var i={string:function(a){return a},integer:function(a){if(isNaN(a))throw'Requirement is not an integer: "'+a+'"';return parseInt(a,10)},number:function(a){if(isNaN(a))throw'Requirement is not a number: "'+a+'"';return parseFloat(a)},reference:function(b){var c=a(b);if(0===c.length)throw'No such reference: "'+b+'"';return c},"boolean":function(a){return"false"!==a},object:function(a){return f.deserializeValue(a)},regexp:function(a){var b="";return/^\/.*\/(?:[gimy]*)$/.test(a)&&(b=a.replace(/.*\/([gimy]*)$/,"$1"),a=a.replace(new RegExp("^/(.*?)/"+b+"$"),"$1")),new RegExp(a,b)}},j=function(a,b){var c=a.match(/^\s*\[(.*)\]\s*$/);if(!c)throw'Requirement is not an array: "'+a+'"';var d=c[1].split(",").map(f.trimString);if(d.length!==b)throw"Requirement has "+d.length+" values when "+b+" are needed";return d},k=function(a,b){var c=i[a||"string"];if(!c)throw'Unknown requirement specification: "'+a+'"';return c(b)},l=function(a,b,c){var d=null,e={};for(var f in a)if(f){var g=c(f);"string"==typeof g&&(g=k(a[f],g)),e[f]=g}else d=k(a[f],b);return[d,e]},m=function(b){a.extend(!0,this,b)};m.prototype={validate:function(b,c){if(this.fn)return arguments.length>3&&(c=[].slice.call(arguments,1,-1)),this.fn.call(this,b,c);if(a.isArray(b)){if(!this.validateMultiple)throw"Validator `"+this.name+"` does not handle multiple values";return this.validateMultiple.apply(this,arguments)}if(this.validateNumber)return isNaN(b)?!1:(b=parseFloat(b),this.validateNumber.apply(this,arguments));if(this.validateString)return this.validateString.apply(this,arguments);throw"Validator `"+this.name+"` only handles multiple values"},parseRequirements:function(b,c){if("string"!=typeof b)return a.isArray(b)?b:[b];var d=this.requirementType;if(a.isArray(d)){for(var e=j(b,d.length),f=0;f<e.length;f++)e[f]=k(d[f],e[f]);return e}return a.isPlainObject(d)?l(d,b,c):[k(d,b)]},requirementType:"string",priority:2};var n=function(a,b){this.__class__="ParsleyValidatorRegistry",this.locale="en",this.init(a||{},b||{})},o={email:/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,number:/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/,integer:/^-?\d+$/,digits:/^\d+$/,alphanum:/^\w+$/i,url:new RegExp("^(?:(?:https?|ftp)://)?(?:\\S+(?::\\S*)?@)?(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))(?::\\d{2,5})?(?:/\\S*)?$","i")};o.range=o.number,n.prototype={init:function(b,c){this.catalog=c,this.validators=a.extend({},this.validators);for(var d in b)this.addValidator(d,b[d].fn,b[d].priority);window.Parsley.trigger("parsley:validator:init")},setLocale:function(a){if("undefined"==typeof this.catalog[a])throw new Error(a+" is not available in the catalog");return this.locale=a,this},addCatalog:function(a,b,c){return"object"==typeof b&&(this.catalog[a]=b),!0===c?this.setLocale(a):this},addMessage:function(a,b,c){return"undefined"==typeof this.catalog[a]&&(this.catalog[a]={}),this.catalog[a][b.toLowerCase()]=c,this},addValidator:function(a){if(this.validators[a])f.warn('Validator "'+a+'" is already defined.');else if(g.hasOwnProperty(a))return void f.warn('"'+a+'" is a restricted keyword and is not a valid validator name.');return this._setValidator.apply(this,arguments)},updateValidator:function(a){return this.validators[a]?this._setValidator(this,arguments):(f.warn('Validator "'+a+'" is not already defined.'),this.addValidator.apply(this,arguments))},removeValidator:function(a){return this.validators[a]||f.warn('Validator "'+a+'" is not defined.'),delete this.validators[a],this},_setValidator:function(a,b,c){"object"!=typeof b&&(b={fn:b,priority:c}),b.validate||(b=new m(b)),this.validators[a]=b;for(var d in b.messages||{})this.addMessage(d,a,b.messages[d]);return this},getErrorMessage:function(a){var b;if("type"===a.name){var c=this.catalog[this.locale][a.name]||{};b=c[a.requirements]}else b=this.formatMessage(this.catalog[this.locale][a.name],a.requirements);return b||this.catalog[this.locale].defaultMessage||this.catalog.en.defaultMessage},formatMessage:function(a,b){if("object"==typeof b){for(var c in b)a=this.formatMessage(a,b[c]);return a}return"string"==typeof a?a.replace(new RegExp("%s","i"),b):""},validators:{notblank:{validateString:function(a){return/\S/.test(a)},priority:2},required:{validateMultiple:function(a){return a.length>0},validateString:function(a){return/\S/.test(a)},priority:512},type:{validateString:function(a,b){var c=o[b];if(!c)throw new Error("validator type `"+b+"` is not supported");return c.test(a)},priority:256},pattern:{validateString:function(a,b){return b.test(a)},requirementType:"regexp",priority:64},minlength:{validateString:function(a,b){return a.length>=b},requirementType:"integer",priority:30},maxlength:{validateString:function(a,b){return a.length<=b},requirementType:"integer",priority:30},length:{validateString:function(a,b,c){return a.length>=b&&a.length<=c},requirementType:["integer","integer"],priority:30},mincheck:{validateMultiple:function(a,b){return a.length>=b},requirementType:"integer",priority:30},maxcheck:{validateMultiple:function(a,b){return a.length<=b},requirementType:"integer",priority:30},check:{validateMultiple:function(a,b,c){return a.length>=b&&a.length<=c},requirementType:["integer","integer"],priority:30},min:{validateNumber:function(a,b){return a>=b},requirementType:"number",priority:30},max:{validateNumber:function(a,b){return b>=a},requirementType:"number",priority:30},range:{validateNumber:function(a,b,c){return a>=b&&c>=a},requirementType:["number","number"],priority:30},equalto:{validateString:function(b,c){var d=a(c);return d.length?b===d.val():b===c},priority:256}}};var p=function(){this.__class__="ParsleyUI"};p.prototype={listen:function(){var a=this;return window.Parsley.on("form:init",function(){a.setupForm(this)}).on("field:init",function(){a.setupField(this)}).on("field:validated",function(){a.reflow(this)}).on("form:validated",function(){a.focus(this)}).on("field:reset",function(){a.reset(this)}).on("form:destroy",function(){a.destroy(this)}).on("field:destroy",function(){a.destroy(this)}),this},reflow:function(a){if("undefined"!=typeof a._ui&&!1!==a._ui.active){var b=this._diff(a.validationResult,a._ui.lastValidationResult);a._ui.lastValidationResult=a.validationResult,a._ui.validatedOnce=!0,this.manageStatusClass(a),this.manageErrorsMessages(a,b),this.actualizeTriggers(a),(b.kept.length||b.added.length)&&!0!==a._ui.failedOnce&&this.manageFailingFieldTrigger(a)}},getErrorsMessages:function(a){if(!0===a.validationResult)return[];for(var b=[],c=0;c<a.validationResult.length;c++)b.push(this._getErrorMessage(a,a.validationResult[c].assert));return b},manageStatusClass:function(a){a.hasConstraints()&&a.needsValidation()&&!0===a.validationResult?this._successClass(a):a.validationResult.length>0?this._errorClass(a):this._resetClass(a)},manageErrorsMessages:function(b,c){if("undefined"==typeof b.options.errorsMessagesDisabled){if("undefined"!=typeof b.options.errorMessage)return c.added.length||c.kept.length?(this._insertErrorWrapper(b),0===b._ui.$errorsWrapper.find(".parsley-custom-error-message").length&&b._ui.$errorsWrapper.append(a(b.options.errorTemplate).addClass("parsley-custom-error-message")),b._ui.$errorsWrapper.addClass("filled").find(".parsley-custom-error-message").html(b.options.errorMessage)):b._ui.$errorsWrapper.removeClass("filled").find(".parsley-custom-error-message").remove();for(var d=0;d<c.removed.length;d++)this.removeError(b,c.removed[d].assert.name,!0);for(d=0;d<c.added.length;d++)this.addError(b,c.added[d].assert.name,void 0,c.added[d].assert,!0);for(d=0;d<c.kept.length;d++)this.updateError(b,c.kept[d].assert.name,void 0,c.kept[d].assert,!0)}},addError:function(b,c,d,e,f){this._insertErrorWrapper(b),b._ui.$errorsWrapper.addClass("filled").append(a(b.options.errorTemplate).addClass("parsley-"+c).html(d||this._getErrorMessage(b,e))),!0!==f&&this._errorClass(b)},updateError:function(a,b,c,d,e){a._ui.$errorsWrapper.addClass("filled").find(".parsley-"+b).html(c||this._getErrorMessage(a,d)),!0!==e&&this._errorClass(a)},removeError:function(a,b,c){a._ui.$errorsWrapper.removeClass("filled").find(".parsley-"+b).remove(),!0!==c&&this.manageStatusClass(a)},focus:function(a){if(a._focusedField=null,!0===a.validationResult||"none"===a.options.focus)return null;for(var b=0;b<a.fields.length;b++){var c=a.fields[b];if(!0!==c.validationResult&&c.validationResult.length>0&&"undefined"==typeof c.options.noFocus&&(a._focusedField=c.$element,"first"===a.options.focus))break}return null===a._focusedField?null:a._focusedField.focus()},_getErrorMessage:function(a,b){var c=b.name+"Message";return"undefined"!=typeof a.options[c]?window.Parsley.formatMessage(a.options[c],b.requirements):window.Parsley.getErrorMessage(b)},_diff:function(a,b,c){for(var d=[],e=[],f=0;f<a.length;f++){for(var g=!1,h=0;h<b.length;h++)if(a[f].assert.name===b[h].assert.name){g=!0;break}g?e.push(a[f]):d.push(a[f])}return{kept:e,added:d,removed:c?[]:this._diff(b,a,!0).added}},setupForm:function(b){b.$element.on("submit.Parsley",!1,a.proxy(b.onSubmitValidate,b)),!1!==b.options.uiEnabled&&b.$element.attr("novalidate","")},setupField:function(b){var c={active:!1};!1!==b.options.uiEnabled&&(c.active=!0,b.$element.attr(b.options.namespace+"id",b.__id__),c.$errorClassHandler=this._manageClassHandler(b),c.errorsWrapperId="parsley-id-"+(b.options.multiple?"multiple-"+b.options.multiple:b.__id__),c.$errorsWrapper=a(b.options.errorsWrapper).attr("id",c.errorsWrapperId),c.lastValidationResult=[],c.validatedOnce=!1,c.validationInformationVisible=!1,b._ui=c,this.actualizeTriggers(b))},_manageClassHandler:function(b){if("string"==typeof b.options.classHandler&&a(b.options.classHandler).length)return a(b.options.classHandler);var c=b.options.classHandler(b);return"undefined"!=typeof c&&c.length?c:!b.options.multiple||b.$element.is("select")?b.$element:b.$element.parent()},_insertErrorWrapper:function(b){var c;if(0!==b._ui.$errorsWrapper.parent().length)return b._ui.$errorsWrapper.parent();if("string"==typeof b.options.errorsContainer){if(a(b.options.errorsContainer).length)return a(b.options.errorsContainer).append(b._ui.$errorsWrapper);f.warn("The errors container `"+b.options.errorsContainer+"` does not exist in DOM")}else"function"==typeof b.options.errorsContainer&&(c=b.options.errorsContainer(b));if("undefined"!=typeof c&&c.length)return c.append(b._ui.$errorsWrapper);var d=b.$element;return b.options.multiple&&(d=d.parent()),d.after(b._ui.$errorsWrapper)},actualizeTriggers:function(b){var c=b.$element;if(b.options.multiple&&(c=a("["+b.options.namespace+'multiple="'+b.options.multiple+'"]')),c.off(".Parsley"),!1!==b.options.trigger){var d=b.options.trigger.replace(/^\s+/g,"").replace(/\s+$/g,"");""!==d&&c.on(d.split(" ").join(".Parsley ")+".Parsley",a.proxy("function"==typeof b.eventValidate?b.eventValidate:this.eventValidate,b))}},eventValidate:function(a){new RegExp("key").test(a.type)&&!this._ui.validationInformationVisible&&this.getValue().length<=this.options.validationThreshold||(this._ui.validatedOnce=!0,this.validate())},manageFailingFieldTrigger:function(b){return b._ui.failedOnce=!0,b.options.multiple&&a("["+b.options.namespace+'multiple="'+b.options.multiple+'"]').each(function(){return new RegExp("change","i").test(a(this).parsley().options.trigger||"")?void 0:a(this).on("change.ParsleyFailedOnce",!1,a.proxy(b.validate,b))}),b.$element.is("select")&&!new RegExp("change","i").test(b.options.trigger||"")?b.$element.on("change.ParsleyFailedOnce",!1,a.proxy(b.validate,b)):new RegExp("keyup","i").test(b.options.trigger||"")?void 0:b.$element.on("keyup.ParsleyFailedOnce",!1,a.proxy(b.validate,b))},reset:function(a){this.actualizeTriggers(a),a.$element.off(".ParsleyFailedOnce"),"undefined"!=typeof a._ui&&"ParsleyForm"!==a.__class__&&(a._ui.$errorsWrapper.removeClass("filled").children().remove(),this._resetClass(a),a._ui.validatedOnce=!1,a._ui.lastValidationResult=[],a._ui.validationInformationVisible=!1,a._ui.failedOnce=!1)},destroy:function(a){this.reset(a),"ParsleyForm"!==a.__class__&&("undefined"!=typeof a._ui&&a._ui.$errorsWrapper.remove(),delete a._ui)},_successClass:function(a){a._ui.validationInformationVisible=!0,a._ui.$errorClassHandler.removeClass(a.options.errorClass).addClass(a.options.successClass)},_errorClass:function(a){a._ui.validationInformationVisible=!0,a._ui.$errorClassHandler.removeClass(a.options.successClass).addClass(a.options.errorClass)},_resetClass:function(a){a._ui.$errorClassHandler.removeClass(a.options.successClass).removeClass(a.options.errorClass)}};var q=function(b,c,d){this.__class__="ParsleyForm",this.__id__=f.generateID(),this.$element=a(b),this.domOptions=c,this.options=d,this.parent=window.Parsley,this.fields=[],this.validationResult=null},r={pending:null,resolved:!0,rejected:!1};q.prototype={onSubmitValidate:function(a){var b=this;if(!0!==a.parsley)return a.stopImmediatePropagation(),a.preventDefault(),this.whenValidate(void 0,void 0,a).done(function(){b._submit()}).always(function(){b._submitSource=null}),this},_submit:function(){!1!==this._trigger("submit")&&(this.$element.find(".parsley_synthetic_submit_button").remove(),this._submitSource&&a('<input class=".parsley_synthetic_submit_button" type="hidden">').attr("name",this._submitSource.name).attr("value",this._submitSource.value).appendTo(this.$element),this.$element.trigger(a.extend(a.Event("submit"),{parsley:!0})))},validate:function(a,b,c){return r[this.whenValidate(a,b,c).state()]},whenValidate:function(b,c,d){var e=this;this.submitEvent=d,this.validationResult=!0,this._trigger("validate"),this._refreshFields();var f=this._withoutReactualizingFormOptions(function(){return a.map(this.fields,function(a){return!b||e._isFieldInGroup(a,b)?a.whenValidate(c):void 0})});return a.when.apply(a,f).done(function(){e._trigger("success")}).fail(function(){e.validationResult=!1,e._trigger("error")}).always(function(){e._trigger("validated")})},isValid:function(a,b){return r[this.whenValid(a,b).state()]},whenValid:function(b,c){var d=this;this._refreshFields();var e=this._withoutReactualizingFormOptions(function(){return a.map(this.fields,function(a){return!b||d._isFieldInGroup(a,b)?a.whenValid(c):void 0})});return a.when.apply(a,e)},_isFieldInGroup:function(b,c){return a.isArray(b.options.group)?-1!==a.inArray(c,b.options.group):b.options.group===c},_refreshFields:function(){return this.actualizeOptions()._bindFields()},_bindFields:function(){var b=this,c=this.fields;return this.fields=[],this.fieldsMappedById={},this._withoutReactualizingFormOptions(function(){this.$element.find(this.options.inputs).not(this.options.excluded).each(function(){var a=new A.Factory(this,{},b);"ParsleyField"!==a.__class__&&"ParsleyFieldMultiple"!==a.__class__||!0===a.options.excluded||"undefined"==typeof b.fieldsMappedById[a.__class__+"-"+a.__id__]&&(b.fieldsMappedById[a.__class__+"-"+a.__id__]=a,b.fields.push(a))}),a(c).not(b.fields).each(function(){this._trigger("reset")})}),this},_withoutReactualizingFormOptions:function(a){var b=this.actualizeOptions;this.actualizeOptions=function(){return this};var c=a.call(this);return this.actualizeOptions=b,c},_trigger:function(a){return a="form:"+a,this.trigger.apply(this,arguments)}};var s=function(b,c,d,e,f){if(!new RegExp("ParsleyField").test(b.__class__))throw new Error("ParsleyField or ParsleyFieldMultiple instance expected");var g=window.Parsley._validatorRegistry.validators[c],h=new m(g);a.extend(this,{validator:h,name:c,requirements:d,priority:e||b.options[c+"Priority"]||h.priority,isDomConstraint:!0===f}),this._parseRequirements(b.options)},t=function(a){var b=a[0].toUpperCase();return b+a.slice(1)};s.prototype={validate:function(a,b){var c=this.requirementList.slice(0);return c.unshift(a),c.push(b),this.validator.validate.apply(this.validator,c)},_parseRequirements:function(a){var b=this;this.requirementList=this.validator.parseRequirements(this.requirements,function(c){return a[b.name+t(c)]})}};var u=function(b,c,d,e){this.__class__="ParsleyField",this.__id__=f.generateID(),this.$element=a(b),"undefined"!=typeof e&&(this.parent=e),this.options=d,this.domOptions=c,this.constraints=[],this.constraintsByName={},this.validationResult=[],this._bindConstraints()},r={pending:null,resolved:!0,rejected:!1};u.prototype={validate:function(a){var b=this.whenValidate(a);switch(b.state()){case"pending":return null;case"resolved":return!0;case"rejected":return this.validationResult}},whenValidate:function(a){var b=this;return this.value=this.getValue(),this._trigger("validate"),this.whenValid(a,this.value).done(function(){b._trigger("success")}).fail(function(){b._trigger("error")}).always(function(){b._trigger("validated")})},hasConstraints:function(){return 0!==this.constraints.length},needsValidation:function(a){return"undefined"==typeof a&&(a=this.getValue()),a.length||this._isRequired()||"undefined"!=typeof this.options.validateIfEmpty?!0:!1},isValid:function(a,b){return r[this.whenValid(a,b).state()]},whenValid:function(b,c){if(this.refreshConstraints(),this.validationResult=!0,!this.hasConstraints())return a.when();if(("undefined"==typeof c||null===c)&&(c=this.getValue()),!this.needsValidation(c)&&!0!==b)return a.when();var d=this._getGroupedConstraints(),e=[],f=this;return a.each(d,function(b,d){var g=a.when.apply(a,a.map(d,a.proxy(f,"_validateConstraint",c)));return e.push(g),"rejected"===g.state()?!1:void 0}),a.when.apply(a,e)},_validateConstraint:function(b,c){var d=this,e=c.validate(b,this);return!1===e&&(e=a.Deferred().reject()),a.when(e).fail(function(){!0===d.validationResult&&(d.validationResult=[]),d.validationResult.push({assert:c})})},getValue:function(){var a;return a="function"==typeof this.options.value?this.options.value(this):"undefined"!=typeof this.options.value?this.options.value:this.$element.val(),"undefined"==typeof a||null===a?"":this._handleWhitespace(a)},refreshConstraints:function(){return this.actualizeOptions()._bindConstraints()},addConstraint:function(a,b,c,d){if(window.Parsley._validatorRegistry.validators[a]){var e=new s(this,a,b,c,d);"undefined"!==this.constraintsByName[e.name]&&this.removeConstraint(e.name),this.constraints.push(e),this.constraintsByName[e.name]=e}return this},removeConstraint:function(a){for(var b=0;b<this.constraints.length;b++)if(a===this.constraints[b].name){this.constraints.splice(b,1);break}return delete this.constraintsByName[a],this},updateConstraint:function(a,b,c){return this.removeConstraint(a).addConstraint(a,b,c)},_bindConstraints:function(){for(var a=[],b={},c=0;c<this.constraints.length;c++)!1===this.constraints[c].isDomConstraint&&(a.push(this.constraints[c]),b[this.constraints[c].name]=this.constraints[c]);this.constraints=a,this.constraintsByName=b;for(var d in this.options)this.addConstraint(d,this.options[d],void 0,!0);return this._bindHtml5Constraints()},_bindHtml5Constraints:function(){(this.$element.hasClass("required")||this.$element.attr("required"))&&this.addConstraint("required",!0,void 0,!0),"string"==typeof this.$element.attr("pattern")&&this.addConstraint("pattern",this.$element.attr("pattern"),void 0,!0),"undefined"!=typeof this.$element.attr("min")&&"undefined"!=typeof this.$element.attr("max")?this.addConstraint("range",[this.$element.attr("min"),this.$element.attr("max")],void 0,!0):"undefined"!=typeof this.$element.attr("min")?this.addConstraint("min",this.$element.attr("min"),void 0,!0):"undefined"!=typeof this.$element.attr("max")&&this.addConstraint("max",this.$element.attr("max"),void 0,!0),"undefined"!=typeof this.$element.attr("minlength")&&"undefined"!=typeof this.$element.attr("maxlength")?this.addConstraint("length",[this.$element.attr("minlength"),this.$element.attr("maxlength")],void 0,!0):"undefined"!=typeof this.$element.attr("minlength")?this.addConstraint("minlength",this.$element.attr("minlength"),void 0,!0):"undefined"!=typeof this.$element.attr("maxlength")&&this.addConstraint("maxlength",this.$element.attr("maxlength"),void 0,!0);var a=this.$element.attr("type");return"undefined"==typeof a?this:"number"===a?"undefined"==typeof this.$element.attr("step")||0===parseFloat(this.$element.attr("step"))%1?this.addConstraint("type","integer",void 0,!0):this.addConstraint("type","number",void 0,!0):/^(email|url|range)$/i.test(a)?this.addConstraint("type",a,void 0,!0):this},_isRequired:function(){return"undefined"==typeof this.constraintsByName.required?!1:!1!==this.constraintsByName.required.requirements},_trigger:function(a){return a="field:"+a,this.trigger.apply(this,arguments)},_handleWhitespace:function(a){return!0===this.options.trimValue&&f.warnOnce('data-parsley-trim-value="true" is deprecated, please use data-parsley-whitespace="trim"'),"squish"===this.options.whitespace&&(a=a.replace(/\s{2,}/g," ")),("trim"===this.options.whitespace||"squish"===this.options.whitespace||!0===this.options.trimValue)&&(a=f.trimString(a)),a},_getGroupedConstraints:function(){if(!1===this.options.priorityEnabled)return[this.constraints];for(var a=[],b={},c=0;c<this.constraints.length;c++){var d=this.constraints[c].priority;b[d]||a.push(b[d]=[]),b[d].push(this.constraints[c])}return a.sort(function(a,b){return b[0].priority-a[0].priority}),a}};var v=function(){this.__class__="ParsleyFieldMultiple"};v.prototype={addElement:function(a){return this.$elements.push(a),this},refreshConstraints:function(){var b;if(this.constraints=[],this.$element.is("select"))return this.actualizeOptions()._bindConstraints(),this;for(var c=0;c<this.$elements.length;c++)if(a("html").has(this.$elements[c]).length){b=this.$elements[c].data("ParsleyFieldMultiple").refreshConstraints().constraints;for(var d=0;d<b.length;d++)this.addConstraint(b[d].name,b[d].requirements,b[d].priority,b[d].isDomConstraint)}else this.$elements.splice(c,1);return this},getValue:function(){if("undefined"!=typeof this.options.value)return this.options.value;if(this.$element.is("input[type=radio]"))return this._findRelatedMultiple().filter(":checked").val()||"";if(this.$element.is("input[type=checkbox]")){var b=[];return this._findRelatedMultiple().filter(":checked").each(function(){b.push(a(this).val())}),b}return this.$element.is("select")&&null===this.$element.val()?[]:this.$element.val()},_init:function(){return this.$elements=[this.$element],this}};var w=function(b,c,d){this.$element=a(b);var e=this.$element.data("Parsley");if(e)return"undefined"!=typeof d&&e.parent===window.Parsley&&(e.parent=d,e._resetOptions(e.options)),e;if(!this.$element.length)throw new Error("You must bind Parsley on an existing element.");if("undefined"!=typeof d&&"ParsleyForm"!==d.__class__)throw new Error("Parent instance must be a ParsleyForm instance");return this.parent=d||window.Parsley,this.init(c)};w.prototype={init:function(a){return this.__class__="Parsley",this.__version__="2.2.0-rc1",this.__id__=f.generateID(),this._resetOptions(a),this.$element.is("form")||f.checkAttr(this.$element,this.options.namespace,"validate")&&!this.$element.is(this.options.inputs)?this.bind("parsleyForm"):this.isMultiple()?this.handleMultiple():this.bind("parsleyField")},isMultiple:function(){return this.$element.is("input[type=radio], input[type=checkbox]")||this.$element.is("select")&&"undefined"!=typeof this.$element.attr("multiple")},handleMultiple:function(){var b,c,d=this;if(this.options.multiple||("undefined"!=typeof this.$element.attr("name")&&this.$element.attr("name").length?this.options.multiple=b=this.$element.attr("name"):"undefined"!=typeof this.$element.attr("id")&&this.$element.attr("id").length&&(this.options.multiple=this.$element.attr("id"))),this.$element.is("select")&&"undefined"!=typeof this.$element.attr("multiple"))return this.options.multiple=this.options.multiple||this.__id__,this.bind("parsleyFieldMultiple");if(!this.options.multiple)return f.warn("To be bound by Parsley, a radio, a checkbox and a multiple select input must have either a name or a multiple option.",this.$element),this;this.options.multiple=this.options.multiple.replace(/(:|\.|\[|\]|\{|\}|\$)/g,""),"undefined"!=typeof b&&a('input[name="'+b+'"]').each(function(){a(this).is("input[type=radio], input[type=checkbox]")&&a(this).attr(d.options.namespace+"multiple",d.options.multiple)});for(var e=this._findRelatedMultiple(),g=0;g<e.length;g++)if(c=a(e.get(g)).data("Parsley"),"undefined"!=typeof c){this.$element.data("ParsleyFieldMultiple")||c.addElement(this.$element);break}return this.bind("parsleyField",!0),c||this.bind("parsleyFieldMultiple")},bind:function(b,c){var d;switch(b){case"parsleyForm":d=a.extend(new q(this.$element,this.domOptions,this.options),window.ParsleyExtend)._bindFields();break;case"parsleyField":d=a.extend(new u(this.$element,this.domOptions,this.options,this.parent),window.ParsleyExtend);break;case"parsleyFieldMultiple":d=a.extend(new u(this.$element,this.domOptions,this.options,this.parent),new v,window.ParsleyExtend)._init();break;default:throw new Error(b+"is not a supported Parsley type")}return this.options.multiple&&f.setAttr(this.$element,this.options.namespace,"multiple",this.options.multiple),"undefined"!=typeof c?(this.$element.data("ParsleyFieldMultiple",d),d):(this.$element.data("Parsley",d),d._trigger("init"),d)}};var x=a({}),y=function(){f.warnOnce("Parsley's pubsub module is deprecated; use the 'on' and 'off' methods on parsley instances or window.Parsley")},z="parsley:";a.listen=function(a,d){var e;if(y(),"object"==typeof arguments[1]&&"function"==typeof arguments[2]&&(e=arguments[1],d=arguments[2]),"function"!=typeof arguments[1])throw new Error("Wrong parameters");window.Parsley.on(c(a),b(d,e))},a.listenTo=function(a,d,e){if(y(),!(a instanceof u||a instanceof q))throw new Error("Must give Parsley instance");if("string"!=typeof d||"function"!=typeof e)throw new Error("Wrong parameters");a.on(c(d),b(e))},a.unsubscribe=function(a,b){if(y(),"string"!=typeof a||"function"!=typeof b)throw new Error("Wrong arguments");window.Parsley.off(c(a),b.parsleyAdaptedCallback)},a.unsubscribeTo=function(a,b){if(y(),!(a instanceof u||a instanceof q))throw new Error("Must give Parsley instance");a.off(c(b))},a.unsubscribeAll=function(b){y(),window.Parsley.off(c(b)),a("form,input,textarea,select").each(function(){var d=a(this).data("Parsley");d&&d.off(c(b))})},a.emit=function(a,b){y();var d=b instanceof u||b instanceof q,e=Array.prototype.slice.call(arguments,d?2:1);e.unshift(c(a)),d||(b=window.Parsley),b.trigger.apply(b,e)},window.ParsleyConfig=window.ParsleyConfig||{},window.ParsleyConfig.i18n=window.ParsleyConfig.i18n||{},window.ParsleyConfig.i18n.en=jQuery.extend(window.ParsleyConfig.i18n.en||{},{defaultMessage:"This value seems to be invalid.",type:{email:"This value should be a valid email.",url:"This value should be a valid url.",number:"This value should be a valid number.",
integer:"This value should be a valid integer.",digits:"This value should be digits.",alphanum:"This value should be alphanumeric."},notblank:"This value should not be blank.",required:"This value is required.",pattern:"This value seems to be invalid.",min:"This value should be greater than or equal to %s.",max:"This value should be lower than or equal to %s.",range:"This value should be between %s and %s.",minlength:"This value is too short. It should have %s characters or more.",maxlength:"This value is too long. It should have %s characters or fewer.",length:"This value length is invalid. It should be between %s and %s characters long.",mincheck:"You must select at least %s choices.",maxcheck:"You must select %s choices or fewer.",check:"You must select between %s and %s choices.",equalto:"This value should be the same."}),"undefined"!=typeof window.ParsleyValidator&&window.ParsleyValidator.addCatalog("en",window.ParsleyConfig.i18n.en,!0);var A=a.extend(new h,{$element:a(document),actualizeOptions:null,_resetOptions:null,Factory:w,version:"2.2.0-rc1"});a.extend(u.prototype,h.prototype),a.extend(q.prototype,h.prototype),a.extend(w.prototype,h.prototype),a.fn.parsley=a.fn.psly=function(b){if(this.length>1){var c=[];return this.each(function(){c.push(a(this).parsley(b))}),c}return a(this).length?new w(this,b):void f.warn("You must bind Parsley on an existing element.")},"undefined"==typeof window.ParsleyExtend&&(window.ParsleyExtend={}),A.options=a.extend(f.objectCreate(g),window.ParsleyConfig),window.ParsleyConfig=A.options,window.Parsley=window.psly=A,window.ParsleyUtils=f;var B=window.Parsley._validatorRegistry=new n(window.ParsleyConfig.validators,window.ParsleyConfig.i18n);return window.ParsleyValidator={},a.each("setLocale addCatalog addMessage getErrorMessage formatMessage addValidator updateValidator removeValidator".split(" "),function(b,c){window.Parsley[c]=a.proxy(B,c),window.ParsleyValidator[c]=function(){return f.warnOnce("Accessing the method `"+c+"` through ParsleyValidator is deprecated. Simply call `window.Parsley."+c+"(...)`"),window.Parsley[c].apply(window.Parsley,arguments)}}),window.ParsleyUI="function"==typeof window.ParsleyConfig.ParsleyUI?(new window.ParsleyConfig.ParsleyUI).listen():(new p).listen(),!1!==window.ParsleyConfig.autoBind&&a(function(){a("[data-parsley-validate]").length&&a("[data-parsley-validate]").parsley()}),window.Parsley});;
(function () {

window.Parsley.addValidator(
    'notequalto',
    function (value, nbReference) {
        $reference = $('#'+nbReference).val();
        $net = value == $reference;
        return !$net;
    }, 32)
    .addMessage('en', 'notequalto', 'invalid duplicate entry');

})();;
/*global window */
/**
 * Parsley minint validator allows for a field to have a minimum number of
 *   digits in a given string, however is only applicable if the field is
 *   populated. A minint of 3 would accept:
 *   - 123
 *   - A123
 *   - 1A2B3
 *   - (empty)
 */
(function () {
    'use strict';
    window.Parsley.addValidator(
        'minint',
        function (value, minimum) {
            var hasValue,
                intValue,
                hasIntValue,
                hasMinimum;
            // Strip non numeric.
            intValue = value.replace(/\D/g, '');
            minimum = parseInt(minimum);
            // Ensure either is empty, or is not empty and has enough digits.
            hasValue = (value !== undefined && value !== null && value !== '');
            hasIntValue = (intValue !== undefined && intValue !== null && intValue !== '');
            hasMinimum = !hasValue || (hasIntValue && intValue.length >= minimum);
            return hasMinimum;
        },
        32
    ).addMessage('en', 'minint', 'minimum characters not met');
}());
;
// Hack to make localizeDate() work.
if (typeof curCarInfo === 'undefined') {
    curCarInfo = {};
}

(function (window, document, $, Drupal) {
    "use strict";

    $(function() {
        var $form = $('#tesla-insider-form');
        // Initialize BrowserDetect object if it hasn't already been done.
        if (typeof BrowserDetect !== "undefined" && typeof BrowserDetect.summary === "undefined") {
            BrowserDetect.init();

            // WEB-24227:
            if (BrowserDetect.summary.browser == 'Explorer' && BrowserDetect.summary.version == 8) {
                $('input[name="post-submit"]').removeClass('hide-on-desk').addClass('hide-on-mobile');
                $('input[name="ajax-submit"]').removeClass('hide-on-mobile').addClass('hide-on-desk');
            }
        }
    });

    Drupal.behaviors.tesla_insider_form_prepopulate = {
        attach: function() {
            $(document).ready(function() {
                // Check if user is logged in. If so, populate email field.
                if (Drupal.behaviors.common.isLoggedIn()) {
                    Drupal.behaviors.tesla_insider_form_prepopulate.populate();
                }
            });
        },
        populate: function () {
            // Retrieve the email field for the Tesla insider form.
            var $insiderForm = $('#tesla-insider-form');

            // If the email field is on the page, update it with the locally
            //   cached email address.
            var $insiderFormEmailV1      = $insiderForm.find('#edit-usermail');
            var $insiderFormEmailV2      = $insiderForm.find('#edit-usermail--2');

            if ($insiderFormEmailV1.length) {
                $insiderFormEmailV1.val(Drupal.behaviors.common.getEmailAddress());
            }

            if ($insiderFormEmailV2.length) {
                $insiderFormEmailV2.val(Drupal.behaviors.common.getEmailAddress());
            }
        }
    };

    Drupal.behaviors.tesla_insider_form = {
        attach: function () {

            var $form = $('#tesla-insider-form');
            $('#edit-submit-ti-ajax').on('click', function(e) {
                var reg = new RegExp("(^|&)bd=([^&]*)(&|$)", "i");
                var param = window.location.search.substr(1).match(reg);
                var $adword;
                if (param != null) $adword = unescape(param[2]);
                var cookie = $.cookie('bd');

                if ($adword != null) {
                    $.cookie('bd', $adword, {expires : 30});
                    $('input[name=ad_word_ti]').val($adword);
                } else {
                    if (cookie != null && cookie != '') {
                        $('input[name=ad_word_ti]').val(cookie);
                    }
                }
            });

            var $zip_code = $('#edit-zipcode-ti');
            var $ajax_country = true;
            if ($form.length) {
                $form.parsley().destroy();
                $form.parsley();

                // Fire view-open on first input click (for embedded forms).
                $form.find('.form-item input, .form-item textarea').click(function () {
                    TeslaAnalytics.NewsletterSignup.interactionViewOpen();
                });

                $('#tesla-insider-modal').on('show.bs.modal', function (event) {
                    TeslaAnalytics.NewsletterSignup.interactionViewOpen();
                });

                $('#tesla-insider-modal').on('hide.bs.modal', function (event) {

                    // var mymodal = $(this);
                    if ($('#tesla-insider-modal .thanks').length) {

                        // e.preventDefault();
                        var country = (_.indexOf(['en_US', 'zh_CN'], Drupal.settings.tesla.locale) === -1) ? "/" + Drupal.settings.tesla.locale : '';
                        $('.modal-body', '#tesla-insider-modal').load(country + "/drive/ajax", function () {
                            Drupal.attachBehaviors();
                        });
                        $('#tesla-insider-modal .modal-title').html(Drupal.t('Tesla Insider'));

                    }
                });

                $('.btn-ajax', '#tesla-insider-form').click(function (event) {
                    event.preventDefault(); // Prevent default form submit.
                    var valid = $form.parsley().validate();
                    if (valid && $ajax_country) {
                        $('#tesla-insider-modal .modal-throbber').removeClass('hidden');
                        $(this).trigger('submit_form');
                    }
                });

                // Add browser values to form.
                if (typeof(BrowserDetect) !== "undefined" && typeof(BrowserDetect.summary) === "undefined") {
                    BrowserDetect.init();
                }
                $('#tesla-insider-form').append('<input type="hidden" name="browser_type" value="' + BrowserDetect.summary.browser + '">').
                    append('<input type="hidden" name="browser_version" value="' + BrowserDetect.summary.version + '">').
                    append('<input type="hidden" name="browser_os" value="' + BrowserDetect.summary.OS + '">');

                $('#tesla-insider-form input[type="text"]').keypress(function(e) {
                    if (e.keyCode == 13) {
                        e.stopPropagation();
                        var btn1 = $('#edit-submit-ti-ajax');
                        var btn2 = $('#edit-submit-ti-ajax--2');
                        if (btn1) {
                            btn1.click();
                        }
                        else if (btn2) {
                            btn2.click();
                        }
                        return false;
                    }
                });
                $('#edit-location').change();
            }
        }
    };

}(this, this.document, this.jQuery, this.Drupal));
;
// hack to make localizeDate() work
if (typeof curCarInfo === 'undefined') {
    curCarInfo = {};
}

(function (window, document, $, Drupal) {
    "use strict";

    $(function() {
        // Initialize BrowserDetect object if it hasn't already been done
        if (typeof BrowserDetect !== "undefined" && typeof BrowserDetect.summary === "undefined") {
            BrowserDetect.init();

            // WEB-24227
            if (BrowserDetect.summary.browser == 'Explorer' && BrowserDetect.summary.version == 8) {
                $('input[name="post-submit"]').removeClass('hide-on-desk').addClass('hide-on-mobile');
                $('input[name="ajax-submit"]').removeClass('hide-on-mobile').addClass('hide-on-desk');
            }

        }
    });

    Drupal.behaviors.test_drive_form = {
        attach: function () {
            var $emailField;
            var $form = $('#test-drive-form');
            Drupal.behaviors.set_footer_position_as_necessary.stickyFooter();

            $('#edit-submit-td-ajax').on('click', function(e) {
                var reg = new RegExp("(^|&)bd=([^&]*)(&|$)", "i");
                var param = window.location.search.substr(1).match(reg);
                var $adword;
                if (param != null) $adword = unescape(param[2]);
                var cookie = $.cookie('bd');

                if ($adword != null) {
                    $.cookie('bd', $adword, {expires : 30});
                    $('input[name=ad_word_td]').val($adword);
                } else {
                    if (cookie != null && cookie != '') {
                        $('input[name=ad_word_td]').val(cookie);
                    }
                }
            });
            var $zip_code = $('#edit-zipcode-td');
            var $ajax_country = true;
            if ($form.length) {
                $form.parsley().destroy();
                $form.parsley();

                $('#test-drive-modal').on('show.bs.modal', function (event) {
                    TeslaAnalytics.TestDriveForm.interactionViewOpen();
                });

                $('#test-drive-modal').on('hide.bs.modal', function (event) {

                    if ($('#test-drive-modal .thanks').length) {

                        var country = (_.indexOf(['en_US', 'zh_CN'], Drupal.settings.tesla.locale) === -1) ? "/" + Drupal.settings.tesla.locale : '';
                        $('.modal-body', '#test-drive-modal').load(country + "/drive/ajax", function () {
                            Drupal.attachBehaviors();
                        });
                        $('#test-drive-modal .modal-title').html(Drupal.t('Test Drive'));
                    }

                });

                $('.btn-ajax', '#test-drive-form').click(function (event) {
                    event.preventDefault(); //prevent default form submit
                    var valid = $form.parsley().validate();
                    if (valid && $ajax_country) {
                        $('#test-drive-modal .modal-throbber').removeClass('hidden');
                        $(this).trigger('submit_form');
                    }
                });

                //check whenever the dropdown menu change and ask the backend for the new regex and message to display
                $('#edit-countries-td').change(function (event) {
                    //disable the submit button meanwhile the ajax is begin processed
                    $ajax_country = false;
                    //get the actual url with Drupal settings
                    var url = (Drupal.settings.tesla.locale != 'en_US') ? "/" + Drupal.settings.tesla.locale : '';
                    var country = $('#edit-countries-td').val();
                    $.ajax({
                        url: url + '/regex/' + country,
                        dataType: "json"
                    }).success(function (data, textStatus, jqXHR) {
                        //Little hack to change the regex and message that parsley will do
                        $zip_code.attr('data-parsley-pattern', ((data.regex) ? (data.regex) : ('/^[a-zA-Z0-9\-\s]{1,}$/')));
                        $zip_code.attr('data-parsley-pattern-message', ((data.message) ? (data.message) : (Drupal.t('contains one or more illegal characters'))));
                        $zip_code.attr('maxlength', ((data.postal_code_max_length) ? (data.postal_code_max_length) : (6)));
                        $(':input[name="phonenumber_td"]').val(data.phone_code);
                        //Reactivate the parsley validation
                        $zip_code.focusout();
                    }).done(function (data, textStatus, jqXHR) {
                        //enable the submit button
                        $ajax_country = true;
                    })
                });

                //prepre china dropdowns
                $('.china-regions:not(.ajax-processed)').addClass('ajax-processed').once(function () {
                    // Get default values for selects
                    var $province = $(this).find('#edit-provinces-td');
                    var $city = $(this).find('#edit-cities-td');

                    $(this).china_dropdowns({
                        default_province: '',
                        default_city: '',
                        default_district: null,
                        json: Drupal.settings.basePath + 'sites/all/libraries/tesla_lib/js/province_city_district_map.json',
                        init_value_city: '市（区）',
                        show_district: false
                    }, $province, $city);
                });

                // enable or disable submit button
                $('#edit-preferred-time').change(function() {
                    var btn_disabled = $(this).val() ? false : true;
                });

                //set skip val and submit form on click
                $('#specialists-btn').click(function() {
                    var form = $(this).closest('form');
                    form.append('<input type="hidden" name="skip_to_confirmation" value="1" />');
                    var btn = form.find('#edit-submit-td-ajax--2');
                    var btn2 = form.find('#edit-submit-td-ajax');
                    var btn3 = form.find('#edit-submit-td-ajax--3');
                    var btn4 = form.find('#edit-submit-td-ajax--4');
                    var btn5 = form.find('#edit-submit-td-ajax--5');
                    if (btn.length > 0) {
                        btn.click();
                    }
                    else if (btn2.length > 0) {
                        btn2.click();
                    }
                    else if (btn3.length > 0) {
                        btn3.click();
                    }
                    else if (btn4.length > 0) {
                        btn4.click();
                    }
                    else if (btn5.length > 0) {
                        btn5.click();
                    }

                });

                // Add browser values to form
                if (typeof(BrowserDetect) !== "undefined" && typeof(BrowserDetect.summary) === "undefined") {
                    BrowserDetect.init();
                }
                $('#test-drive-form').append('<input type="hidden" name="browser_type" value="' + BrowserDetect.summary.browser + '">').
                    append('<input type="hidden" name="browser_version" value="' + BrowserDetect.summary.version + '">').
                    append('<input type="hidden" name="browser_os" value="' + BrowserDetect.summary.OS + '">');
                $('#test-drive-form input[type="text"]').keypress(function(e) {
                    if (e.keyCode == 13) {
                        e.stopPropagation();
                        var btn1 = $('#edit-submit-td-ajax');
                        var btn2 = $('#edit-submit-td-ajax--2');
                        if (btn1) {
                            btn1.click();
                        }
                        else if (btn2) {
                            btn2.click();
                        }
                        return false;
                    }
                });

                $('#edit-schedule-type-ambassador').click(function() {
                    var checked = $(this).is(':checked');
                    $('#edit-schedule-type-in-store').prop('checked', !checked);
                    $('#edit-location').prop('disabled', checked);
                    $('#edit-preferred-date').prop('disabled', checked);
                    $('#edit-preferred-time').prop('disabled', checked);
                });
                $('#edit-schedule-type-in-store').click(function() {
                    var checked = $(this).is(':checked');
                    $('#edit-schedule-type-ambassador').prop('checked', !checked);
                    $('#edit-location').prop('disabled', !checked);
                    $('#edit-preferred-date').prop('disabled', !checked);
                    $('#edit-preferred-time').prop('disabled', !checked);
                });

                $('#test-drive-form .model_container').click(function() {
                    if ($(this).hasClass('model_s_container')) {
                        $('#test-drive-form #edit-model-s').prop('checked', true);
                        $('#test-drive-form #edit-model-x').prop('checked', false);
                        $(this).addClass('active');
                        $('#test-drive-form .model_x_container').removeClass('active');
                    }
                    else if ($(this).hasClass('model_x_container')) {
                        $('#test-drive-form #edit-model-s').prop('checked', false);
                        $('#test-drive-form #edit-model-x').prop('checked', true);
                        $(this).addClass('active');
                        $('#test-drive-form .model_s_container').removeClass('active');
                    }
                });

                // Move the populated email field in the dom to avoid float
                //   issues.
                if ($form.find('.form-item-usermail-td').length && $form.find('#edit-usermail-td').hasClass('populated-from-step-email')) {
                    $emailField = $form.find('.form-item-usermail-td').addClass('hidden').detach();
                    $emailField.appendTo($form);
                }

                $('#edit-current-vehicle').on('change', function () {
                    var $this = $(this);
                    var $model_select = $('#edit-model');
                    var greatest_drive_vehicles = Drupal.settings.greatest_drive_vehicles;
                    $model_select.find('option').not(':first').remove();

                    if (greatest_drive_vehicles[$this.val()]) {
                        for (var idx = 0; idx < greatest_drive_vehicles[$this.val()].length; idx++) {
                            var value = greatest_drive_vehicles[$this.val()][idx];
                            $model_select.append($("<option></option>").attr("value",value).text(value))
                        }
                    }
                });

                $('.skip-questions').click(function (event) {
                    event.preventDefault();
                    // Clear the form values on skip
                    $('#edit-motivation-td').val('');
                    $('#edit-current-vehicle').val('');
                    $('#edit-model').val('');
                    $('#edit-vehicle-year').val('');
                    $('#edit-timeline-td').val('');
                    $('.btn-ajax', $form).click();
                });
            }
        }
    };

    Drupal.behaviors.test_drive_form_zipcode_notice = {
        // by default notice should not be displayed
        display_notice: false,

        is_other_eu_country: function(country) {
            return (country != '' && $.inArray(country, Drupal.settings.tesla.other_eu_countries) !== -1);
        },

        attach: function() {
            // Only for Other Europe
            if (Drupal.settings.tesla.locale !== "en_EU" || typeof Drupal.settings.tesla.other_eu_countries == 'undefined') {
                return;
            }

            var self = this,
                $zipcode = $('#edit-zipcode-td'),
                $countries = $('#edit-countries-td'),
                $notice = $('#zipcode_notice'),
                current_country = $countries.val();

            if (this.is_other_eu_country(current_country)) {
                this.display_notice = true;
            }

            $countries.change(function() {
                self.display_notice = false;
                current_country = $countries.val();
                if (self.is_other_eu_country(current_country)) {
                    self.display_notice = true;
                }
            });

            $zipcode.on("blur", function() {
                if (!$notice.hasClass("hidden")) {
                    $notice.addClass("hidden");
                }
            });
            $zipcode.on("focus", function() {
                if (self.display_notice && $notice.hasClass("hidden")) {
                    $notice.removeClass("hidden");
                }
            });
        }
    };

    Drupal.ajax.prototype.commands.bindLocationsDropdowns = function(ajax, response, status) {
        /**
        * Selectors
        */
        var date_select_disabled = true,
            $locations = $.parseJSON($('#appointment_dates').html()),
            $date = $('.form-item-preferred-date'),
            $time = $(".form-item-preferred-time"),
            $directions = $('#mapbox-container'),
            $location_input = $('#edit-location'),
            $date_input = $('#edit-preferred-date'),
            $time_input = $('#edit-preferred-time');

        /**
        * Text content
        */
        var driving_directions_txt = Drupal.t('Hours and directions'),
            asset_lite_notice_txt = Drupal.t('Test drives are available at this location on request, we will call you within 24-48 hours to schedule a drive.');

        var updateAppointmentDate = function() {
          var $location_id = $location_input.val(),
          $location_name = $('#edit-location option[value="' + $location_id + '"]').text();

          $date_input.html('');
          $time_input.html('');
          $directions.html('');

          for (var i in $locations) {
              var loc = $locations[i];

              // Loc.id can be of type string and int.
              // Hence the double == comparison instead of ===.
              if (loc.id == $location_id) {
                  var map_link = Drupal.settings.tesla.localePrefix + '/' + loc.service_id;

                  var map_img_markup = ['<div id="map-img">',
                                        '    <a href="' + map_link + '">',
                                        '        <img src="' +  loc.map_url + '">',
                                        '    </a>',
                                        '</div>'].join('\n');

                  var map_text_block = [loc.map_address + '<br>',
                                        '<a class="driving-directions" href="' + map_link + '" target="_blank" rel="noopener noreferrer">',
                                        driving_directions_txt,
                                        '</a>'].join('\n');

                  var map_section_markup = [typeof loc.map_url === 'undefined'? '' : map_img_markup,
                                            '<p id="map-text">',
                                            typeof loc.map_url === 'undefined'? '' : '<a class="alt-link-dark" href="' + map_link + '">',
                                            '<strong>' + Drupal.t($location_name) + '</strong>',
                                            typeof loc.map_url === 'undefined'? '' : '</a>',
                                            '<br>',
                                            loc.dates.length === 0 ? asset_lite_notice_txt : map_text_block,
                                            '</p>'].join('\n');

                  if (loc.dates.length === 0) {
                      $date.hide();
                      $time.hide();
                  }
                  else {
                      $date.show();
                      $time.show();
                      for (var j in loc.dates) {
                          $date_input.append('<option value="' + j + '">' + loc.dates[j].formatted + '</option>');
                          date_select_disabled = false;
                      }
                  }

                  $directions.html(map_section_markup);
              }
          }
          $date_input.change();
        }

        var updateAppointmentLocation = function () {
            var time_select_disabled = true,
            $selected_date = $(this).val(),
            $location_id = $location_input.val();

            $time_input.html('');

            for (var i in $locations) {
                var location = $locations[i];

                // Loc.id can be of type string and int.
                // Hence the double == comparison instead of ===.
                if (location.id == $location_id) {
                    for (var j in location.dates) {
                        if (j === $selected_date) {
                            var times = location.dates[j];
                            for (var k in times) {
                                if(k !== 'formatted') {
                                    var time = times[k];
                                    $time_input.append(
                                        '<option value="' + time + '">' + time + '</option>'
                                      );
                                    time_select_disabled = false;
                                }
                            }
                        }
                    }
                }
            }
        }


        //update appointment dates when location is changed
        $location_input.change(updateAppointmentDate);

        //update appointment times when date is changed
        $date_input.change(updateAppointmentLocation);
    };

    /**
     * Pre-populates test-drive form modal on front page.
     */
    Drupal.behaviors.test_drive_form_prepopulate_helper = {
        attach: function(context) {
            $(document).ready(function() {
                // Initialize test form modal pre-population.
                Drupal.behaviors.test_drive_form_prepopulate_helper.initTestDriveFormPrePopulation();
            });
        },
        hasTestDriveFormModal: function () {
            return $('#test-drive-modal').length;
        },
        prePopulateForm: function () {
            var $testDriveModalObject = $('#test-drive-modal');

            if ($testDriveModalObject.find('#edit-firstname-td').length) {
                $testDriveModalObject.find('#edit-firstname-td').val(Drupal.behaviors.common.getFirstName());
            }
            if ($testDriveModalObject.find('#edit-lastname-td').length) {
                $testDriveModalObject.find('#edit-lastname-td').val(Drupal.behaviors.common.getLastName());
            }
            if ($testDriveModalObject.find('#edit-usermail-td').length) {
                $testDriveModalObject.find('#edit-usermail-td').val(Drupal.behaviors.common.getEmailAddress());
            }
            if ($testDriveModalObject.find('#edit-phonenumber-td').length) {
                $testDriveModalObject.find('#edit-phonenumber-td').val(Drupal.behaviors.common.getPhoneNumber());
            }
        },
        alterFormDom: function () {
            var $testDriveModalObject = $('#test-drive-modal'),
                nameHtml;
            // @todo See tesla_test_drive_form.main.inc for full dom changes.
            if ($testDriveModalObject.find('.form-item-firstname-td').length && $testDriveModalObject.find('.form-item-lastname-td').length) {
                $testDriveModalObject.find('.form-item-firstname-td').addClass('hidden');
                $testDriveModalObject.find('.form-item-lastname-td').addClass('hidden');

                // @todo Localize content
                nameHtml = ['<div class="user-logged-in">',
                            '   <label class="form-label label-logout">',
                            '       Name',
                            '   </label>',
                            '   <p>',
                            '       ' + Drupal.behaviors.common.getFullName(),
                            '       <span class="link-logout">',
                            '           (<a href="/user/logout" title="not you?">not ' + Drupal.behaviors.common.getFirstName() + '?</a>)',
                            '       </span>',
                            '   </p>',
                            '</div>'
                           ].join('\n');
                $testDriveModalObject.find('.form-item-firstname-td').before(nameHtml);
            }
            if ($testDriveModalObject.find('.form-item-usermail-td').length) {
                $testDriveModalObject.find('.form-item-usermail-td').addClass('hidden');
            }
            if ($testDriveModalObject.find('.form-item-contact-notes-td').length) {
                $testDriveModalObject.find('.form-item-contact-notes-td').addClass('hidden');
            }
        },
        initTestDriveFormPrePopulation: function () {
            if (Drupal.behaviors.common.isLoggedIn() && Drupal.behaviors.common.isFrontPage() && Drupal.behaviors.test_drive_form_prepopulate_helper.hasTestDriveFormModal()) {
                Drupal.behaviors.test_drive_form_prepopulate_helper.prePopulateForm();
                Drupal.behaviors.test_drive_form_prepopulate_helper.alterFormDom();
            }
        }
    };

}(this, this.document, this.jQuery, this.Drupal));
;
// hack to make localizeDate() work
if (typeof curCarInfo == 'undefined') {
    curCarInfo = {};
}

$(function() {
    // Initialize BrowserDetect object if it hasn't already been done
    if (typeof(BrowserDetect) !== "undefined" && typeof(BrowserDetect.summary) === "undefined") {
        BrowserDetect.init();
    }
    // WEB-24227
    if (BrowserDetect.summary.browser == 'Explorer' && BrowserDetect.summary.version == 8) {
        $('input[name="post-submit"]').removeClass('hide-on-desk').addClass('hide-on-mobile');
        $('input[name="ajax-submit"]').removeClass('hide-on-mobile').addClass('hide-on-desk');
    }
});

(function (window, document, $, Drupal) {
    "use strict";
    Drupal.behaviors.get_updates_form = {
        attach: function () {

            var $form = $('#get-updates-form');

            $('#edit-submit-gu-ajax').on('click', function(e) {
                var reg = new RegExp("(^|&)bd=([^&]*)(&|$)", "i");
                var param = window.location.search.substr(1).match(reg);
                var $adword;
                if (param != null) $adword = unescape(param[2]);
                var cookie = $.cookie('bd');

                if ($adword != null) {
                    $.cookie('bd', $adword, {expires : 30});
                    $('input[name=ad_word_gu]').val($adword);
                } else {
                    if (cookie != null && cookie != '') {
                        $('input[name=ad_word_gu]').val(cookie);
                    }
                }
            });
            var $zip_code = $('#edit-zipcode-gu');
            var $ajax_country = true;
            if ($form.length) {
                $form.parsley().destroy();
                $form.parsley();

                $('#get-updates-modal').on('show.bs.modal', function (event) {
                    TeslaAnalytics.NewsletterSignup.interactionViewOpen();
                });

                $('.btn-ajax', '#get-updates-form').click(function (event) {
                    event.preventDefault(); //prevent default form submit
                    var valid = $form.parsley().validate();
                    if (valid && $ajax_country) {
                        $('#get-updates-modal .modal-throbber').removeClass('hidden');
                        $(this).trigger('submit_form');
                    }
                });

                //check whenever the dropdown menu change and ask the backend for the new regex and message to display
                $('#edit-countries-gu').change(function (event) {
                    //disable the submit button meanwhile the ajax is begin processed
                    $ajax_country = false;
                    //get the actual url with Drupal settings
                    var url = (Drupal.settings.tesla.locale != 'en_US') ? "/" + Drupal.settings.tesla.locale : '';
                    var country = $('#edit-countries-gu').val();
                    $.ajax({
                        url: url + '/regex/' + country,
                        dataType: "json"
                    }).success(function (data, textStatus, jqXHR) {
                        //Little hack to change the regex and message that parsley will do
                        $zip_code.attr('data-parsley-pattern', ((data.regex) ? (data.regex) : ('/^[a-zA-Z0-9\-\s]{1,}$/')));
                        $zip_code.attr('data-parsley-pattern-message', ((data.message) ? (data.message) : (Drupal.t('contains one or more illegal characters'))));
                        $(':input[name="phonenumber_gu"]').val(data.phone_code);
                        //Reactivate the parsley validation
                        $zip_code.focusout();
                    }).done(function (data, textStatus, jqXHR) {
                        //enable the submit button
                        $ajax_country = true;
                    })
                });

                //prepre china dropdowns
                $('.china-regions:not(.ajax-processed)').addClass('ajax-processed').once(function () {
                    // Get default values for selects
                    var $province = $(this).find('#edit-provinces-gu');
                    var $city = $(this).find('#edit-cities-gu');

                    $(this).china_dropdowns({
                        default_province: '',
                        default_city: '',
                        default_district: null,
                        json: Drupal.settings.basePath + 'sites/all/libraries/tesla_lib/js/province_city_district_map.json',
                        init_value_city: '市（区）',
                        show_district: false
                    }, $province, $city);
                });

                // enable or disable submit button
                $('#edit-preferred-time').change(function() {
                    var btn_disabled = $(this).val() ? false : true;
                });

                //set skip val and submit form on click
                $('#specialists-btn').click(function() {
                    var form = $(this).closest('form');
                    form.append('<input type="hidden" name="skip_to_confirmation" value="1" />');
                    var btn = form.find('#edit-submit-gu-ajax--2');
                    var btn2 = form.find('#edit-submit-gu-ajax');
                    var btn3 = form.find('#edit-submit-gu-ajax--3');
                    var btn4 = form.find('#edit-submit-gu-ajax--4');
                    if(btn.length > 0) {
                        btn.click();
                    }
                    else if(btn2.length > 0) {
                        btn2.click();
                    }
                    else if(btn3.length > 0) {
                        btn3.click();
                    }
                    else if(btn4.length > 0) {
                        btn4.click();
                    }
                });

                // Add browser values to form
                if (typeof(BrowserDetect) !== "undefined" && typeof(BrowserDetect.summary) === "undefined") {
                    BrowserDetect.init();
                }
                $('#get-updates-form').append('<input type="hidden" name="browser_type" value="' + BrowserDetect.summary.browser + '">').
                    append('<input type="hidden" name="browser_version" value="' + BrowserDetect.summary.version + '">').
                    append('<input type="hidden" name="browser_os" value="' + BrowserDetect.summary.OS + '">');
                $('#get-updates-form input[type="text"]').keypress(function(e) {
                    if (e.keyCode == 13) {
                        e.stopPropagation();
                        var btn1 = $('#edit-submit-gu-ajax');
                        var btn2 = $('#edit-submit-gu-ajax--2');
                        if (btn1) {
                            btn1.click();
                        }
                        else if (btn2) {
                            btn2.click();
                        }
                        return false;
                    }
                });
            }
        }
    };

    /**
     * Prepopulates the Get Updates form if the user is logged in.
     *
     * Contains the following methods:
     * @method attach - initializes the prepopulation
     * @method prepopulate - prepopulates the fields from cookies
     * @method updateDOM - hides name and email fields and shows combined full name field
     *
     */
    Drupal.behaviors.get_updates_form_prepopulate = {
        attach: function(context) {
            $(document).ready(function() {
                if (Drupal.behaviors.common.isLoggedIn()) {
                    Drupal.behaviors.get_updates_form_prepopulate.prepopulate();
                    Drupal.behaviors.get_updates_form_prepopulate.updateDOM();
                }
            });
        },
        prepopulate: function() {
            var $getUpdatesForm = $('#get-updates-form');

            // First name
            var $firstNameField = $getUpdatesForm.find('#edit-firstname-gu');
            if ($firstNameField.length) {
                $firstNameField.val(Drupal.behaviors.common.getFirstName());
            }

            // Last name
            var $lastNameField = $getUpdatesForm.find('#edit-lastname-gu');
            if ($lastNameField.length) {
                $lastNameField.val(Drupal.behaviors.common.getLastName());
            }

            // Email
            var $emailField = $getUpdatesForm.find('#edit-usermail-gu');
            if ($emailField.length) {
                $emailField.val(Drupal.behaviors.common.getEmailAddress());
            }

            // Phone number
            var $phoneField = $getUpdatesForm.find('#edit-phonenumber-gu');
            if ($phoneField.length) {
                $phoneField.val(Drupal.behaviors.common.getPhoneNumber());
            }

            // Country
            var $countryField = $getUpdatesForm.find('#edit-countries-gu');
            if ($countryField.length) {
                $countryField.val(Drupal.settings.tesla.country);
            }
        },
        updateDOM: function() {
            // If user is logged in, show full name and hide:
            // - first name
            // - last name
            // - email

            var $getUpdatesForm     = $('#get-updates-form');
            var $firstNameColumn    = $getUpdatesForm.find('.form-item-firstname-gu');
            var $lastNameColumn     = $getUpdatesForm.find('.form-item-lastname-gu');
            var $emailColumn        = $getUpdatesForm.find('.form-item-usermail-gu');

            // Hide first and last name fields and show full name
            if ($firstNameColumn.length && $lastNameColumn.length) {
                $firstNameColumn.addClass('hidden');
                $lastNameColumn.addClass('hidden');

                var translations = {
                    '@firstName': Drupal.behaviors.common.getFirstName()
                };

                var html = ['<div class="user-logged-in">',
                            '   <label class="form-label label-logout">',
                            '       Name',
                            '   </label>',
                            '   <p>',
                            '       ' + Drupal.behaviors.common.getFullName(),
                            '       <span class="link-logout">',
                            '           (<a href="' + Drupal.absoluteUrl('user/logout') + '" title="' + Drupal.t("not you?") + '"">' + Drupal.t('not @firstName?', translations) + '</a>)',
                            '       </span>',
                            '   </p>',
                            '</div>'
                           ].join('\n');

                $firstNameColumn.before(html);
            }

            // Hide email field
            if ($emailColumn.length) {
                $emailColumn.addClass('hidden');
            }
        }
    };

}(this, this.document, this.jQuery, this.Drupal));
;
