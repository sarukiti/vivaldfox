/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

window.addEventListener("keydown", (e)=>{
  if(e.key == "F2") browser.runtime.sendMessage({"message":"pressed F2 key so open QuickCommand"});
});