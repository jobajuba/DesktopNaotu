import { remote } from "electron";
import { I18n } from "../core/i18n";
import { naotuBase } from "./base";
import { copy, writeText, writeBuffer } from "../core/io";
import execAsync from "../core/exec";
import { logger } from "../core/logger";
import { hasData, initRoot } from "./minder";
import { sIndexUrl } from "../define";
import { getUserDataDir } from "../core/path";
import { join } from "path";
import { naotuConf } from "../core/conf";
import { getAppInstance } from "./electron";

//#region 3. 窗口对话框相关

/**
 * 新建文件
 */
export function newDialog() {
  //
}

/**
 * 关闭文件
 */
export function closeFile() {
  logger.info(`关闭文件: "${naotuBase.getCurrentFilePath()}"`);

  if (hasData()) {
    bootbox.confirm({
      // TODO,
      message: I18n.__("sNewKm"),
      callback: (result: any) => {
        if (result) {
          initRoot();
        }
      }
    });
  } else {
    initRoot();
  }
}

/**
 * 生成副本
 */
export function cloneFile() {
  // 创建一个新文件，并在新窗口打开它
  let srcPath = naotuBase.getCurrentFilePath();
  if (srcPath) {
    let dstKmPath = naotuBase.getDefaultPath(); // 生成一个文件的地址
    copy(srcPath, dstKmPath); // 复制一份

    // 获取当前执行程序的路径
    let appPath = process.execPath;
    let command = "";

    switch (process.platform) {
      case "win32":
        command = "start " + appPath;
        break;
      case "darwin":
        // TODO： 待验证
        command = appPath;
        break;
      default:
      case "linux":
        // TODO： 待验证
        command = appPath;
        break;
    }

    // 执行打开该文件的命令
    execAsync(command, dstKmPath)
      .then(output => {
        logger.info(output);
      })
      .catch(err => {
        logger.error("asyncExec err: ", err);
      });
  } else {
    new Error("No files are currently open.");
  }
}

/**
 * 打开新窗口
 */
export function openWindow() {
  let newWin: Electron.BrowserWindow | null;

  newWin = new remote.BrowserWindow({
    minWidth: 700,
    minHeight: 700,
    width: 1000,
    height: 800,

    fullscreenable: true,
    show: false,
    backgroundColor: "#fbfbfb"
  });

  newWin.on("close", function() {
    if (newWin) newWin = null;
  });

  logger.info(`open new window '${sIndexUrl}' `);

  newWin.loadURL(sIndexUrl);
  newWin.show();
}

/**
 * 在文件夹中打开文件
 */
export function openFileInFolder() {
  let path = naotuBase.getCurrentFilePath();
  if (path) {
    remote.shell.showItemInFolder(path);
  } else {
    bootbox.alert(I18n.__("sNoOpenFile"));
  }
}

// inner function.
export function exportFile(protocol: any, filename: string) {
  let options = {
    download: true,
    filename: filename
  };

  minder.exportData(protocol.name, options).then(function(data: any) {
    switch (protocol.dataType) {
      case "text":
        writeText(filename, data);
        break;
      case "base64":
        let base64Data = data.replace(/^data:image\/\w+;base64,/, "");
        let dataBuffer = new Buffer(base64Data, "base64");

        writeBuffer(filename, dataBuffer);
        break;
      case "blob":
        break;
    }

    return null;
  });
}

//#endregion

export function maxwin() {
  let appInstance = getAppInstance();
  if (appInstance) {
    appInstance.maximize();
  }
}

export function minwin() {
  let appInstance = getAppInstance();
  if (appInstance) {
    appInstance.minimize();
  }
}