//background.js用以監管網頁事件

//在安裝時初始化extension
chrome.runtime.onInstalled.addListener(function(){

    chrome.storage.sync.set({ is_night: false ,sayings:[{id:0,time:new Date().getTime(),value:'Hello World!'}]}, function () {
        console.log('The night is set.');
    });

    //page action的規則需在此註冊,用以在特定url啟動
    //先移除規則
    chrome.declarativeContent.onPageChanged.removeRules(undefined,function(){
        //註冊新規則
        chrome.declarativeContent.onPageChanged.addRules([
            {
                //在特定url啟動extension
                conditions:[
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl:{urlContains:'chrome://newtab'}
                    })
                ],
                actions:[new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });   
});

