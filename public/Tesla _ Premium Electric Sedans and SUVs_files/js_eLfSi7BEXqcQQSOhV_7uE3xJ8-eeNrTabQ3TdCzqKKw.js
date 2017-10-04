/*global window */
/*global debug */
/*global jQuery */
/*global Drupal */

var TeslaLeadForm = window.TeslaLeadForm || {};


(function ($, Drupal, Storage) {
    'use strict';

    /**
     * Centralized location for Tesla lead form helpers.
     */
    TeslaLeadForm.Helpers = (function () {

        return {
            /**
             * Get Geo IP data.
             *
             * @return object Geo IP data.
             */
            getGeoIpData: function () {
                return JSON.parse(Drupal.behaviors.common.readCookie('ip_info'));
            },

            /**
             * Get Geo IP data: zipcode.
             *
             * @return string Geo IP data: zipcode.
             */
            getGeoIpDataZipcode: function () {
                var GeoIpData = this.getGeoIpData();
                if (GeoIpData === null || GeoIpData.postal === null) {
                    return '';
                } else {
                    return GeoIpData.postal;
                }
            },

            /**
             * Get context from page id.
             */
            getContextFromPageId: function () {
                var context = $('body').attr('id');
                // Order page has RN attached to it's id, so let's remove it for
                //   purposes of context.
                if (context.indexOf('page-order-confirm') !== -1) {
                    context = 'page-order-confirm';
                }
                return context;
            },

            /**
             * Storage wrapper: localStorage.getItem().
             * @param string dataKey Data key.
             * @return multi Item from local storage.
             */
            getLocalStorageItem: function (dataKey) {
                var data = Storage.get(dataKey);
                debug.log('LocalStorage get [' + dataKey + ']: ' + data);
                return data;
            },

            /**
             * Storage wrapper: localStorage.setItem().
             * @param string dataKey Data key.
             * @param multi data Data to be set to local storage.
             */
            setLocalStorageItem: function (dataKey, data) {
                Storage.set(dataKey, data);
                debug.log('LocalStorage set [' + dataKey + ']: ' + data);
            },

            /**
             * Storage wrapper: localStorage.removeItem().
             * @param string dataKey Data key.
             */
            removeLocalStorageItem: function (dataKey) {
                Storage.remove(dataKey);
                debug.log('LocalStorage deleted [' + dataKey + ']');
            }
        };
    }());

}(jQuery, Drupal, Storage));
;
/*global window */
/*global debug */
/*global $ */
/*global BrowserDetect */
/*global TeslaLeadForm */
/*global TeslaAnalytics */

