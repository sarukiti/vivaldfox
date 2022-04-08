/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

var createData = {
    type: "popup",
    url: "backgrounds/quickCommand.html",
    width: 640,
    height: 400,
    left: parseInt((screen.width-640)/2),
    top: parseInt((screen.height-400)/2)
};

browser.runtime.onMessage.addListener(() => browser.windows.create(createData));
browser.browserAction.onClicked.addListener(()=>browser.windows.create(createData));