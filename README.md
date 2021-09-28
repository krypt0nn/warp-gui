<p align="center">This project was archived because WARP was partially blocked in Russia</p>

<br>

<h1 align="center">Cloudflare WARP GUI for Linux</h1>

<p align="center"><img src="https://i.ibb.co/H2SryLH/Screenshot-from-2021-09-14-22-13-41.png"></p>

<p align="center">This is unofficial GUI client for Cloudflare WARP. Now we don't have official one</p>

<br>

# Installation

Now this program is available only in portable binary form. Flatpak support will be added in a future

To download and run this program you should go to the [Releases](https://github.com/krypt0nn/warp-gui/releases) section and download `Cloudflare.WARP-linux-x64.zip` archive from the last release

Then, unpack this archive somewhere you want and run the `Cloudflare WARP` file

To work this program requires `cloudflare-warp-bin` AUR package

## Building from source

```sh
git clone https://github.com/krypt0nn/warp-gui
cd warp-gui
npm i
npm run build:linux
```

Requires `node` package to be installed. Release folder will be stored in `dist` folder

## Running from source

```sh
git clone https://github.com/krypt0nn/warp-gui
cd warp-gui
npm i
npm start
```

Requires `node` package to be installed. Release folder will be stored in `dist` folder

<br>

Author: [Nikita Podvirnyy](https://vk.com/technomindlp)
