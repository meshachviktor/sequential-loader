/**
 * SequentialLoader v1.0.0
 * Author: Gbemileke Adeleke (https://github.com/meshachviktor)
 * License: MIT
 */
 (function() {
    "use strict";
    function SequentialLoader(URL, debug) {
        this.url = URL;
        this._debug = debug;
        this.errorEvent = null;
        this.stylesheets = null;
        this.fonts = null;
        this.scripts = null;
        this.resourceCount = null;
        this.batchOrder = null;
        this.nextBatch = 0;
        this.nextStylesheet = 0;
        this.nextFont = 0;
        this.nextScript = 0;
        this.allStylesheetLoaded = false;
        this.allFontsLoaded = false;
        this.allScriptsLoaded = false;
        this.allResourcesInitialisedEvent = new Event('sl.allresourcesinitialised');
        this.fontsLoadedEvent = new Event('sl.fontsloaded');
        this.stylesheetsLoadedEvent = new Event('sl.stylesheetsloaded');
        this.scriptsLoadedEvent = new Event('sl.scriptsloaded');
        this.resourceLoadedEvent = new Event('sl.resourceloaded');
        this.allResourcesLoadedEvent = new Event('sl.allresourcesloaded');
    }

    SequentialLoader.prototype.toString = function() {
        return 'SequentialLoader';
    }

    SequentialLoader.prototype.isArray = function(object) {
        if (Array.isArray(object)) {
            return true;
        } else {
            return false;
        }
    }

    SequentialLoader.prototype.isEmptyArray = function(object) {
        if (object.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    SequentialLoader.prototype.isObject = function(object) {
        if (object instanceof Object && !Array.isArray(object)) {
            return true;
        } else {
            return false;
        }
    }

    SequentialLoader.prototype.isEmptyObject = function(object) {
        if (Object.keys(object).length === 0) {
            return true;
        } else {
            return false;
        }
    }

    SequentialLoader.prototype.isJSONString = function(string) {
        try {
            JSON.parse(string);
            return true;
        } catch (SyntaxError) {
            return false;
        }
    }

    SequentialLoader.prototype.detectError = function(event) {
        var isScriptError = this.scripts.some(function(scriptObject) {
            var regex = new RegExp(scriptObject.src);
            if (regex.test(event.filename)) {
                if (/SyntaxError/.test(event.message)) {
                    event.preventDefault();
                    return true;
                }
            } else {
                return false;
            }
        });
        if (isScriptError) {
            this.errorEvent = event;
        }
    }

    SequentialLoader.prototype.throwErrorIfErrorDetected = function() {
        if (this.errorEvent) {
            throw new Error(`Failed to load file ${this.errorEvent.filename}`);
        }
    }

    SequentialLoader.prototype.loadStylesheet = function(stylesheetObject) {
        var element = document.createElement('link');
        var attributes = Object.keys(stylesheetObject);
        element.rel = 'stylesheet';
        for (let attribute of attributes) {
            element[attribute] = stylesheetObject[attribute];
        }
        element.onload = this.loadNextStylesheet.bind(this);
        document.head.append(element);
    }

    SequentialLoader.prototype.loadNextStylesheet = function() {
        document.dispatchEvent(this.resourceLoadedEvent);
        if (this.nextStylesheet < this.stylesheets.length) {
            this.loadStylesheet(this.stylesheets[this.nextStylesheet]);
        } else {
            this.allStylesheetLoaded = true;
            document.dispatchEvent(this.stylesheetsLoadedEvent);
            return;
        }
        this.nextStylesheet++;
    }

    SequentialLoader.prototype.beginStylesheetLoading = function() {
        this.loadStylesheet(this.stylesheets[this.nextStylesheet]);
        this.nextStylesheet++;
    }

    SequentialLoader.prototype.loadFont = function(fontObject) {
        let font = null;
        if (fontObject['descriptors'] === undefined) {
            font = new FontFace(fontObject['family'], fontObject['source']);
        } else {
            font = new FontFace(fontObject['family'], fontObject['source'], fontObject['descriptors']);
        }
        font.load().then(function() {
            document.fonts.add(font);
            this.loadNextFont();
        }.bind(this)).catch(function(error) {
            throw new Error(`Could not load font from source: ${fontObject['source']}`);
        });
    }

    SequentialLoader.prototype.loadNextFont = function() {
        document.dispatchEvent(this.resourceLoadedEvent);
        if (this.nextFont < this.fonts.length) {
            this.loadFont(this.fonts[this.nextFont]);
        } else {
            this.allFontsLoaded = true;
            document.dispatchEvent(this.fontsLoadedEvent);
            return;
        }
        this.nextFont++;
    }

    SequentialLoader.prototype.beginFontLoading = function() {
        this.loadFont(this.fonts[this.nextFont]);
        this.nextFont++;
    }

    SequentialLoader.prototype.loadScript = function(scriptObject) {
        var element = document.createElement('script');
        var attributes = Object.keys(scriptObject);
        for (let attribute of attributes) {
            element[attribute] = scriptObject[attribute];
        }
        element.onload = this.loadNextScript.bind(this);
        document.head.append(element);
    }

    SequentialLoader.prototype.loadNextScript = function() {
        this.throwErrorIfErrorDetected();
        document.dispatchEvent(this.resourceLoadedEvent);
        if (this.nextScript < this.scripts.length) {
            this.loadScript(this.scripts[this.nextScript]);
        } else {
            this.allScriptsLoaded = true;
            document.dispatchEvent(this.scriptsLoadedEvent);
            return;
        }
        this.nextScript++;
    }

    SequentialLoader.prototype.beginScriptLoading = function() {
        this.throwErrorIfErrorDetected();
        this.loadScript(this.scripts[this.nextScript]);
        this.nextScript++;
    }

    SequentialLoader.prototype.initSylesheetLoading = function(stylesheetsArray) {
        if (!this.isArray(stylesheetsArray)) {
            throw new Error("Stylesheets must be an array!");
        }
        if (this.isEmptyArray(stylesheetsArray)) {
            throw new Error("Stylesheets array cannot be empty!");
        }
        this.stylesheets = stylesheetsArray;
    }

    SequentialLoader.prototype.initScriptLoading = function(scriptsArray) {
        if (!this.isArray(scriptsArray)) {
            throw new Error("Scripts must be an array!");
        }
        if (this.isEmptyArray(scriptsArray)) {
            throw new Error("scripts array cannot be empty!");
        }
        this.scripts = scriptsArray;
    }

    SequentialLoader.prototype.initFontLoading = function(fontsArray) {
        if (!this.isArray(fontsArray)) {
            throw new Error("Fonts must be an array!");
        }
        if (this.isEmptyArray(fontsArray)) {
            throw new Error("Fonts array cannot be empty!");
        }
        for (let i=0; i<fontsArray.length; i++) {
            if (!this.isObject(fontsArray[i])) {
                throw new Error('Invalid font object!');
            }
        }
        this.fonts = fontsArray;
    }

    SequentialLoader.prototype.processBatch = function() {
        if (this.nextBatch < this.batchOrder.length) {
            if (this.batchOrder[this.nextBatch] === 'fonts') {
                this.beginFontLoading();
            } else if (this.batchOrder[this.nextBatch] === 'stylesheets') {
                this.beginStylesheetLoading();
            } else if (this.batchOrder[this.nextBatch] === 'scripts') {
                this.beginScriptLoading();
            } else {
                throw new Error(`Invalid resource type '${item}'`);
            }
        } else {
            document.dispatchEvent(this.allResourcesLoadedEvent);
            return;
        }
        this.nextBatch++;
    }

    SequentialLoader.prototype.initEventHandlers = function() {
        if (this._debug) {
            document.addEventListener(this.allResourcesLoadedEvent.type, function() {
                console.log('Sequential loading of all application resources completed.');
            });
            document.addEventListener(this.fontsLoadedEvent.type, function() {
                console.log('Finished loading all fonts.');
            });
            document.addEventListener(this.stylesheetsLoadedEvent.type, function() {
                console.log('Finished loading all stylesheets.');
            });
            document.addEventListener(this.scriptsLoadedEvent.type, function() {
                console.log('Finished loading all scripts.');
            });
        }
        document.addEventListener(this.allResourcesInitialisedEvent.type, this.processBatch.bind(this));
        document.addEventListener(this.fontsLoadedEvent.type, this.processBatch.bind(this));
        document.addEventListener(this.stylesheetsLoadedEvent.type, this.processBatch.bind(this));
        document.addEventListener(this.scriptsLoadedEvent.type, this.processBatch.bind(this));
        window.addEventListener('error', this.detectError.bind(this));

    }

    SequentialLoader.prototype.initLoading = function() {
        if (this.url === '' || this.url === undefined) {
            throw new Error('Resource list file path is not defined!');
        }
        if (!(this.url.endsWith('.json'))) {
            throw new Error('Resource list file path must point to a json document!');
        }
        this.initEventHandlers();
        fetch(this.url).then(function(response) {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error("Could not load resource list file.");
            }
        }).then(function(data) {
            if (this.isJSONString(data)) {
                var resources = JSON.parse(data);
                if (resources.fonts === undefined && resources.stylesheets === undefined && resources.scripts === undefined) {
                    throw new Error(`seqentialLoader could not find any resource to load.`);
                }
                if (resources.order === undefined) {
                    var order = Object.keys(resources);
                    this.batchOrder = order;
                } else {
                    this.batchOrder = resources.order;
                }
                this.batchOrder.forEach(function(item) {
                    if (item === 'fonts') {
                        this.initFontLoading(resources['fonts']);
                        this.resourceCount += this.fonts.length;
                    } else if (item === 'stylesheets') {
                        this.initSylesheetLoading(resources['stylesheets']);
                        this.resourceCount += this.stylesheets.length;
                    } else if (item === 'scripts') {
                        this.initScriptLoading(resources['scripts']);
                        this.resourceCount += this.scripts.length;
                    } else {
                        throw new Error(`Invalid resource type '${item}'`);
                    }
                }.bind(this));
                document.dispatchEvent(this.allResourcesInitialisedEvent);
            } else {
                throw new Error("Content of resources file does not contain a valid json text.");
            }
        }.bind(this));
    }

    window.sequentialLoader = new SequentialLoader(document.currentScript.dataset.slResources, ((document.currentScript.dataset.slDebug === 'true') ? true : false));
    window.sequentialLoader.initLoading();
})();