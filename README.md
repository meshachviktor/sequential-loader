# About SequentialLoader
SequentialLoader helps to load necessary static website resources like javascript files, stylesheets and fonts sequentially, in any order you want, in a single line of HTML markup.
All you need to do is point SequentialLoader to the json file containing the links to the resources you want to load on your website.

SequentialLoader makes building a website a little easier by offering the following advantages:
- Reduce or totally eliminate clutter in the `<head>` tag of your html code.
- Load different types of static resources (css, js and, fonts if you choose to load them without the aid of css file) one after another if for some reason your application requires it that way.
- With some extra coding, you can implement a loading screen with an accurate progress bar by listening for the completion events emitted by the library.

# Usage

## Loading SequentialLoader
Include SequentialLoader in your html as displayed below
```html
<script data-sl-resources="/path/to/sl.resources.json" src="/path/to/sequential-loader.js" defer></script>
```
The name of the json file in the `data-sl-resources` attribute can be anything you want. The library is self-executing and needs no interaction from the programmer to 
do its work.

## The resource list file
```json
{
    
    "scripts": [
        {
            "src":  "/path/to/script1.js"
        },
        {
            "src":  "/path/to/script2.js"
        }
    ],

    "stylesheets": [
        {
            "href": "/path/to/style1.css"
        },
        {
            "href": "/path/to/style2.css"
        }        
    ],

    "fonts": [
        {
            "family": "Poppins", "source": "url(/path/to/fonts/pxiGyp8kv8JHgFVrLPTucHtA.woff2)",
            "descriptors": {
                "weight": "100",
                "style": "normal",
                "display": "swap",
                "unicodeRange": "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
            }
        },
        {
            "family": "Poppins", "source": "url(/path/to/fonts/pxiByp8kv8JHgFVrLFj_Z1xlFQ.woff2)",
            "descriptors": {
                "weight": "200",
                "style": "normal",
                "display": "swap",
                "unicodeRange": "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
            }
        }
    ],

    "order": ["fonts", "stylesheets", "scripts"]
}
```
As seen above the resource list file must be a valid json document. In the document you can add one of, two of or all of the three types of resources supported by
SequentialLoader. At the root level, there are four supported properties: `stylesheets`, `fonts`, `scripts` and `order`. Each of the properties holds a json array. 
Except the `order` property which holds an array of strings, the other properties hold an array of objects matching JavaScript's implementation of the object type.
For example when loading scripts you can add other properties like `crossOrigin` and `defer` as required making a script object look like:

```json
{
    "src":  "/path/to/script1.js",
    "crossOrigin": "anonymous",
    "defer": true
}
```
## Loading order
The `order` property lets you specify the order in which you want the group of resources listed in the resource list file to be loaded. In the example above it is specified as 
`["fonts", "stylesheets", "scripts"]`. This means the fonts defined in the `fonts` property will be loaded first followed by the stylesheets defined in the 
`stylesheets` property and finally followed by the the scripts defined in the `scripts` property. The `order` property is optional, and if not defined, changes
the order in which each group of resources are loaded. In this case the loading is done in the order in which the resource group property appears in the file. Following the
example above the scripts defined in the `scripts` property will be loaded first followed by the stylesheets defined in the `stylesheets` property, and lastly,
the fonts defined in the `fonts` property.

## Supported file types
JavaScript files, CSS files and Font files.

## A note on loading font files
It is not necessary to load font files using SequentialLoader. You can easily add a stylesheet file that does that on its own to the array of `stylesheets` object.
However, doing this means you will not be able to track the loading of each font which is not really a problem.

## SequentialLoader events
SequentialLoader emmits five events, four of which are should be known to the programmer.
- `sl.fontsloaded` event
- `sl.stylesheetsloaded` event
- `sl.scriptsloaded` event
- `sl.allresourcesloaded` event

All of these events are dispatched to the DOM.
The `sl.fontsloaded` event is fired when all fonts have finished loading.
The `sl.stylesheetsloaded` event is fired when all stylesheets have finished loading.
The `sl.scriptsloaded` event is fired when all scripts have finished loading.
The `sl.allresourcesloaded` event is fired when all the resources (above) have finished loading. This event is the last event fired by SequentialLoader.

## License
MIT