(function (window, document, $, Drupal) {
    "use strict";

    var _desktopFormId = 'tesla-save-design-form',
        _hasDesktopForm,
        _desktopContainerId = 'tesla-save-design-modal',

        _mobileFormId = 'tesla-save-design-form-mobile',
        _hasMobileForm,
        _mobileContainerId = 'tesla-save-design-overlay',

        _activeFormId,
        _$activeForm,
        _activeContainerId,
        _$activeContainer,

        _context,

        _throttle = 300,
        _invokeOnce = true,

        _longUrl = '',
        _shortUrl = '';


    /**
     * Form handler for save_design forms.
     */
    Drupal.behaviors.tesla_save_design_form = {

        /**
         * Init form handler.
         */
        attach: function () {
            var $form;

            // Remove duplicate form and set active id.
            this.setActiveForm();
            $form = _$activeForm;

            // Exit if form not available.
            if ($form === undefined) {
                return false;
            }

            if ($form.length) {
                $form.parsley().destroy();
                $form.parsley();

                // Pre-populate fields: email and zipcode.
                this.prePopulateFields();

                // Attach form bindings.
                this.attachBindings();
            }

            // If already submitted, show save design link.
            if (this.alreadySubmittedForm()) {
                this.showConfirmation();
            }
        },

        /**
         * Sets the active form.
         */
        setActiveForm: function () {
            var $desktopForm,
                $mobileForm;

            this.removeDuplicateForm();

            $desktopForm = $('#' + _desktopFormId);
            $mobileForm = $('#' + _mobileFormId);
            _hasDesktopForm = $desktopForm.length > 0;
            _hasMobileForm = $mobileForm.length > 0;

            if (_hasDesktopForm) {
                _activeFormId = _desktopFormId;
                _activeContainerId = _desktopContainerId;
            } else if (_hasMobileForm) {
                _activeFormId = _mobileFormId;
                _activeContainerId = _mobileContainerId;
            } else {
                return false;
            }

            // Set form.
            _$activeForm = $('#' + _activeFormId);
            _$activeContainer = $('#' + _activeContainerId);

            // Set context.
            this.setContext($('body').attr('id'));
        },

        /**
         * Get active form.
         *
         * @return object Active form.
         */
        getActiveForm: function () {
            return _$activeForm;
        },

        /**
         * Get context.
         *
         * @return string Input context to check.
         */
        getContext: function () {
            return _context;
        },

        /**
         * Set context.
         *
         * @param string context Input context to check.
         */
        setContext: function (context) {
            _context = context;
        },

        /**
         * Set context from page id.
         */
        setContextFromPageId: function () {
            this.setContext(TeslaLeadForm.Helpers.getContextFromPageId());
        },


        /**
         * Compare context against string.
         *
         * @param string Input context to check.
         * @return boolean Is context of the context inputted.
         */
        isContext: function (context) {
            return (this.getContext() === context);
        },

        /**
         * Is context: Order page.
         *
         * @return boolean Is context: Order page.
         */
        isContextOrder: function () {
            return this.isContext('page-order');
        },

        /**
         * Is context: Confirmation page.
         *
         * @return boolean Is context: Confirmation page.
         */
        isContextConfirmation: function () {
            return this.isContext('page-order-confirm');
        },

        /**
         * Remove 2nd form to get js bindings to work.
         */
        removeDuplicateForm: function () {
            var THRESHOLD = 640,
                $desktopForm,
                $desktopSaveBtn,
                hasDesktopForm,
                $mobileForm,
                $mobileSaveBtn,
                hasMobileForm;

            $desktopForm = $('#' + _desktopFormId);
            $desktopSaveBtn = $('.options-save--desk');
            $mobileForm = $('#' + _mobileFormId);
            $mobileSaveBtn = $('.options-save--mobile');

            hasDesktopForm = $desktopForm.length > 0;
            hasMobileForm = $mobileForm.length > 0;

            if ($(window).width() > THRESHOLD) {
                if (hasMobileForm) {
                    $mobileForm.remove();
                    $mobileSaveBtn.addClass('hidden');
                }
            } else {
                if (hasDesktopForm) {
                    $desktopForm.remove();
                    $desktopSaveBtn.addClass('hidden');
                }
            }
        },

        /**
         * Get source.
         *
         * @return string Source (used for GA).
         */
        getSource: function () {
            return this.isContextOrder()
                ? 'sd-order'
                : 'sd-configurator';
        },

        /**
         * Pre-populate fields.
         */
        prePopulateFields: function () {
            var $form = _$activeForm,
                email,
                hasEmail = false,
                source = this.getSource();

            // Set context.
            $form.find('input[name="tesla_save_design__source"]').val(source);

            // Pre-populate email from `lc_save_design` cookie if available.
            if (typeof Drupal.behaviors.tesla_save_design_data.getEmailAddress === 'function') {
                if (this.alreadySubmittedForm()) {
                    email = Drupal.behaviors.tesla_save_design_data.getEmailAddress();
                    hasEmail = (email !== undefined && email !== null && email !== '');
                }
            }

            // Pre-populate email if logged in (and email not already populated
            //   from `lc_save_design` cookie).
            if (hasEmail === false && typeof Drupal.behaviors.common.isLoggedIn === 'function' && typeof Drupal.behaviors.common.getEmailAddress === 'function') {
                if (Drupal.behaviors.common.isLoggedIn()) {
                    email = Drupal.behaviors.common.getEmailAddress();
                    hasEmail = (email !== undefined && email !== null && email !== '');

                }
            }

            // Set email if populated.
            if (hasEmail === true) {
                $form.find('input[name="tesla_save_design__email"]').val(email);
            }
            // Inject zipcode if available.
            $form.find('input[name="tesla_save_design__zipcode"]').val(TeslaLeadForm.Helpers.getGeoIpDataZipcode());
        },

        /**
         * Show phone number field.
         */
        showPhoneNumberField: function () {
            var $form = _$activeForm,
                $emailField = $form.find('input[name="tesla_save_design__email"]'),
                emailPlaceholder = $emailField.data('placeholder-alt'),
                hasEmailPlaceholder = (emailPlaceholder !== undefined && emailPlaceholder !== null && emailPlaceholder !== ''),
                $phoneField = $form.find('input[name="tesla_save_design__phone"]');

            // Add class to form to modify form style display.
            $form.addClass('has-phone-number');

            // Show hidden form field.
            $phoneField.removeClass('hidden');

            // Update email placeholder to alternate version.
            if (hasEmailPlaceholder) {
                $emailField.attr('placeholder', emailPlaceholder);
            }

            // Re-init Parsley.
            $form.parsley().destroy();
            $form.parsley();
        },

        /**
         * Attach form bindings.
         */
        attachBindings: function () {
            var $form = _$activeForm,
                $container = _$activeContainer,
                $modal = $('#tesla-save-design-modal'),
                $mobileToggle = $('.options-save--mobile'),
                $mobileOverlay = $('#tesla-save-design-overlay'),
                $mobileBackdrop = $('#tesla-save-design-backdrop'),
                $mobileClose = $mobileOverlay.find('.btn-close'),
                $confirmView = $container.find('.save-design--confirmation'),
                $inputLink = $confirmView.find('.input-save'),
                $copyLink = $confirmView.find('.btn-save'),
                $body = $('body'),
                currentScroll = 0;

            // Bind submit button events.
            $form.find('input[name="ajax-submit"]').click(function (event) {
                event.preventDefault(); // Prevent default form submit.
                var valid = $form.parsley().validate();
                if (valid) {
                    $container.find('.modal-throbber').removeClass('hidden');
                    $(this).trigger('submit_form');
                }
            });

            // Bind enter key to submit action when focused on form text
            //   field.
            $form.find('input[type="text"]').keypress(function (e) {
                var submitButton;
                if (e.keyCode === 13) {
                    e.stopPropagation();
                    submitButton = $form.find('input[name="ajax-submit"]');
                    if (submitButton) {
                        submitButton.click();
                    }
                    return false;
                }
            }).removeAttr('size'); // Remove size attribute to allow for custom sizing.

            // Mobile overlay specific event handlers.
            if ($mobileOverlay.length) {
                // Listen for mobile toggle.
                $mobileToggle.click(function (e) {
                    e.preventDefault();

                    // Show mobile overlay and backdrop.
                    $mobileOverlay.removeClass('hidden');
                    $mobileBackdrop.removeClass('hidden');

                    // Lock mobile scroll.
                    currentScroll = $(window).scrollTop();
                    $body.css({
                        position: 'fixed',
                        top: -currentScroll
                    });

                    // Add transitions.
                    setTimeout(function () {
                        $mobileBackdrop.addClass('backdrop--enter');
                        $mobileOverlay.addClass('overlay--enter');
                    }, 0);
                    Drupal.behaviors.tesla_save_design_form.triggerViewEvents();
                });

                // Hide backdrop and overlay on click of either close
                //   button or backdrop.
                $mobileClose.add($mobileBackdrop).click(function (e) {
                    e.preventDefault();

                    // Prevent mobile scroll.
                    $body.css({
                        position: 'relative',
                        top: -0
                    });
                    $(window).scrollTop(currentScroll);

                    $mobileBackdrop.addClass('hidden').removeClass('backdrop--enter');
                    $mobileOverlay.addClass('hidden').removeClass('overlay--enter');

                    Drupal.behaviors.tesla_save_design_form.triggerCloseEvents();
                });
            }

            // Copy the shareable url in the input field.
            $copyLink.click(function (e) {
                e.preventDefault();

                Drupal.behaviors.tesla_save_design_form.triggerCopyEvents();

                // Hack for iOS browsers text selection
                var iOSDevice = BrowserDetect && BrowserDetect.OS && (BrowserDetect.OS.toLowerCase().indexOf('iphone') > -1);

                // Copy link hack for iOS
                if (iOSDevice) {
                    // Select input value on mobile.
                    $inputLink.get(0).setSelectionRange(0, 9999);
                } else {
                    // Select input value on desktop.
                    $inputLink.select();

                    // Highlight the link in the input field.
                    document.execCommand('copy');
                }
            });

            // Attach modal events.
            $modal.on('show.bs.modal', function () {
                Drupal.behaviors.tesla_save_design_form.triggerViewEvents();
            });

            $modal.on('hide.bs.modal', function () {
                Drupal.behaviors.tesla_save_design_form.triggerCloseEvents();
            });
        },

        /**
         * Determines if form has previously been submitted based on cookie
         *   value.
         *
         * @return boolean Form has been previously submitted.
         */
        alreadySubmittedForm: function () {
            var formSubmitted = 0;

            if (typeof Drupal.behaviors.tesla_save_design_data.getCampaignSubmitted === 'function') {
                formSubmitted = Drupal.behaviors.tesla_save_design_data.getCampaignSubmitted();
            }

            return formSubmitted > 0;
        },

        /**
         * Handles showing of confirmation screens by toggling DOM elements.
         */
        showConfirmation: function () {
            var $container = _$activeContainer,
                $formView = $container.find('.save-design--form'),
                $confirmView = $container.find('.save-design--confirmation');

            // Define selectors
            $formView.addClass('hidden');
            $confirmView.removeClass('hidden');

            // Remove loader.
            $container.find('.modal-throbber').addClass('hidden');
        },

        /**
         * Trigger form submit. This is used to send email to a user that has
         *   already submitted the form but requestes another save design.
         */
        triggerFormSubmit: function () {
            var $form = _$activeForm;
            $form.find('input[name="ajax-submit"]').click();
        },

        /**
         * Events that fire when the form is: viewed.
         */
        triggerViewEvents: function () {
            function throttle(timeout) {
                _invokeOnce = false;
                setTimeout(function () {
                    reset();
                }, timeout);
            }

            function reset() {
                _invokeOnce = true;
            }

            if (_invokeOnce) {
                // Ping Google Analytics.
                if (typeof TeslaAnalytics.SaveDesign.interactionViewOpen === 'function') {
                    TeslaAnalytics.SaveDesign.interactionViewOpen();
                }

                // Increment viewed value to cookie.
                if (typeof Drupal.behaviors.tesla_save_design_data.incrememntCampaignViewed === 'function' && typeof Drupal.behaviors.tesla_save_design_data.save === 'function') {
                    Drupal.behaviors.tesla_save_design_data.incrememntCampaignViewed();
                    Drupal.behaviors.tesla_save_design_data.save();
                }

                if (this.alreadySubmittedForm()) {
                    this.triggerFormSubmit();
                }
                throttle(_throttle);
            }
        },

        /**
         * Events that fire when the form is: copy.
         */
        triggerCopyEvents: function () {
            function throttle(timeout) {
                _invokeOnce = false;
                setTimeout(function () {
                    reset();
                }, timeout);
            }

            function reset() {
                _invokeOnce = true;
            }

            if (_invokeOnce) {
                // Ping Google Analytics.
                if (typeof TeslaAnalytics.SaveDesign.interactionCopyLink === 'function') {
                    TeslaAnalytics.SaveDesign.interactionCopyLink();
                }
                throttle(_throttle);
            }
        },

        /**
         * Events that fire when the form is: closed.
         */
        triggerCloseEvents: function () {
            function throttle(timeout) {
                _invokeOnce = false;
                setTimeout(function () {
                    reset();
                }, timeout);
            }

            function reset() {
                _invokeOnce = true;
            }

            if (_invokeOnce) {
                // Ping Google Analytics.
                if (typeof TeslaAnalytics.SaveDesign.interactionClose === 'function') {
                    TeslaAnalytics.SaveDesign.interactionClose();
                }

                // Increment closed value to cookie.
                if (typeof Drupal.behaviors.tesla_save_design_data.incrememntCampaignClosed === 'function' && typeof Drupal.behaviors.tesla_save_design_data.save === 'function') {
                    Drupal.behaviors.tesla_save_design_data.incrememntCampaignClosed();
                    Drupal.behaviors.tesla_save_design_data.save();
                }
                throttle(_throttle);
            }
        },

        /**
         * Callback function upon form submission (after values have been
         *   process on the back-end).
         *
         * @param string emailValue Email.
         * @param boolean isDesktop Is from desktop form.
         * @param boolean isStoreRequest Is store request.
         * @param string shareUrlWeb Share for: Web.
         * @param string shareUrlSocialFacebook Share for social: Facebook.
         * @param string shareUrlSocialTwitter Share for social: Twitter.
         * @param string shareUrlSocialEmail Share for social: Email.
         */
        triggerCallbackEvents: function (isDesktop, emailValue, isStoreRequest, shareUrlWeb, shareUrlSocialFacebook, shareUrlSocialTwitter, shareUrlSocialEmail) {
            // Set URL data.
            this.populateSaveDesignShareUrl(shareUrlWeb, shareUrlSocialFacebook, shareUrlSocialTwitter, shareUrlSocialEmail);

            // Increment submitted value to cookie.
            if (typeof Drupal.behaviors.tesla_save_design_data.incrememntCampaignSubmitted === 'function') {
                Drupal.behaviors.tesla_save_design_data.incrememntCampaignSubmitted();
                Drupal.behaviors.tesla_save_design_data.save();
            }

            // Store email in cookie.
            if (typeof Drupal.behaviors.tesla_save_design_data.setEmailAddress === 'function') {
                Drupal.behaviors.tesla_save_design_data.setEmailAddress(emailValue);
            }

            Drupal.behaviors.tesla_save_design_data.save();

            // Bypass setting submit and custom value if a store request.
            isStoreRequest = !!isStoreRequest; // Convert int to boolean.
            if (isStoreRequest) {
                // Purge entry from local storage on close.
                $(window).unload(function () {
                    // Purge store cookie.
                    if (typeof Drupal.behaviors.tesla_save_design_data.delete === 'function') {
                        Drupal.behaviors.tesla_save_design_data.delete();
                    }
                });
            }

            // Toggle to show design url.
            this.showConfirmation();
        },

        /**
         * Store test:
         *   Drupal.behaviors.tesla_save_design_form.setStoreTestMode();
         */
        setStoreTestMode: function () {
            var $form = _$activeForm;
            $form.find('input[name="tesla_save_design__is_store_test"]').val(1);
        },

        /**
         * Populates the share url input field with the result from the Bit.ly
         *   link generator (for Save Design Lite).
         *
         * @param string shareUrlWeb Share for: Web.
         * @param string shareUrlSocialFacebook Share for social: Facebook.
         * @param string shareUrlSocialTwitter Share for social: Twitter.
         * @param string shareUrlSocialEmail Share for social: Email.
         */
        populateSaveDesignShareUrl: function (shareUrlWeb, shareUrlSocialFacebook, shareUrlSocialTwitter, shareUrlSocialEmail) {
            var $container = _$activeContainer,
                $formView = $container.find('.save-design--form'),
                $confirmView = $container.find('.save-design--confirmation'),
                $twitterIcon,
                $facebookIcon,
                $emailIcon,
                $socialContainer = $confirmView.find('.modal-social');

            if (shareUrlSocialFacebook && shareUrlSocialTwitter && shareUrlSocialEmail) {
                // Update dom.
                $facebookIcon = $socialContainer.find('.tsla-icon-facebook');
                $twitterIcon = $socialContainer.find('.tsla-icon-twitter');
                $emailIcon = $socialContainer.find('.tsla-icon-email');

                $facebookIcon.attr('href', $facebookIcon.data('href') + encodeURIComponent(shareUrlSocialFacebook));
                $twitterIcon.attr('href', $twitterIcon.data('href') + encodeURIComponent(shareUrlSocialTwitter));
                $emailIcon.attr('href', $emailIcon.data('href') + encodeURIComponent(shareUrlSocialEmail));
            } else {
                // Hide social links.
                $socialContainer.addClass('hidden');
            }

            // Update form fields.
            this.setShortUrl(shareUrlWeb);
            $confirmView.find('.input-save').val(shareUrlWeb);
            $formView.find('input[name="tesla_save_design__url_short"]').val(shareUrlWeb);
        },

        /**
         * Set long url.
         * @param string longUrl Long url.
         */
        setLongUrl: function (longUrl) {
            var currentLongUrl = this.getLongUrl(),
                updateLongUrl = (currentLongUrl === '' || longUrl !== currentLongUrl);
            if (updateLongUrl) {
                _longUrl = longUrl;
            }
        },

        /**
         * Get long url.
         * @return string Long url.
         */
        getLongUrl: function () {
            return _longUrl;
        },

        /**
         * Set short url.
         * @param string shortUrl Short url.
         */
        setShortUrl: function (shortUrl) {
            var currentShortUrl = this.getShortUrl(),
                updateShortUrl = (currentShortUrl === '' || shortUrl !== currentShortUrl);
            if (updateShortUrl) {
                _shortUrl = shortUrl;
            }
        },

        /**
         * Get long url.
         * @return string Short url.
         */
        getShortUrl: function () {
            return _shortUrl;
        }

    };

}(this, this.document, this.jQuery, this.Drupal));
;
/*global debug */
/*global $ */
/*global TeslaLeadForm */

