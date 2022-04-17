
<p align="center">
   <img src="https://img.shields.io/npm/dt/memer-api?style=for-the-badge">
   <img src="https://img.shields.io/github/stars/Yash094/Memer-API.svg?style=for-the-badge">
   <img src="https://img.shields.io/github/issues/Yash094/Memer-API.svg?style=for-the-badge">
   <img src="https://img.shields.io/npm/v/memer-api?style=for-the-badge">
   <img src="https://img.shields.io/github/license/Yash094/Memer-API.svg?style=for-the-badge">
</p>   

<!-- PROJECT LOGO -->
<br />
     <p align="center"> <a href="https://www.buymeacoffee.com/memerapi" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="40" width="180"></a></p>
<p align="center">

<p align="center"><a href="https://memer-api.js.org/"><img align="center" style="width:0.5px" src="https://cdn.discordapp.com/attachments/801132434283954199/881571725106618428/memer_api.png"/> </a></p><br/>

  <p align="center">
    <strong> An awesome module that allows you to manipulate images very easily, based on <a href="https://memer-api.live"> Memer API </a></strong>
    <br />
    <a href="https://memer-api.js.org"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://memer-api.js.org">Wrapper Docs</a>
    ·
    <a href="https://memer-api.live">API Docs</a>
    ·
    <a href="https://github.com/Yash094/Memer-API/issues">Report Bug</a>
    ·
    <a href="https://memer-api.live/discord">Discord</a>
  </p>
</p>


<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
      </ul>
    </li>
    <li>
     <a href="#installation">Installation</a>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#ratelimits">Rate Limits</a>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#credits">Credits</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]]()

There are many great image API's available on internet, however, I didn't find one that really suit my needs so I created this enhanced one. I want to create the API so amazing that it'll be the last one you ever need for image manipulation

Here's why:
* Easy to use
* Fast & Easy Support
* Well Documented
* Frequently updated





### Installation

1. Get a free API Key at our [Discord Server.](https://memer-api.live/discord)
2. Install the package
   ```sh
   npm install memer-api@latest
   ```
3. Enter your API
```JS
const Meme = require("memer-api");
const memer = new Meme('Your Cool API Key');  // From Memer API Server :)
memer.<Method>(<Options>); //returns -> Promise -> <Buffer>
```



<!-- USAGE EXAMPLES -->
## Usage

```JS
const Meme = require("memer-api")
const Discord = require("discord.js")
cosnt memer = new Meme('Your Cool API Token'); // From Memer API Server :)

const avatar = "https://imgur.com/I5DmdNR.png"; // Only static images are supported :)
const text = "Memer API is awesome!"

memer.youtube(avatar, 'Memer Api', text).then(image => {
    // This gives you a 'Buffer', for Discord to create an attachment
    
    var attachment = new Discord.MessageAttachment(image, "youtube.png");
    <channel>.send(attachment)
})
```
_For more examples, please refer to the [Documentation](https://memer-api.js.org)_


<!-- limits -->
## Ratelimits
Memer API limits each Request for 5 seconds i.e you can request 1 image every 5 seconds.
If you want to remove the limit you can get premium [Here](https://memer-api.live/premium)

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/Yash094/Memer-API/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the CC-BY-NC-ND 4.0 License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Yash - hello@memer-api.live

Project Link: [https://github.com/Yash094/Memer-API](https://github.com/Yash094/Memer-API)



<!-- Credits -->
## Credits
* [Base Images](https://github.com/DankMemer/imgen)
* [Wrapper base](https://github.com/DevSnowflake/dankmemer.js#readme)




<!-- MARKDOWN LINKS & IMAGES -->

[license-shield]: https://img.shields.io/github/license/Yash094/Memer-API.svg?style=for-the-badge
[license-url]: https://github.com/Yash094/Memer-API/blob/master/LICENSE.txt
[product-screenshot]: https://camo.githubusercontent.com/ad3c11a758f25c906f2eb2aa0283c467ba3a26ef837be2605ec8e427b6a0c42e/68747470733a2f2f63646e2e646973636f72646170702e636f6d2f6174746163686d656e74732f3830363735303835333934373731393736302f3834333537393031393832333534363336382f6d656d65722d6170695f707265766965772e706e67
