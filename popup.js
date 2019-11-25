document.getElementById('ipt_light_mode').onclick = function (e) {
    let is_night = this.checked;

    let menu = document.getElementById('popup_menu');
    let menu_a_add = document.getElementById('a_add');
    let menu_a_edit = document.getElementById('a_edit');

    SetIsNight(is_night);

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

chrome.storage.sync.get('is_night', function (data) {
    if (data.is_night) {
        document.getElementById('ipt_light_mode').click();
    }
});

function SetIsNight(is_night) {
    chrome.storage.sync.set({ is_night: is_night }, function () {
        console.log('successful');
    });
}