/**
 * Logic to handle save design and homepage takeover.
 */
(function ($, Drupal) {
    "use strict";

    var _currentAppVersion = '2.0',
        _dataKey = 'lc_save_design',
        _timeToLive = 365,

        _rawData = {},
        _dataDefaultsVersion10 = {
            appVersion: '1.0',
            viewed: 0,
            closed: 0,
            submitted: 0,
            custom_value: ''
        },
        _dataDefaultsVersion20 = {
            appVersion: '2.0',
            context: '',
            dateSaved: 0,
            locale: '',
            campaign: {
                viewed: 0,
                closed: 0,
                submitted: 0,
                emailAddress: ''
            },
            configuration: {
                model: '',
                description: '',
                options: '',
                subtotal: 0
            }
        },

        _appVersion = '',
        _context = '',
        _dateSaved = 0,
        _locale = '',
        _campaignViewed = 0,
        _campaignClosed = 0,
        _campaignSubmitted = 0,
        _emailAddress = '',
        _model = '',
        _description = '',
        _options = '',
        _subtotal = 0;


    /**
     * Data helper save_design forms and homepage take-over.
     */
    Drupal.behaviors.tesla_save_design_data = {

        /**
         * Init form handler.
         */
        attach: function () {
            // Set data from localstorage into object.
            if (!this.isContextConfirmation()) {
                this.setInitialDataState();
            }
        },

        /**
         * Get current app version.
         * @return string Current app version.
         */
        getCurrentAppVersion: function () {
            return _currentAppVersion;
        },

        /**
         * Get version 1.0 data defaults.
         * @return object 1.0 data defaults.
         */
        getDataDefaults10: function () {
            return _dataDefaultsVersion10;
        },

        /**
         * Get version 2.0 data defaults.
         * @return object 2.0 data defaults.
         */
        getDataDefaults20: function () {
            return _dataDefaultsVersion20;
        },

        /**
         * Get current data defaults.
         * @return object Current data defaults for version.
         */
        getCurrentDataDefaults: function () {
            return this.getDataDefaults20();
        },

        /**
         * Get data storage key.
         * @return string Data storage key.
         */
        getDataKey: function () {
            return _dataKey;
        },

        /**
         * Get time to live.
         * @return int Time to live.
         */
        getTimeToLive: function () {
            return _timeToLive;
        },

        /**
         * Get raw data.
         * @return string Configuration model.
         */
        getRawData: function () {
            return _rawData;
        },

        /**
         * Set raw data.
         * @param string model Configuration model.
         */
        setRawData: function (data) {
            _rawData = data;
        },

        /**
         * Has legacy version.
         */
        setInitialDataState: function () {
            var data = this.getCurrentDataDefaults(),
                dataRaw = TeslaLeadForm.Helpers.getLocalStorageItem(this.getDataKey()),
                currentAppVersion = this.getCurrentAppVersion(),
                appVersion;

            if (dataRaw === undefined || dataRaw === null) {
                // Set to latest app version.
                appVersion = currentAppVersion;
            } else {
                if (dataRaw.appVersion === undefined || dataRaw.appVersion === null || dataRaw.appVersion === '1.0') {
                    data = this.getDataDefaults10();
                }
                $.extend(true, data, dataRaw);
                appVersion = data.appVersion;
            }
            this.setRawData(data);
            this.setAppVersion(appVersion);
            if (appVersion < currentAppVersion) {
                this.mapLegacyData();
                // Save in the new structure, so we don't have to do this again.
                this.save();
            } else {
                this.mapData();
            }
        },

        /**
         * Set data state for confirmation page (Save design heavy).
         *
         * @param string email Email address.
         * @param string model Model code.
         * @param string description Description.
         * @param string options Options CSV.
         * @param string locale Locale
         */
        setInitialDataStateHeavy: function (email, model, description, options, locale) {
            this.setInitialDataState();
            this.incrememntCampaignViewed();
            this.incrememntCampaignSubmitted();

            if (email !== undefined && email !== '') {
                this.setEmailAddress(email);
            }

            if (model !== undefined && model !== '') {
                this.setModel(model);
            }
            // Set description.
            if (description !== undefined && description !== '') {
                this.setDescription(description);
            }
            // Set options.
            if (options !== undefined && options !== '') {
                this.setOptions(options);
            }
            // Set locale.
            if (locale !== undefined && locale !== '') {
                this.setLocale(locale);
            }
        },

        /**
         * Map data.
         */
        mapData: function () {
            var data = this.getRawData();

            // Set context.
            if (data.context !== undefined && data.context !== '') {
                this.setContext(data.context);
            }
            // Set date saved.
            if (data.dateSaved !== undefined && data.dateSaved !== '') {
                this.setDateSaved(data.dateSaved);
            }
            // Set locale.
            if (data.locale !== undefined && data.locale !== '') {
                this.setLocale(data.locale);
            }

            // Campaign.
            if (data.campaign !== undefined) {
                // Set viewed.
                if (data.campaign.viewed !== undefined && parseInt(data.campaign.viewed) > 0) {
                    this.setCampaignViewed(data.campaign.viewed);
                }
                // Set closed.
                if (data.campaign.closed !== undefined && parseInt(data.campaign.closed) > 0) {
                    this.setCampaignClosed(data.campaign.closed);
                }
                // Set submitted.
                if (data.campaign.submitted !== undefined && parseInt(data.campaign.submitted) > 0) {
                    this.setCampaignSubmitted(data.campaign.submitted);
                }
                // Set email address.
                if (data.campaign.emailAddress !== undefined && data.campaign.emailAddress !== '') {
                    this.setEmailAddress(data.campaign.emailAddress);
                }
            }

            // Configurations.
            if (data.configurations !== undefined) {
                // Set model.
                if (data.configuration.model !== undefined && data.configuration.model !== '') {
                    this.setModel(data.configuration.model);
                }
                // Set description.
                if (data.configuration.description !== undefined && data.configuration.description !== '') {
                    this.setDescription(data.configuration.description);
                }
                // Set options.
                if (data.configuration.options !== undefined && data.configuration.options !== '') {
                    this.setOptions(data.configuration.options);
                }
                // Set subtotal.
                if (data.configuration.subtotal !== undefined && data.configuration.subtotal !== '') {
                    this.setSubtotal(data.configuration.subtotal);
                }
            }
        },

        /**
         * Map legacy version to current.
         */
        mapLegacyData: function () {
            var appVersion = this.getAppVersion(),
                data = this.getRawData();
            if (appVersion === '1.0') {
                // Set viewed.
                if (data.viewed !== undefined && parseInt(data.viewed) > 0) {
                    this.setCampaignViewed(data.viewed);
                }
                // Set closed.
                if (data.closed !== undefined && parseInt(data.closed) > 0) {
                    this.setCampaignClosed(data.closed);
                }
                // Set submitted.
                if (data.submitted !== undefined && parseInt(data.submitted) > 0) {
                    this.setCampaignSubmitted(data.submitted);
                }
                // Set email address.
                if (data.custom_value !== undefined && data.custom_value !== '') {
                    this.setEmailAddress(data.custom_value);
                }
                // Set app version to latest.
                this.setAppVersion(this.getCurrentAppVersion());

                // Set context.
                this.setContextFromPageId();
            } else {
                return;
            }
        },

        /**
         * Write legacy data (for testing).
         * @example Drupal.behaviors.tesla_save_design_data.writeLegacyData();
         */
        writeLegacyData: function () {
            var data = this.getDataDefaults10();
            TeslaLeadForm.Helpers.setLocalStorageItem(this.getDataKey(), data);
        },

        /**
         * Get app version.
         * @return string App version.
         */
        getAppVersion: function () {
            return _appVersion;
        },

        /**
         * Set app version.
         * @param string context App version.
         */
        setAppVersion: function (appVersion) {
            _appVersion = appVersion;
        },

        /**
         * Get context.
         * @return string Context.
         */
        getContext: function () {
            if (_context === '') {
                this.setContextFromPageId();
            }
            return _context;
        },

        /**
         * Set context.
         * @param string context Context.
         */
        setContext: function (context) {
            _context = context;
        },

        /**
         * Set context from page id.
         */
        setContextFromPageId: function () {
            this.setContext(TeslaLeadForm.Helpers.getContextFromPageId());
        },

        /**
         * Compare context against string.
         *
         * @param string Input context to check.
         * @return boolean Is context of the context inputted.
         */
        isContext: function (context) {
            return (this.getContext() === context);
        },

        /**
         * Is context: Order page.
         *
         * @return boolean Is context: Order page.
         */
        isContextOrder: function () {
            return this.isContext('page-order');
        },

        /**
         * Is context: Confirmation page.
         *
         * @return boolean Is context: Confirmation page.
         */
        isContextConfirmation: function () {
            return this.isContext('page-order-confirm');
        },

        /**
         * Get date saved.
         * @return string Date saved (UNIX timestamp).
         */
        getDateSaved: function () {
            if (_dateSaved === 0) {
                this.setDateSavedToCurrentDate();
            }
            return _dateSaved;
        },

        /**
         * Set date saved.
         * @param string dateSaved Date Saved (UNIX timestamp).
         */
        setDateSaved: function (dateSaved) {
            _dateSaved = this.getCurrentDate(dateSaved);
        },

        /**
         * Set date saved to current date (UNIX timestamp).
         */
        setDateSavedToCurrentDate: function () {
            this.setDateSaved(this.getCurrentDate());
        },

        /**
         * Get current date.
         * @return string Current date (UNIX timestamp).
         */
        getCurrentDate: function () {
            return new Date().getTime();
        },

        /**
         * Get current date.
         * @return string Current date (UNIX timestamp).
         */
        getExpirationDate: function () {
            var timeToLive = this.getTimeToLive(),
                dateSaved = this.getDateSaved(),
                dateExpires = new Date((dateSaved * 1000) + timeToLive);
            return dateExpires;
        },

        /**
         * Is data valid.
         */
        isWithinTimeToLive: function () {
            var dateSaved = this.getDateSaved(),
                dateExpires = this.getExpirationDate();
            return dateExpires > dateSaved;
        },

        /**
         * Get locale.
         * @return string Locale.
         */
        getLocale: function () {
            return _locale;
        },

        /**
         * Set locale.
         * @param string Locale.
         */
        setLocale: function (locale) {
            _locale = locale;
        },

        /**
         * Set locale to the user's current locale (as identified by Drupal).
         */
        setLocaleToCurrentLocale: function () {
            this.setLocale(Drupal.settings.tesla.locale);
        },

        /**
         * Set number of times campaign viewed.
         * @param int viewed Number of times campaign viewed.
         */
        setCampaignViewed: function (viewed) {
            _campaignViewed = parseInt(viewed);
        },

        /**
         * Get number of times campaign viewed.
         * @return int Number of times campaign viewed.
         */
        getCampaignViewed: function () {
            return _campaignViewed;
        },

        /**
         * Incrememnt number of times campaign viewed.
         */
        incrememntCampaignViewed: function () {
            _campaignViewed += 1;
        },

        /**
         * Set number of times campaign closed.
         * @param int viewed Number of times campaign closed.
         */
        setCampaignClosed: function (closed) {
            _campaignClosed = parseInt(closed);
        },

        /**
         * Get number of times campaign closed.
         * @return int Number of times campaign closed.
         */
        getCampaignClosed: function () {
            return _campaignClosed;
        },

        /**
         * Incrememnt number of times campaign closed.
         */
        incrememntCampaignClosed: function () {
            _campaignClosed += 1;
        },

        /**
         * Set number of times campaign submitted.
         * @param int viewed Number of times campaign submitted.
         */
        setCampaignSubmitted: function (submitted) {
            _campaignSubmitted = parseInt(submitted);
        },

        /**
         * Get number of times campaign submitted.
         * @return int Number of times campaign submitted.
         */
        getCampaignSubmitted: function () {
            return _campaignSubmitted;
        },

        /**
         * Incrememnt number of times campaign submitted.
         */
        incrememntCampaignSubmitted: function () {
            _campaignSubmitted += 1;
        },

        /**
         * Get email address.
         * @return string Email address.
         */
        getEmailAddress: function () {
            return _emailAddress;
        },

        /**
         * Set email address.
         * @param string context Email address.
         */
        setEmailAddress: function (emailAddress) {
            _emailAddress = emailAddress;
        },

        /**
         * Get configuration model.
         * @return string Configuration model.
         */
        getModel: function () {
            return _model;
        },

        /**
         * Set configuration model.
         * @param string model Configuration model.
         */
        setModel: function (model) {
            _model = model;
        },

        /**
         * Get configuration description.
         * @return string Configuration description.
         */
        getDescription: function () {
            return _description;
        },

        /**
         * Set configuration description.
         * @param string model Configuration description.
         */
        setDescription: function (description) {
            _description = description;
        },

        /**
         * Get configuration options.
         * @return string Configuration options.
         */
        getOptions: function () {
            return _options;
        },

        /**
         * Set configuration options.
         * @param string model Configuration options.
         */
        setOptions: function (options) {
            _options = options;
        },

        /**
         * Get configuration subtotal.
         * @return int Configuration subtotal.
         */
        getSubtotal: function () {
            return _subtotal;
        },

        /**
         * Set configuration subtotal.
         * @param int Configuration subtotal.
         */
        setSubtotal: function (subtotal) {
            _subtotal = subtotal;
        },

        /**
         * Construct object.
         */
        constructObject: function () {
            var data = {
                appVersion: this.getAppVersion(),
                context: this.getContext(),
                dateSaved: this.getDateSaved(),
                locale: this.getLocale(),
                campaign: {
                    viewed: this.getCampaignViewed(),
                    closed: this.getCampaignClosed(),
                    submitted: this.getCampaignSubmitted(),
                    emailAddress: this.getEmailAddress()
                },
                configuration: {
                    model: this.getModel(),
                    description: this.getDescription(),
                    options: this.getOptions(),
                    subtotal: this.getSubtotal(),
                }
            };
            return data;
        },

        /**
         * Save data back to local storage.
         */
        save: function () {
            var $form,
                model,
                description,
                email,
                options,
                subtotal;

            // Set pre-save values.
            this.setDateSavedToCurrentDate();
            this.setContextFromPageId();
            this.setLocaleToCurrentLocale();

            if (typeof Drupal.behaviors.tesla_save_design_form.getActiveForm === 'function') {
                $form = Drupal.behaviors.tesla_save_design_form.getActiveForm();
                if ($form !== undefined) {
                    model = $form.find('input[name="tesla_save_design__model"]').val();
                    if (model !== '') {
                        this.setModel(model);
                    }
                    description = $form.find('input[name="tesla_save_design__vehicle_description"]').val();
                    if (description !== '') {
                        this.setDescription(description);
                    }
                    email = $form.find('input[name="tesla_save_design__email"]').val();
                    if (email !== '') {
                        this.setEmailAddress(email);
                    }
                    options = $form.find('input[name="tesla_save_design__options"]').val();
                    if (options !== '') {
                        this.setOptions(options);
                    }
                    subtotal = $form.find('input[name="tesla_save_design__subtotal"]').val();
                    if (subtotal !== '') {
                        this.setSubtotal(subtotal);
                    }
                }
            }

            TeslaLeadForm.Helpers.setLocalStorageItem(this.getDataKey(), this.constructObject());
        },

        /**
         * Delete data from local storage.
         */
        delete: function () {
            TeslaLeadForm.Helpers.removeLocalStorageItem(this.getDataKey());
        },

        /**
         * Invalidate data to show normal homepage.
         */
        invalidateData: function () {
            var data,
                dataKey,
                dataKeyDesktopConfiguratorModelS = 'tesla-app-design-studio.configuration.desktop.ms',
                dataKeyDesktopConfiguratorModelX = 'tesla-app-design-studio.configuration.desktop.mx',
                dataKeyMobileConfigurator = 'tesla-app-design-studio.configuration';

            // Delete lc_save_design data from local storage.
            this.delete();

            // Desktop configurator - Model S:
            dataKey = dataKeyDesktopConfiguratorModelS;
            // Get storage.
            data = TeslaLeadForm.Helpers.getLocalStorageItem(dataKey);
            if (data !== undefined && data !== null) {
                // Inject invalidate flag.
                data.suppressPersonalization = true;
                // Set storage.
                TeslaLeadForm.Helpers.setLocalStorageItem(dataKey, data);
            }

            // Desktop configurator - Model X:
            dataKey = dataKeyDesktopConfiguratorModelX;
            // Get storage.
            data = TeslaLeadForm.Helpers.getLocalStorageItem(dataKey);
            if (data !== undefined && data !== null) {
                // Inject invalidate flag.
                data.suppressPersonalization = true;
                // Set storage.
                TeslaLeadForm.Helpers.setLocalStorageItem(dataKey, data);
            }

            // Mobile configurator.
            dataKey = dataKeyMobileConfigurator;
            // Get storage.
            data = TeslaLeadForm.Helpers.getLocalStorageItem(dataKey);
            if (data !== undefined && data !== null) {
                // Inject invalidate flag.
                data.suppressPersonalization = true;
                // Set storage.
                TeslaLeadForm.Helpers.setLocalStorageItem(dataKey, data);
            }
        }
    };

}(this.jQuery, this.Drupal));
;
/*global window */
/*global debug */
/*global jQuery */
/*global Drupal */
/*global TeslaLeadForm */
/*global PersonalizedHomepage */
/*global Tesla */

