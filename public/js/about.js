"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require('electron').shell;
const cash_dom_1 = __importDefault(require("cash-dom"));
(0, cash_dom_1.default)(() => {
    (0, cash_dom_1.default)('a[href]').on('click', (e) => {
        e.preventDefault();
        shell.openExternal(e.path[0].getAttribute('href'));
    });
});
