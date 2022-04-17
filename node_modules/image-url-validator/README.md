[![NPM version](https://img.shields.io/npm/v/image-url-validator.svg)](https://www.npmjs.com/package/image-url-validator)
[![Build Status](https://travis-ci.com/BhanukaUOM/Image-Url-Validator.svg?branch=master)](https://travis-ci.com/BhanukaUOM/Image-Url-Validator)
[![Downloads](https://img.shields.io/npm/dm/image-url-validator.svg)](https://npmcharts.com/compare/image-url-validator?minimal=true)
![NPM](https://img.shields.io/npm/l/image-url-validator)

# image-url-validator

Check if a url is an image

Checks asynchronously whether an image URL is valid or not with using HTTP HEAD.


## Install

```
$ npm install --save image-url-validator
```


## Usage

### JavaScript
```js
const isImageURL = require('image-url-validator').default;

// Promise
isImageURL('https://via.placeholder.com/300/09f/fff.png').then(is_image => {
    console.log(is_image) //=> true
});

isImageURL('https://github.com/BhanukaUOM/Image-Url-Validator').then(is_image => {
    console.log(is_image) //=> false
});

// Sync/Await
await isImageURL('https://via.placeholder.com/300/09f/fff.png'); //=> true

await isImageURL('https://github.com/BhanukaUOM/Image-Url-Validator'); //=> false
```


### ES6
```js
import isImageURL from 'image-url-validator';

// Promise
isImageURL('https://via.placeholder.com/300/09f/fff.png').then(is_image => {
    console.log(is_image) //=> true
});

isImageURL('https://github.com/BhanukaUOM/Image-Url-Validator').then(is_image => {
    console.log(is_image) //=> false
});

// Sync/Await
await isImageURL('https://via.placeholder.com/300/09f/fff.png'); //=> true

await isImageURL('https://github.com/BhanukaUOM/Image-Url-Validator'); //=> false
```

## Release Notes

> #### v1.0.1
> 
> -  Added ES6 Support
>
>
> #### v0.2.0
> 
> -  Added ES5 Support
>
>
> #### v0.0.1
> 
> -  Initial Release
>


## License

Licensed under The MIT License (MIT)