(function (window, document, $, Drupal) {
    "use strict";

    /**
     * @class PersonalizedHomepage - Helpers functions to assist with personalizing
     * the homepage for the current user. The personalized homepage styling
     * is toggled via the .homepage--personalized body class. The inventory
     * modal functionality is unlocked via the .homepage--inventory body class.
     */
    window.PersonalizedHomepage = {};

    /**
     * Determines whether or not the homepage should be personalized, based on the
     * recent user configurations and saved designs.
     *
     * @return {boolean} - Identifies whether or not to render personalized homepage
     */
    PersonalizedHomepage.shouldPersonalizeHomepage = function () {
        // Do not personalize homepage for stores. Show personalized
        // homepage as default case.
        var hidePersonalization = false;

        try {
            var isStoreIP = JSON.parse($.cookie('ip_info')).isStoreIP;
            if (isStoreIP !== undefined) {
                hidePersonalization = isStoreIP;
            }
        } catch (e) {
            // Error parsing ip info cookie.
        }

        return !!this.getConfigData() && !hidePersonalization;
    };

    /**
     * Show the personalized homepage.
     */
    PersonalizedHomepage.initPersonalization = function () {
        // Retrieve config data
        this.getConfigData();
        // Get location data
        this.getLocationData();

        // If config data doesn't exist, then don't render personalized homepage
        if (!this.shouldPersonalizeHomepage()) {
            return;
        }

        // Trigger GTM event
        this.triggerInitGTMEvent();

        // Toggle homepage experience
        var $homepage = $('.homepage-wrapper--default');
        var $personalized = $('.homepage-wrapper--personalized');
        var $inventory = $('.homepage-wrapper--inventory');

        $homepage.addClass('hide-on-desk');
        $personalized.removeClass('hidden');

        // Toggle body class
        $('body').addClass('homepage--personalized').removeClass('homepage--default');

        // Populate the rendered configuration compositor source
        var compositorImage = this.getCompositorURL(this.config.model, this.config.options, 'STUD_SIDE');

        $personalized
            .find('.section-render')
            .css('background-image', 'url(' + compositorImage + ')');

        // var start = Date.now();
        $personalized
            .find('.section-render_image')
            .attr('src', compositorImage)
            .load(function () {
                $personalized.find('.section-content').addClass('section-content--loaded');
            })
            .error(this.handleCloseClick.bind(this));

        // Populate vehicle test drive button, Design Studio edit link, and
        // inventory link.
        var editLink = '';
        var inventoryLink = '?model=' + this.config.model;

        if (this.location.zipcode) {
            inventoryLink += '&zip=' + this.location.zipcode;
        }

        switch (this.config.model) {
        case 'ms':
            $personalized.add($inventory).addClass('homepage-wrapper--models');
            editLink = '?cfg=' + this.config.options;
            break;
        case 'mx':
            $personalized.add($inventory).addClass('homepage-wrapper--modelx');
            editLink = '?cfg=' + this.config.options;
            break;
        }

        // Populate configuration string for the edit Design Studio link
        $personalized
            .add($inventory)
            .find('.btn-design')
            .each(function () {
                var $this = $(this);
                $this.attr('href', $this.attr('href') + editLink);
            });

        // Populate inventory link parameters
        $personalized
            .add($inventory)
            .find('.btn-inventory')
            .each(function () {
                var $this = $(this);
                $this.attr('href', $this.attr('href') + inventoryLink);
            });

        // Retrieve inventory data if inventory UI is allowed
        if (this.allowInventoryUI()) {
            $('.modal-inventory .modal-throbber').removeClass('hidden');
            this.getInventoryData(this.config.model, this.location.countryCode, this.location.stateCode, null, this.config.options, this.config.subtotal, this.updateInventoryUI.bind(this));
        }

        // Handle close click
        $personalized
            .find('.btn-exit')
            .click(this.handleCloseClick.bind(this));

        // Handle modal toggle click
        $personalized
            .find('[data-target="#modal-inventory"]')
            .click(this.handleModalToggle.bind(this));

        // Populate vehicle description
        $personalized
            .find('.content-description')
            .html(this.config.description);

        // Handle zip code lookup toggle
        $personalized
            .add($inventory)
            .find('.inventory-availability .btn-availability')
            .click(this.handleZipCodeToggle.bind(this));

        // Handle zip code lookup
        $personalized
            .add($inventory)
            .find('.inventory-availability_zipcode')
            .on('keypress', this.handleZipCodeLookup.bind(this));
    };

    /**
     * Retrieve the configuration data from local storage. If the configuration data
     * is not valid, then return null. If the data has already been retrieved from
     * local storage, then return the already found data. Only get configuration
     * data from the same locale as the user's current locale.
     *
     * Show a configuration if:
     * 1. Saved design within last 4 weeks
     * 2. Last viewed Design Studio configuration within last 4 weeks
     *
     * @return {string} - Configuration data or null
     */
    PersonalizedHomepage.getConfigData = function () {
        if (this.config) {
            return this.config;
        }

        // Get user's current locale
        var locale = Drupal.settings.tesla.locale;

        // Retrieve data from local storage. First check for a saved design.
        var data;

        try {
            var sdStorage = Storage.get('lc_save_design');

            if (sdStorage.locale === locale) {
                data = {
                    model: sdStorage.configuration.model,
                    options: sdStorage.configuration.options,
                    description: sdStorage.configuration.description,
                    subtotal: sdStorage.configuration.subtotal
                };
            }
        } catch (e) {

        }

        // If there isn't a saved design, then check for last DS configuration
        if (!data) {
            var msConfig = this.getConfigDataFromStorage('tesla-app-design-studio.configuration.desktop.ms');
            var mxConfig = this.getConfigDataFromStorage('tesla-app-design-studio.configuration.desktop.mx');

            // Initialize to show Model S
            data = msConfig || data;

            // Use Model X config data if set more recently than Model S config data
            if (mxConfig && mxConfig.timestamp && (!msConfig || msConfig.timestamp < mxConfig.timestamp)) {
                data = mxConfig || data;
            }

            // If viewed on a mobile device, prioritize mobile configuration
            if (this.isMobile()) {
                var msMobileConfig = this.getMobileConfigDataFromStorage('tesla-app-design-studio.configuration', 'ms');
                var mxMobileConfig = this.getMobileConfigDataFromStorage('tesla-app-design-studio.configuration', 'mx');

                data = msMobileConfig || data;

                if (mxMobileConfig && mxMobileConfig.timestamp && (!msMobileConfig || msMobileConfig.timestamp < mxMobileConfig.timestamp)) {
                    data = mxMobileConfig || data;
                }

            }
        }

        if (!data) {
            return null;
        }

        // Data cleanup.
        // Remove periods from description text.
        if (data.description && data.description.indexOf('.') !== -1) {
            data.description = data.description.replace(/\./g, '');
        }

        this.config = data;
        return this.config;
    };

    /**
     * Get config data from local storage for the provided key.
     *
     * @param {string} key - Key to retrieve data from local storage
     * @return {object} - Config data for the provided key
     */
    PersonalizedHomepage.getConfigDataFromStorage = function (key) {
        var locale = Drupal.settings.tesla.locale;
        var config = null;

        try {
            var storage = Storage.get(key);

            // Get this configuration's locale
            var storageLocale = storage.OMS.oms_params.locale;

            // Validate configuration is not suppressed and that it is from the same locale
            if (!storage.suppressPersonalization && storageLocale === locale) {
                config = {
                    model: storage.OMS.oms_params.model,
                    options: storage.Configuration.option_codes,
                    description: storage.Configuration.description,
                    subtotal: storage.Configuration.subtotal,
                    timestamp: storage.Configuration.date_updated
                };
            }
        } catch (e) {}

        return config;
    };

    /**
     * Get config data from local storage for the provided key for mobile
     * configurator.
     *
     * @param {string} key - Key to retrieve data from local storage
     * @return {object} - Config data for the provided key
     */
    PersonalizedHomepage.getMobileConfigDataFromStorage = function (key, model) {
        var locale = Drupal.settings.tesla.locale;
        var config = null;

        try {
            var storage = Storage.get(key);
            var storageData = storage.StoredConfiguration[model];

            // Get this configuration's locale
            var storageLocale = storageData.locale;

            // Validate configuration is not suppressed and that it is from the same locale
            if (!storage.suppressPersonalization && storageLocale === locale) {
                config = {
                    model: model,
                    options: storageData.option_codes.join(","),
                    description: storageData.description,
                    subtotal: storageData.subtotal,
                    timestamp: storageData.timestamp
                };
            }
        } catch (e) {}

        return config;
    };

    /**
     * Get location data from ip info cookie. If not set, return empty.
     *
     * @return {object} - IP based location data
     */
    PersonalizedHomepage.getLocationData = function () {
        if (this.location) {
            return this.location;
        }
        var data = null;

        try {
            var ipInfo = JSON.parse($.cookie('ip_info'));
            data = {
                countryCode: ipInfo.country_code,
                country: ipInfo.country,
                stateCode: ipInfo.state_code,
                state: ipInfo.state,
                zipcode: ipInfo.postal
            };
        } catch (e) {
            // Unable to parse ip info cookie
        }

        if (!data || data.countryCode !== Drupal.settings.tesla.country) {
            data = {
                countryCode: Drupal.settings.tesla.country,
                country: Drupal.settings.tesla.country,
                stateCode: null,
                state: null,
                zipcode: null
            };
        }

        this.location = data;
        return this.location;
    };

    /**
     * Builds a compositor URL, given the configuration string and the view of the
     * image to render.
     *
     * @param {string} model - Model of the vehicle to render
     * @param {string} config - Options string of the vehicle
     * @param {string} view - View / angle to render
     *
     * @return {string} - Compositor URL
     */
    PersonalizedHomepage.getCompositorURL = function (model, config, view) {
        return 'https://www.tesla.com/configurator/compositor?model=' + model + '&view=' + view + '&bkba_opt=1&options=' + config + '&size=1920';
    };

    /**
     * Retrieves the inventory vehicle data.
     *
     * @param {string} model - Model of the inventory vehicle to search for
     * @param {string} country - Country code of the inventory vehicle to search for
     * @param {string} state - State of the inventory vehicle to search for
     * @param {string} zipcode - Zip code of the inventory vehicle to search for
     * @param {string} options - Options string of the designed vehicle
     * @param {function} callback - Callback to update UI based on inventory data
     */
    PersonalizedHomepage.getInventoryData = function (model, country, state, zipcode, options, subtotal, callback) {
        $.ajax({
            type: 'GET',
            url: '/inventory/match',
            data: {
                model: model,
                country: country,
                state: state,
                zipcode: zipcode,
                options: options,
                subtotal: subtotal
            },
            success: function (data) {
                callback(data);
            },
            error: function () {
                callback();
            }
        });
    };

    /**
     * Identifies if the provided country should have inventory match by state.
     *
     * @param {string} countryCode - 2 letter country code
     * @return {boolean} - Whether or not country has inventory match by state
     */
    PersonalizedHomepage.countryHasInventoryMatchByState = function (countryCode) {
        var countries = ['US', 'CA'];
        return countries.indexOf(countryCode) > -1;
    };

    /**
     * Handles the modal toggle click in the personalized homepage section. On
     * desktop this uses the default modal component. On mobile, this hides the rest
     * of the page and only shows the inventory availability screen.
     *
     * Identifies the order button by the [data-target="modal-inventory"] attribute.
     */
    PersonalizedHomepage.handleModalToggle = function (e) {
        e.preventDefault();

        // Trigger GTM event
        this.triggerGTMEvent('inventory-modal', 'view-open');

        // On mobile, hide all sections except the inventory section
        if (this.isMobile()) {
            $('.homepage-wrapper--personalized')
                .add('.homepage-wrapper--default')
                .add('.section-updates')
                .addClass('hide-on-mobile');

            $('.homepage-wrapper--inventory').removeClass('hidden');
        }
    };

    /**
     * Only allow inventory UI if state and /or country are known and if
     * inventory body class (.homepage--inventory) is present.
     */
    PersonalizedHomepage.allowInventoryUI = function () {
        // Validate inventory body class is present.
        if (!$('.homepage--inventory').length) return false;

        // Validate location data. If country has inventory match by state,
        // require state be identified.
        return !!this.getLocationData() && this.countryHasInventoryMatchByState(this.location.countryCode) ?
            !!this.location.stateCode : !!this.location.countryCode;
    }


    /**
     * Updates the UI with inventory related state for the provided inventory data.
     *
     * @param {object} inventoryData - Inventory data
     */
    PersonalizedHomepage.updateInventoryUI = function (inventoryData) {
        // Define some commonly used DOM elements
        var $personalized = $('.homepage-wrapper--personalized');
        var $inventory = $('.homepage-wrapper--inventory');
        var $throbber = $('.modal-inventory .modal-throbber');

        // If no matches found, then show the no matches view, otherwise show the
        // retrieved inventory vehicle. This will also prevent the modal option
        // from becoming available if this is first pass.
        if (!this.validateInventoryData(inventoryData)) {
            // Trigger GTM event
            this.triggerGTMEvent('inventory-modal', 'no-match');

            $('.inventory--match').addClass('hidden');
            $('.inventory--no_match').removeClass('hidden');

            $throbber.addClass('hidden');
            return;
        }

        // Match found
        $('.inventory--match').removeClass('hidden');
        $('.inventory--no_match').addClass('hidden');

        // Show modal toggle (hide the link directly to Design Studio)
        $('.section-content_header .btn-toggle').removeClass('hidden');
        $('.section-content_header .btn-design').addClass('hidden');

        // Populate the inventory compositor image source
        $personalized
            .add($inventory)
            .find('.inventory-image')
            .attr('src', this.getCompositorURL(inventoryData.model, inventoryData.options, 'STUD_3QTR'));

        // Populate inventory vehicle price diff
        // If no subtotal saved in local storage, show inventory price
        var subtotal = Tesla.formatMoney(Math.abs(inventoryData.subtotal), Drupal.settings.tesla.locale, 0);
        var priceDiff = inventoryData.subtotal - this.config.subtotal;

        if (this.config.subtotal > 0) {
            var formattedPrice = {
                '@price': Tesla.formatMoney(Math.abs(priceDiff), Drupal.settings.tesla.locale, 0)
            };

            if (priceDiff > 0) {
                subtotal = Drupal.t('@price more', formattedPrice);
            } else if (priceDiff < 0) {
                subtotal = Drupal.t('@price less', formattedPrice);
            }
        }

        var features = '<li><b>' + subtotal + '</b></li>';

        // Populate the vehicle features
        if (inventoryData.features !== undefined) {
            inventoryData.features.forEach(function (item) {
                features += '<li>' + item + '</li>';
            });
        }

        // Populate the inventory vehicle features
        $personalized
            .add($inventory)
            .find('.inventory-specs')
            .html(features);

        // Update the order link with inventory details page
        $personalized
            .add($inventory)
            .find('.btn-order')
            .each(function () {
                // Populate the path with the format: /new/{VIN}
                // If there was a vin already populate, replace the last vin
                // with the new vehicle's vin
                var $this = $(this);
                var inventoryPath = 'new';
                var baseUrlIndex = $this.attr('href').indexOf(inventoryPath) + inventoryPath.length;

                var newUrl = $this.attr('href').slice(0, baseUrlIndex) + '/' + inventoryData.vin;
                $this.attr('href', newUrl);
            });

        // Hide load animation
        $throbber.addClass('hidden');
        this.updateInventoryAvailabilityUI();
    };

    /**
     * Updates the UI with inventory availablity for the provided location.
     */
    PersonalizedHomepage.updateInventoryAvailabilityUI = function () {
        this.getLocationData();

        var $personalized = $('.homepage-wrapper--personalized');
        var $inventory = $('.homepage-wrapper--inventory');

        // Show hide DOM inventory availability based on known location
        var hasInventoryByState = this.countryHasInventoryMatchByState(this.location.countryCode);
        var availabilityLocation;

        if (hasInventoryByState && (this.location.state || this.location.stateCode)) {
            availabilityLocation = this.location.state || this.location.stateCode;
            $('.btn-availability').removeClass('hidden');
            $('.text-availability').addClass('hidden');
        } else {
            availabilityLocation = this.location.country || this.location.countryCode;
        }

        if (availabilityLocation) {
            $personalized
                .add($inventory)
                .find('.availability-location')
                .html(availabilityLocation);
        }
    };

    /**
     * Validate inventory data.
     */
    PersonalizedHomepage.validateInventoryData = function (data) {
        return !!data && typeof data === 'object' && !!data.model
            && !!data.options && !!data.subtotal && !!data.features
            && !!data.vin;
    }

    /**
     * Handle location toggle click for inventory vehicles. Show the zip code
     * input when clicked.
     */
    PersonalizedHomepage.handleZipCodeToggle = function (e) {
        e.preventDefault();

        var $known = $('.inventory-availability_known');
        var $unknown = $('.inventory-availability_unknown');

        $known.addClass('hidden');
        $unknown.removeClass('hidden');
    };

    /**
     * Handles the close button for the personalized homepage. On mobile this will
     * hide the personalized section and removes configurations from local
     * storage. On desktop, this will remove configurations from local
     * storage and refresh the page.
     */
    PersonalizedHomepage.handleCloseClick = function (e) {
        e.preventDefault();

        Drupal.behaviors.tesla_save_design_data.invalidateData();

        if (this.isMobile()) {
            $('.homepage-wrapper--default').removeClass('hidden');
            $('.homepage-wrapper--personalized').addClass('hidden');
            $('.homepage-wrapper--inventory').addClass('hidden');
        } else {
            window.location.reload();
        }
    };

    /**
     * Attempts to retrieve the user's current state (for US and CA only). If
     * successful, then render the best matched inventory vehicle.
     */
    PersonalizedHomepage.handleZipCodeLookup = function (e) {
        if (e.which !== 13) {
            return;
        }

        // Trigger GTM event
        this.triggerGTMEvent('inventory-modal', 'enter-zip');

        // Show load animation
        var $throbber = $('.modal-inventory .modal-throbber');
        $throbber.removeClass('hidden');

        // Get new inventory matches with entered zipcode
        var zipcode = e.target.value;
        this.getInventoryData(this.config.model, this.location.countryCode, this.location.stateCode, zipcode, this.config.options, this.config.subtotal, this.updateInventoryUI.bind(this));

        // Update inventory link with updated zipcode
        $('.btn-inventory').each(function () {
            var $this = $(this);
            $this.attr('href', $this.attr('href').replace(/(zip=)[^&]*/, '$1' + zipcode));
        });
    };

    /**
     * Identifies if the desktop or mobile version of the site is rendering,
     * based on the current viewport.
     *
     * @return {boolean} - Identifies if currently a mobile viewport
     */
    PersonalizedHomepage.isMobile = function () {
        return $(window).width() <= 640;
    };

    /**
     * Bind GTM events
     */
    PersonalizedHomepage.bindGTMEvents = function () {
        var that = this;
        $('[data-gtm-type][data-gtm-interaction]').click(function (e) {
            var $target = $(e.currentTarget);
            var type = $target.data('gtm-type');
            var interaction = $target.data('gtm-interaction');

            that.triggerGTMEvent(type, interaction);
        }).bind(this);
    };

    /**
     * Identifies if the desktop or mobile version of the site is rendering,
     * based on the current viewport.
     *
     * @param {string} type - Type of personalization event to log
     * @param {string} interaction - Interaction to log
     */
    PersonalizedHomepage.triggerGTMEvent = function (type, interaction) {
        window.dataLayer.push({
            event: 'personalization',
            personalizationType: type,
            interaction: interaction
        });
    };

    /**
     * Trigger the initial GTM event when the personalized homepage is rendered and
     * bind future GTM events.
     */
    PersonalizedHomepage.triggerInitGTMEvent = function () {
        window.dataLayer.push({
            event: 'virtualPageview',
            virtualPageURL: '/virtual/personalization/homepage',
            virtualPageTitle: 'Welcome Back'
        });

        // Bind other events
        this.bindGTMEvents();
    };

}(window, document, jQuery, Drupal));
;
/**
 * Homepage script which renders the background video for the video homepage,
 * and toggles the personalized homepage.
 */
