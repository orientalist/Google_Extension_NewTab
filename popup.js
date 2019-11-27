window.onload=function(){
    window.saying_center=new SayingCenter();

    window.saying_center.GetConfig(function(is_night){
        if(is_night){
            document.getElementById('ipt_light_mode').click();
        }
    });

    window.saying_center.GetSayings(function(data){
        let container=document.getElementById('div_sayings');
        data.forEach(d=>{
            let item=document.createElement('div');
            item.classList.add('saying_item');
            let saying=`
            
                <input class="ipt_saying" type="text" name="" value="${d.value}" disabled/>
                <div class="div_btns">
                    <a href='#' class="btn_save" data-id='${d.id}'>
                        <i class="fas fa-save"></i>
                    </a>
                    <a href="#" class="btn_edit" data-id='${d.id}'>
                        <i class="fas fa-pen"></i>
                    </a>
                    <a href="#" class="btn_remove" data-id='${d.id}'>
                        <i class="fas fa-trash"></i>
                    </a>
                </div>
            
            `;
            item.innerHTML=saying;

            //刪除文字
            item.querySelector('.btn_remove').onclick = function (e) {
                let id = parseInt(this.getAttribute('data-id'));
                window.saying_center.DeteleSaying(id,item);
            };
            //編輯文字
            item.querySelector('.btn_edit').onclick = function (e) {
                e.preventDefault();
                let i = this.querySelector('.fas');

                //判斷為 開始編輯/取消編輯
                if (i.classList.contains('fa-pen')) {
                    //開始編輯
                    i.classList.remove('fa-pen');
                    i.classList.add('fa-undo');
                    item.querySelector('.ipt_saying').disabled = false;
                    item.querySelector('.ipt_saying').focus();
                    item.querySelector('.btn_save').style.visibility = 'visible';
                }
                else {
                    //取消編輯
                    i.classList.remove('fa-undo');
                    i.classList.add('fa-pen');
                    item.querySelector('.ipt_saying').disabled = true;
                    item.querySelector('.btn_save').style.visibility = 'hidden';

                    //回復原文字
                    window.saying_center.RecoverSaying(parseInt(this.getAttribute('data-id')),item.querySelector('.ipt_saying'));
                }
            };

            container.append(item);
            container.append(document.createElement('hr'));
        });
    });

    document.getElementById('ipt_light_mode').onclick = function (e) {    
        let is_night = this.checked;
    
        let menu = document.getElementById('popup_menu');
        let menu_a_add = document.getElementById('a_add');
        let menu_a_edit = document.getElementById('a_edit');
    
        if(e.isTrusted){
            window.saying_center.SetIsNight(is_night);
        }    
    
        if (is_night) {
            menu.classList.remove('day');
            menu.classList.add('night');
    
            menu_a_edit.style.color = 'white';
            menu_a_add.style.color = 'black';
            menu_a_add.style.backgroundColor = 'white';
        } else {
            menu.classList.add('day');
            menu.classList.remove('night');
    
            menu_a_edit.style.color = 'black';
            menu_a_add.style.color = 'white';
            menu_a_add.style.backgroundColor = 'black';
        }
    };
};

function SayingCenter(){
    this.Config={
        is_night:false
    };

    this.Sayings={
        data:null,
        lastIndex:0
    };

    this.GetConfig=function(callBack){
        let ins=this;
        chrome.storage.sync.get('is_night',function(data){
            ins.Config.is_night=data.is_night;
            if(callBack){
                callBack(ins.Config.is_night);
            }
        });
    };

    this.SetIsNight=function(is_night) {
        chrome.storage.sync.set({ is_night: is_night }, function () {
            console.log('successful');
        });
    }

    this.GetSayings=function(callBack){
        let ins=this;
        chrome.storage.sync.get('sayings',function(data){            
            if(data.sayings.length>0){
                ins.Sayings.data=data.sayings;
                if(callBack){
                    callBack(ins.Sayings.data);
                }
            }
        });
    };

    this.RecoverSaying=function(id,element){
        let value = this.Sayings.data.find(d => d.id === id).value;
        element.value = value;
    };

    this.DeteleSaying=function(id,element){
        if (id !== undefined) {
            let ins = this;

            ins.Sayings.data = ins.Sayings.data.filter(e => e.id !== id);

            chrome.storage.sync.set({ sayings: this.Sayings.data }, function () {
                let hr=element.nextSibling;                
                element.remove();
                hr.remove();
            });
        }
    };
};