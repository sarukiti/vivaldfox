/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

function writeCurrentTabToPage(list){
    $(".tab").remove();
    if(list.length > 0){
        let dom = "<tr class='header tab'><td>Tab</td><td></td><td></td></tr>";
        list.forEach(tabs => 
        dom += `<tr class="tab"><td id='text'>${tabs.title}</td><td>${tabs.url}</td><td>${tabs.id}</td></tr>`
        );
        $("#qcTable").append(dom);
    }
}

function writeBookmarkToPage(list){
    $(".bookmark").remove();
    if(list.length > 0){
        let dom = "<tr class='header bookmark'><td>Bookmark</td><td></td><td></td></tr>";
        list.forEach(bookmark => 
            dom += `<tr class="bookmark"><td id='text'>${bookmark.title}</td><td>${bookmark.url}</td><td></td></tr>`
        );
        $("#qcTable").append(dom);
    }
}

function writeHistoryToPage(list){
    $(".history").remove();
    if(list.length > 0){
        let dom = "<tr class='header history'><td>History</td><td></td><td></td></tr>";
        list.forEach(history => 
            dom += `<tr class="history"><td id='text'>${history.title}</td><td>${history.url}</td><td></td></tr>`
        );
        $("#qcTable").append(dom);
    }
}

function updateValue(e){
    //入力欄に何か入っている場合
    if(e.target.value){
        //検索表示周り
        if (typeof searchTrigger === "undefined") searchTrigger = true;
        if(searchTrigger){
            $("#qcTable").prepend(`<tr class="search"><td>${defaultEngine.name}で「${e.target.value}」を検索する</td><td>${e.target.value}</td><td></td></tr>`);
            $(".selected").removeClass('selected');
            $(".search").addClass("selected");
            searchTrigger = false;
        }
        $(".search td").eq(0).text(`${defaultEngine.name}で「${e.target.value}」を検索する`);
        $(".search td").eq(1).text(e.target.value);

        //URL表示周り
        if (typeof urlTrigger === "undefined") urlTrigger = true;
        if(/.+\.\w+/.test(e.target.value)){
            if(urlTrigger){
                $("#qcTable").prepend(`<tr class="url"><td>URL「${e.target.value}」を開く</td><td>${e.target.value}</td><td></td></tr>`);
                $(".selected").removeClass('selected')
                $(".url").addClass("selected");
                urlTrigger = false;
            }
            $(".url td").eq(0).text(`URL「${e.target.value}」を開く`);
            $(".url td").eq(1).text(e.target.value);
        }else{
            $(".url").remove();
            urlTrigger = true;
        }


        query = e.target.value.toLowerCase();
        function filterQuery(element){
            return element.title.toLowerCase().includes(query) || element.url.toLowerCase().includes(e.target.value.toLowerCase(query))
        }
        //タブ表示更新周り
        filteredTabList = currentTabList.filter(filterQuery);
        writeCurrentTabToPage(filteredTabList);
        //ブクマ表示更新周り
        filteredBookmarkList = bookmarkList.filter(filterQuery);
        writeBookmarkToPage(filteredBookmarkList);
        //履歴表示更新周り
        filteredHistoryList = historyList.filter(filterQuery);
        writeHistoryToPage(filteredHistoryList);
    }else{
        //URL表示を消去
        $(".url").remove();
        urlTrigger = true;
        //検索表示を消去
        $(".search").remove();
        searchTrigger = true;
        //タブ・ブクマ表示を更新
        writeCurrentTabToPage(currentTabList);
        writeBookmarkToPage(bookmarkList.slice(0,10));
        writeHistoryToPage(historyList.slice(0,10));
    }
}

function updateKeydown(e) {
    switch (e.key) {
        case "ArrowUp":
            $('#qcTable tbody tr.selected')
                .removeClass('selected')
                .prevAll("tr:not(.header):first").addClass('selected');
            if(!$("tr").hasClass("selected")) $("tr:last").addClass("selected");
            selectTop = $('.selected').offset().top;
            $("html").animate({scrollTop: selectTop - 300}, 10);
            break;
    
        case "ArrowDown":
            $('#qcTable tbody tr.selected')
                .removeClass('selected')
                .nextAll("tr:not(.header):first").addClass('selected');
            if(!$("tr").hasClass("selected")) $("tr:not(.header):first").addClass("selected");
            selectTop = $('.selected').offset().top;
            $("html").animate({scrollTop: selectTop - 300}, 10);
            break;
        case "Enter":
            let selected = $(".selected");
            let sel_td = $(".selected td");
            if(selected.hasClass("search")){
                browser.search.search({query: sel_td.eq(1).text()})
                window.close();
            }
            else if(selected.hasClass("url")){
                if(/:\/\//.test(sel_td.text())) browser.tabs.create({"url": sel_td.eq(1).text()});
                else browser.tabs.create({"url": `https://${sel_td.eq(1).text()}`})
                window.close();
            }
            else if(selected.hasClass("tab")){
                browser.tabs.update(parseInt(sel_td.eq(2).text(),10),{active: true})
                window.close();
            }
            else if(selected.hasClass("bookmark") || selected.hasClass("history")){
                browser.tabs.create({"url": sel_td.eq(1).text()});
                window.close();
            }
            break;
    }
}

async function main(){
    //検索エンジンについての情報を取得
    searchEngineInfo = await browser.search.get();
    defaultEngine = searchEngineInfo.find(engine => engine.isDefault);
    
    //現在のタブについての情報を取得、表示
    currentTabList = await browser.tabs.query({});
    currentTabList.pop();
    writeCurrentTabToPage(currentTabList);
    
    //ブックマークについての情報を取得、表示
    bookmarkList = await browser.bookmarks.search({});
    bookmarkList = bookmarkList.filter(element => typeof element.url !== "undefined")
    writeBookmarkToPage(bookmarkList.slice(0,10));

    //履歴についての情報を取得、表示
    historyList = await browser.history.search({"text": ""})
    writeHistoryToPage(historyList.slice(0,10));

    //入力欄に自動フォーカス
    document.getElementById('qcInput').focus();
    
    const input = document.getElementById('qcInput'); //入力欄の要素を取得
    input.addEventListener('input', updateValue); //inputに変更が発生したときupdateValueコールバックを呼ぶ
    input.addEventListener('keydown', updateKeydown); //inputがフォーカスされている時のkeydownを検出してupdateKeydownコールバックを呼ぶ

    document.onkeydown = function(e) {
        if(e.key === "Escape") window.close();
    }
}

main()