$(document).ready(function () {
    // Render the personalized homepage if conditions are met

    // NOTE: For testing purposes (this will get called by Google Optimize)
    // Initialize the personalized homepage
    // PersonalizedHomepage.initPersonalization();

    // Initialize video homepage
    initVideo();

    // Initialize page-specific GTM analytics tagging
    initHomePageAnalytics();

    // Initialize dock overlay.
    // Important: This is triggered via Google Optimize.
    // initDockOverlay();
});

/**
 * Renders video only for classes with a specific body class on desktop.
 * Replaces mobile hero image to match video.
 */
function initVideo() {
    // Selectors
    var $video      = $('.primary-video');
    var $window     = $(window);
    var $body       = $('body');
    var $html       = $('html');

    // Do not render video or image homepage if personalized homepage
    if ($body.hasClass('homepage--personalized')) return;

    $('.homepage-wrapper--default').removeClass('hidden');

    // Check to see if the video is on the page - it will only appear for
    // locales with the video enabled. Add body class depending on the variation
    // of the homepage shown.
    if ($video.length) {
        $body.addClass('homepage-video');

        // Only load video for non-touch devices
        if (!$html.hasClass('touch')) {
            // Pull the video and image sources from the data-src
            // attributes. This prevents the assets being loaded to the DOM
            // when for pages that don't use them.
            $video.find('source, img').each(populateSource);

            // Reinject the video element into the DOM to trigger playback
            $video.html($video.html());

            // Handle missing videos
            $video.find('source:last-of-type').error(function() {
                $body.addClass('homepage-image').removeClass('homepage-video');
            });
        }
    } else {
        $body.addClass('homepage-image');
    }
}

