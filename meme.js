window.onload = function () {
    window.saying_instance = new SayingCenter();

    window.saying_instance.GetSayings();

    window.saying_instance.GetConfig(function (is_night) {        
        is_night ?document.getElementById('main_switch').click():'';
    });

    //首頁快速編輯
    document.getElementById('btn_quick_sqve').onclick = function (e) {
        e.preventDefault();
        let ipt = document.getElementById('saying');

        let id = parseInt(ipt.getAttribute('data-id'));

        let value = ipt.value;

        window.saying_instance.QuickEditSaying(id, value, ipt);
    };

    //menu點擊事件
    document.getElementById('menu').onclick = function (e) {
        let slider = document.getElementById('slider');
        slider.style.left = 0;

        this.style.display = 'none';

        let option_items = document.getElementsByClassName('option_items');

        //顯示選單
        for (let i = 0; i < option_items.length; i++) {
            option_items[i].style.visibility = 'visible';
        }

        let main_items = document.getElementsByClassName('main_items');

        //隱藏首頁項目
        for (let i = 0; i < main_items.length; i++) {
            main_items[i].style.visibility = 'hidden';
        }
    };

    //回到首頁點擊事件
    document.getElementById('return').onclick = function (e) {
        let slider = document.getElementById('slider');
        slider.style.left = '30vw';

        document.getElementById('menu').style.display = 'block';

        let option_items = document.getElementsByClassName('option_items');

        //隱藏選單
        for (let i = 0; i < option_items.length; i++) {
            option_items[i].style.visibility = 'hidden';
        }

        let main_items = document.getElementsByClassName('main_items');

        //顯示首頁
        for (let i = 0; i < main_items.length; i++) {
            main_items[i].style.visibility = 'visible';
        }
    };

    //新增文字
    document.getElementById('btn_create').onclick = function (e) {
        if (this.classList.contains('enabled')) {
            let value = document.getElementById('new_quote').value;
            value = value.trim();

            if (value) {
                value = value.toString();
                window.saying_instance.CreateSaying(value);
            }
            document.getElementById('new_quote').value = '';
        }
    };

    //於input直接按下enter,等同按下新增按鈕
    document.getElementById('new_quote').addEventListener('keyup', function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            document.getElementById('btn_create').click();
        }
    });

    //Load more事件
    document.getElementById('btn_load').onclick = function (e) {
        window.saying_instance.AppendSayings(window.saying_instance.Sayings.lastIndex);
    };

    document.getElementById('saying').onkeyup = function (e) {
        window.saying_instance.SetTitle(parseInt(this.getAttribute('data-id')), this.value);
    };

    document.querySelectorAll('.switch>input').forEach(e => {
        e.onclick = function (event) {
            SetSwitch(this,function(is_night){
                if(is_night){
                    window.saying_instance.SetNight();
                }else{
                    window.saying_instance.SetDay();
                }
            });
        };
    });


    //document.getElementById('menu').click();
}

