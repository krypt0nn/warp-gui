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
exports.Warp = void 0;
const shell_exec_1 = require("./shell_exec");
const cash_dom_1 = __importDefault(require("cash-dom"));
class Warp {
    static getVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                (0, shell_exec_1.shell_exec)('warp-cli --version', (output) => resolve(output), (error) => reject(error));
            });
        });
    }
    static getStatistics() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                (0, shell_exec_1.shell_exec)('warp-cli warp-stats', (output) => {
                    let lines = output.split('\n'), bandwith = lines[2].split('; ');
                    resolve({
                        sent: bandwith[0].substr(6),
                        received: bandwith[1].substr(10),
                        latency: lines[3].substr(19),
                        loss: lines[4].substr(16, lines[4].length - 17)
                    });
                }, (error) => reject(error));
            });
        });
    }
    static getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                (0, shell_exec_1.shell_exec)('warp-cli status', (status) => resolve(!(status.substr(-12) == 'Disconnected')), (error) => reject(error));
            });
        });
    }
    static isServiceActive() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                (0, shell_exec_1.shell_exec)('systemctl status warp-svc.service | grep Active:', (status) => {
                    resolve(!(status.substr(8, 8) == 'inactive'));
                });
            });
        });
    }
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let button = (0, cash_dom_1.default)('#turn-warp');
                if (button.attr('first-run') == 'true')
                    (0, shell_exec_1.shell_exec)('warp-cli register', () => button.attr('first-run', 'false'));
                (0, shell_exec_1.shell_exec)('warp-cli connect', (status) => {
                    if (status.substr(0, 7) == 'Success') {
                        (0, cash_dom_1.default)('#comet-cold').css('display', 'none');
                        (0, cash_dom_1.default)('#comet-hot').css('display', 'block');
                        (0, cash_dom_1.default)('#warp-title').removeClass('gradient-cold');
                        (0, cash_dom_1.default)('#warp-title').addClass('gradient-hot');
                        (0, cash_dom_1.default)('#connection-stats').css('display', 'block');
                        button.removeClass('gradient-cold');
                        button.addClass('gradient-hot');
                        button.text('Turn off WARP');
                        button.attr('enabled', 'true');
                        resolve(true);
                    }
                    else
                        reject(status);
                });
            });
        });
    }
    static disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let button = (0, cash_dom_1.default)('#turn-warp');
                (0, shell_exec_1.shell_exec)('warp-cli disconnect', (status) => {
                    if (status.substr(0, 7) == 'Success') {
                        (0, cash_dom_1.default)('#connection-stats-further').css('width', '0');
                        (0, cash_dom_1.default)('#comet-cold').css('display', 'block');
                        (0, cash_dom_1.default)('#comet-hot').css('display', 'none');
                        (0, cash_dom_1.default)('#warp-title').removeClass('gradient-hot');
                        (0, cash_dom_1.default)('#warp-title').addClass('gradient-cold');
                        (0, cash_dom_1.default)('#connection-stats').css('display', 'none');
                        button.removeClass('gradient-hot');
                        button.addClass('gradient-cold');
                        button.text('Turn on WARP');
                        button.attr('enabled', 'false');
                        resolve(true);
                    }
                    else
                        reject(status);
                });
            });
        });
    }
}
exports.Warp = Warp;