/**
 * Populate src and srcset for the provided element defined in the element's
 * data-src and data-srcsets data attributes. Assumes that "this" is bound
 * to the element.
 */
function populateSource() {
    var $this = $(this);
    $this.attr({
        'src': $this.data('src'),
        'srcset': $this.data('srcset')
    });
}

/**
 * Initialize home page analytics.
 */
function initHomePageAnalytics() {
    // Click event
    $('[data-gtm-event][data-gtm-form][data-gtm-interact][data-gtm-type="click"]').click(function () {
        var $this = $(this);
        var dataLayer = window.dataLayer || [];

        // Get the GTM data
        var eventName = $this.data('gtm-event');
        var formType = $this.data('gtm-form');
        var interaction = $this.data('gtm-interact');

        // Validate the GTM data is all provided
        if (!eventName || !formType || !interaction) return;

        // Verify that this event does not already exist in the dataLayer.
        // Only record the event once.
        var eventExists = _.some(dataLayer, function (item) {
            return item["event"] === eventName && item["formType"] === formType && item["interaction"] === interaction;
        });

        if (!eventExists) {
            // Push the event to the dataLayer
            window.dataLayer.push({ "event": eventName, "formName": formType, "interaction": interaction });
        }
    });
}

/**
 * Initialize dock overlay (experiment).
 */