function SayingCenter() {
    //config項目
    this.Config = {
        is_night: false
    };

    //文字資料
    this.Sayings = {
        data: null,
        lastIndex: 0
    };

    //取得文字
    this.GetSayings = function () {
        let ins = this;
        let title = 'If you change nothing,nothing will change.';
        let id = 'N';

        chrome.storage.sync.get('sayings', function (data) {
            ins.Sayings.data = data.sayings;

            if (ins.Sayings.data.length > 0) {

                let choosen_num = Math.floor(Math.random() * ins.Sayings.data.length);

                title = ins.Sayings.data[choosen_num].value;
                id = ins.Sayings.data[choosen_num].id;

                //將取得的文字apped至option選單
                ins.AppendSayings();
            }
            else {
                document.getElementById('saying_container').innerHTML = '';
            }

            //設定首頁input
            ins.SetTitle(id, title);
        });
    };

    //設定首頁input
    this.SetTitle = function (id, data) {
        //先將input高度,寬度歸0
        let ipt = document.getElementById('saying');
        ipt.style.height = '0px';
        ipt.setAttribute('cols', 0);

        //綁入內容
        ipt.value = data;
        ipt.setAttribute('data-id', id);
        ipt.style.height = `${ipt.scrollHeight}px`;
        ipt.setAttribute('cols', data.length + 1);
    };

    //將文字append至option選單
    this.AppendSayings = function (lastIndex = null) {
        let ins = this;

        let container = document.getElementById('saying_container');
        container.innerHTML = '';

        let data = null;
        //以新增時間排序(新到舊),取前5筆
        if (lastIndex) {
            data = ins.Sayings.data.filter(d => d.id < lastIndex).sort((a, b) => { return a.time > b.time ? -1 : 1 }).slice(0, 5);
        } else {
            data = ins.Sayings.data.sort((a, b) => { return a.time > b.time ? -1 : 1 }).slice(0, 5);
        }

        data.forEach(e => {
            let dom = document.createElement('div');
            dom.classList.add('quote_item');
            dom.innerHTML = `
            <input data-id='${e.id}' disabled class="quote_saying" type='text' value='${e.value}'>
            <div class="quote_btns">
                <a href='#' class="btn_save" data-id='${e.id}'>
                    <i class="fas fa-save"></i>
                </a>
                <a href="#" class="btn_edit" data-id='${e.id}'>
                    <i class="fas fa-pen"></i>
                </a>
                <a href="#" class="btn_remove" data-id='${e.id}'>
                    <i class="fas fa-trash"></i>
                </a>
            </div>`;

            //設定按鈕事件
            //刪除文字
            dom.querySelector('.btn_remove').onclick = function (e) {
                let id = parseInt(this.getAttribute('data-id'));
                ins.DeteleSaying(id);
            };
            //編輯文字
            dom.querySelector('.btn_edit').onclick = function (e) {
                let i = this.querySelector('.fas');

                //判斷為 開始編輯/取消編輯
                if (i.classList.contains('fa-pen')) {
                    //開始編輯
                    i.classList.remove('fa-pen');
                    i.classList.add('fa-undo');
                    dom.querySelector('.quote_saying').disabled = false;
                    dom.querySelector('.quote_saying').focus();
                    dom.querySelector('.btn_save').style.visibility = 'visible';
                }
                else {
                    //取消編輯
                    i.classList.remove('fa-undo');
                    i.classList.add('fa-pen');
                    dom.querySelector('.quote_saying').disabled = true;
                    dom.querySelector('.btn_save').style.visibility = 'hidden';

                    //回復原文字
                    ins.RecoverSaying(parseInt(this.getAttribute('data-id')));
                }
            };

            //儲存編輯事件
            dom.querySelector('.btn_save').onclick = function (e) {
                let id = parseInt(this.getAttribute('data-id'));
                let ipt = dom.querySelector('.quote_saying');
                let saying = ipt.value.trim();
                ins.EditSaying(id, saying, ipt, this);
            };

            container.append(dom);
            container.append(document.createElement('hr'));
        });

        //判斷是否顯示LOAD MORE
        if (data[data.length - 1].id !== ins.Sayings.data[ins.Sayings.data.length - 1].id) {
            document.getElementById('btn_load').style.display = 'block';
        }
        else {
            document.getElementById('btn_load').style.display = 'none';
        }

        ins.Sayings.lastIndex = data[data.length - 1].id;
    };

    //建立文字
    this.CreateSaying = function (value) {
        //判斷是否該文字內容是否已存在
        if (!this.Sayings.data.find(d => d.value === value)) {
            let ins = this;
            let btn = document.getElementById('btn_create');

            btn.classList.remove('enabled');
            btn.classList.add('disabled');
            document.getElementById('new_quote').disabled = true;

            let arr = this.Sayings.data.map(e => e.id);

            let max = 0;

            //取得目前編號最大值
            if (arr.length > 0) {
                max = arr.reduce((e, i) => { return Math.max(e, i) });
            }

            //匯入新文字
            this.Sayings.data.push({ id: max + 1, time: new Date().getTime(), value: value });

            //呼叫chrome api
            chrome.storage.sync.set({ sayings: this.Sayings.data }, function () {
                btn.classList.remove('disabled');
                btn.classList.add('enabled');
                document.getElementById('new_quote').disabled = false;
                ins.GetSayings();
            });
        }
    };

    //刪除文字
    this.DeteleSaying = function (id, refreshTitle = true) {
        if (id !== undefined) {
            let ins = this;

            ins.Sayings.data = ins.Sayings.data.filter(e => e.id !== id);

            chrome.storage.sync.set({ sayings: this.Sayings.data }, function () {
                if (refreshTitle) {
                    ins.GetSayings();
                } else {
                    ins.AppendSayings();
                }
            });
        }
    };

    //編輯文字
    this.EditSaying = function (id, value, ipt) {
        if (id >= 0) {
            let ins = this;
            let data = ins.Sayings.data.find(d => d.id === id);

            if (value.length === 0) {
                //刪除
                ins.DeteleSaying(id, true);
            }
            else {
                //判斷修改後的值是否已存在
                if (ins.Sayings.data.find(d => d.value === value && d.id !== id)) {
                    //已存在
                    alert('該幹話已存存在！');
                    ipt.value = data.value;
                }
                else {
                    ins.Sayings.data.find(d => d.id === id).value = value;
                    chrome.storage.sync.set({ sayings: this.Sayings.data }, function () {
                        //alert('修改成功');
                        if (parseInt(document.getElementById('saying').getAttribute('data-id')) === id) {
                            ins.SetTitle(id, value);
                        }
                        document.querySelector(`.btn_edit[data-id="${id}"]`).click();
                    });
                }
            }
        }
    };

    //快速編輯
    this.QuickEditSaying = function (id, value, ipt) {
        if (id >= 0) {
            let ins = this;
            let data = ins.Sayings.data.find(d => d.id === id);

            if (value.length === 0) {
                //刪除
                ins.DeteleSaying(id, true);
            }
            else {
                //判斷修改後的值是否已存在
                if (ins.Sayings.data.find(d => d.value === value && d.id !== id)) {
                    //已存在
                    alert('該幹話已存存在！');
                    ipt.value = data.value;
                }
                else {
                    ins.Sayings.data.find(d => d.id === id).value = value;
                    chrome.storage.sync.set({ sayings: this.Sayings.data }, function () {
                        //alert('修改成功');
                        ins.SetTitle(id, value);
                        ins.AppendSayings();
                    });
                }
            }
        }
    };

    //復原文字內容
    this.RecoverSaying = function (id) {
        let value = this.Sayings.data.find(d => d.id === id).value;
        document.querySelector(`.quote_saying[data-id="${id}"]`).value = value;
    };

    this.GetConfig = function (callBack) {
        let ins = this;
        chrome.storage.sync.get('is_night', function (data) {
            ins.Config.is_night = data.is_night;
            if (callBack) {
                callBack(ins.Config.is_night);
            };
        });
    };
    this.SetNight = function () {
        document.getElementById('main').classList.replace('day','night');
        document.getElementById('saying').classList.replace('day','night');
        document.getElementById('quick_btns').classList.replace('day','night');
        document.getElementById('edit').classList.replace('day','night');
        document.getElementById('menu').classList.replace('day','night');


        document.getElementById('slider').classList.replace('day','night');
        document.getElementById('options').classList.replace('day','night');
        chrome.storage.sync.set({is_night:true},function(){});
    };
    
    this.SetDay = function () {
        document.getElementById('main').classList.replace('night','day');
        document.getElementById('saying').classList.replace('night','day');
        document.getElementById('quick_btns').classList.replace('night','day');
        document.getElementById('edit').classList.replace('night','day');
        document.getElementById('menu').classList.replace('night','day');


        document.getElementById('slider').classList.replace('night','day');
        document.getElementById('options').classList.replace('night','day');
        chrome.storage.sync.set({is_night:false},function(){});
    };
};

function SetSwitch(element,callBack){
    //找出其他checked狀態不同的switch
    let other_btn = Array.apply(null, document.querySelectorAll('.switch>input')).filter(d => d !== element && d.checked !== element.checked);
    if (other_btn.length > 0) {
        other_btn[0].click();
    }
    else{
        callBack(element.checked);
    }
};