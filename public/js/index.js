"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { ipcRenderer } = require('electron/renderer');
const warp_1 = require("./warp");
const shell_exec_1 = require("./shell_exec");
const cash_dom_1 = __importDefault(require("cash-dom"));
(0, cash_dom_1.default)(() => {
    warp_1.Warp.getVersion().then((version) => (0, cash_dom_1.default)('#warp-version').text(version));
    let prevStats = ['', '', '', ''];
    ipcRenderer.invoke('update-tray', false);
    ipcRenderer.on('disconnect', () => {
        warp_1.Warp.disconnect();
        ipcRenderer.invoke('update-tray', false);
    });
    ipcRenderer.on('connect', () => {
        warp_1.Warp.connect();
        ipcRenderer.invoke('update-tray', false);
    });
    ipcRenderer.on('show-about-refer', () => ipcRenderer.invoke('show-about'));
    ipcRenderer.on('update-tray-refer', () => prevStats[0] = '-');
    setInterval(() => {
        if ((0, cash_dom_1.default)('#turn-warp').attr('enabled') == 'true') {
            warp_1.Warp.getStatistics().then((stats) => {
                if (typeof stats == 'object' && (stats.sent != prevStats[0] || stats.received != prevStats[1] || stats.latency != prevStats[2] || stats.loss != prevStats[3])) {
                    (0, cash_dom_1.default)('#sent').text(stats.sent);
                    (0, cash_dom_1.default)('#received').text(stats.received);
                    (0, cash_dom_1.default)('#connection-stats-further').css('width', '160px');
                    (0, cash_dom_1.default)('#connection-stats-further').html(`Sent: ${stats.sent}<br>Received: ${stats.received}<br>Latency: ${stats.latency}<br>Loss: ${stats.loss}`);
                    ipcRenderer.invoke('update-tray', true, stats.sent, stats.received, stats.latency, stats.loss);
                    prevStats = [stats.sent, stats.received, stats.latency, stats.loss];
                }
            });
        }
        else if (prevStats[0] !== '') {
            ipcRenderer.invoke('update-tray', false);
            prevStats[0] = '';
        }
    }, 1000);
    warp_1.Warp.getStatus().then((status) => {
        if (status) {
            let button = (0, cash_dom_1.default)('#turn-warp');
            (0, cash_dom_1.default)('#comet-cold').css('display', 'none');
            (0, cash_dom_1.default)('#comet-hot').css('display', 'block');
            (0, cash_dom_1.default)('#warp-title').removeClass('gradient-cold');
            (0, cash_dom_1.default)('#warp-title').addClass('gradient-hot');
            (0, cash_dom_1.default)('#connection-stats').css('display', 'block');
            button.removeClass('gradient-cold');
            button.addClass('gradient-hot');
            button.text('Turn off WARP');
            button.attr('enabled', 'true');
        }
    });
    (0, cash_dom_1.default)('.comet').on('click', () => ipcRenderer.invoke('show-about'));
    (0, cash_dom_1.default)('#turn-warp').on('click', () => __awaiter(void 0, void 0, void 0, function* () {
        if ((0, cash_dom_1.default)('#turn-warp').attr('enabled') == 'false') {
            if (yield warp_1.Warp.isServiceActive())
                warp_1.Warp.connect().catch((error) => alert(error));
            else
                (0, shell_exec_1.shell_exec)('systemctl start warp-svc.service');
        }
        else
            warp_1.Warp.disconnect().catch((error) => alert(error));
    }));
});