function initDockOverlay() {
    // Define dock.
    var $dockOverlay,
        dockOverlayCookie;

    // Only fire logic if NOT logged in.
    if (Drupal.behaviors.common.isLoggedOut()) {
        $dockOverlay = $('.dock-overlay');

        dockOverlayCookie = getDockOverlayCookie('lc_homepage');

        // Only show dock if exists and doesn't have cookie.
        if ($dockOverlay.length > 0 && showDockOverlay(dockOverlayCookie)) {
            // Update dock text.
            $dockOverlay.find('#feature--newsletter-form-inner-description').html('Sign up for the Tesla Newsletter to receive the latest company news, events, and product updates.');

            // Show dock after 4 seconds.
            $dockOverlay.removeClass('hidden');
            setTimeout(function () {
                $dockOverlay.find('.dock-overlay--slider').addClass('slider--up');
                setDockOverlayCookieKeyValue('viewed', dockOverlayCookie, 'lc_homepage');
            }, 4000);

            // Bind close action.
            $dockOverlay.find('.dock-overlay--close').click(function () {
                $dockOverlay.addClass('hidden');
                setDockOverlayCookieKeyValue('closed', null, 'lc_homepage');
            });
        }
    }
}

/**
 * Set dock overlay success message.
 */
function setDockOverlaySuccessMessage() {
    // Define dock.
    var $dockOverlay = $('.dock-overlay');

    // Remove standard success message (form).
    $dockOverlay.find('#tesla_insider_form').remove();

    // Update description for success message.
    $dockOverlay.find('#feature--newsletter-form-inner-description').addClass('dock-overlay--success').html('Thank you.<br />You have successfully subscribed to the Tesla Newsletter.');

    // Fire cookie.
    setDockOverlayCookieKeyValue('submitted', null, 'lc_homepage');
}
;
