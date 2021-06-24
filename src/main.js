// раскрывашки списков
$('body').on('click','.collapse',function(){
    const collapseElement = $(this).siblings(".collapsed")
    if ( collapseElement.is(":visible") === false ) {
        collapseElement.show()
        $(this).addClass('show')
    } else {
        collapseElement.hide()
        $(this).removeClass('show')
    }
});

// получение каталога
$('body').on('click','.getCatalog', function () {
    if ($('.user__item').length === 0 ) {
        $('.content').html(
            `<ul class="user__list">`
        )
        api_query('users', '', (items) => {
            for (let item of items) {
                item.name ? $('.user__list').append(createListItem('user__item', item.id, item.name), `</ul>`) : null
            }
        })
    }
});

$('body').on('click','.user__item', function () {
    if ($(this).children('.user__albums').length === 0 ) {
        api_query('albums', `userId=${$(this).data('id')}`, (items) => {
            $(this).append(
                `<ul class="user__albums collapsed">`
            )
            for (let item of items) {
                item.title ? $(this).children('.user__albums').append(createListItem('user__album', item.id, item.title), `</ul>`) : null
            }
        })
    }
});

$('body').on('click','.user__album', function () {
    if ($(this).children('.user__photos').length === 0 ) {
        api_query('photos', `albumId=${$(this).data('id')}`, (items) => {
            $(this).append(
                `<ul class="user__photos collapsed">`
            )
            for (let item of items) {
                item.title ? $(this).children('.user__photos').append(createPhotoItem(item), `</ul>`) : null
            }
        })
    }
});

// всплывающий блок фото
$('body').on('click','.userThumb', function () {
    $('.photo').show().html(`
        <img src="${$(this).data('src')}" title="${$(this).attr('title')}" alt="${$(this).attr('title')}">
    `)
});


// обращение к api
function api_query(method,data,callback){
    $.ajax({
        url: `https://json.medrating.org/${method}`,
        method: "GET",
        data,
        success: (res) => {
            callback(res)
        }
    }).fail((e) => callback(false));
}

// создаём элемент списка
function createListItem(...params){
    return (
        ` <li class="${params[0]}" data-id="${params[1]}">
            <a href="#" class="item__name collapse">${params[2]}</a>
            </li>
        `
    )
}

// создаём список фотографий
function createPhotoItem(item){
    return (
        ` 
        <li class="user__photo" data-id="${item.id}">
            <button class="user__photo--favorite star"></button>
            <img src="${item.thumbnailUrl}" alt="${item.title}" title="${item.title}" data-src="${item.url}" class="user__photo--thumb userThumb">
        </li>
        `
    )
}

// создаём список избранных фотографий
function createPhotoFavItem(item, className){
    return (
        ` 
        <li class="user__photo" data-id="${item.id}">
            <button class="user__photo--favorite star ${className}"></button>
            <img src="${item.thumbnailUrl}" alt="${item.title}" title="${item.title}" data-src="${item.url}" class="user__photo--thumb userThumb">
            <span>${item.title}</span>
        </li>
        `
    )
}
// событие клика по веб-документу
$(document).mouseup(function (e) { // событие клика по веб-документу
    const div = $(".photo img"); // тут указываем ID элемента
    if (!div.is(e.target) &&  div.parent().is(':visible')  === true ) { // и не по его дочерним элементам
      div.parent().hide(); // скрываем его
    }
  });


// добавление - изъятие из хранилища 
var favData = [];

const favorites = {
    key: 'favorites',
    get: ()=>{
        let data = localStorage.getItem(favorites.key);
        if (!data) {favData=[];}  else {
            favData=JSON.parse(data);
        }
    },
    add: (obj)=>{
        favorites.get();
        favData.push(obj)
        localStorage.setItem(favorites.key,JSON.stringify(favData));
    },
    delete: (obj)=>{
        favorites.get();
        favData = favData.filter(i => i.id !== obj.id);
        localStorage.setItem(favorites.key,JSON.stringify(favData));
    }
}

// добавить в избранное
$('body').on('click','.star', function () {
    const photoId = $(this).parent().data('id')
    const starredPhoto = {
        'id': photoId,
        'title': $(this).siblings('img').attr('title'),
        'thumbnailUrl': $(this).siblings('img').attr('src'),
        'url': $(this).siblings('img').data('src')
    }
    if ($(this).hasClass('active')) {
        $(this).removeClass('active')
        favorites.delete(starredPhoto)
    } else {
        $(this).addClass('active')
        favorites.add(starredPhoto)
    }


})

// получение избранного 
$('body').on('click','.getFavorites', function () {
    
    favorites.get()

      $('.content').html(
        `<ul class="user__photos">`
    )
    for (let item of favData) {
        item.title ? $('.user__photos').append(createPhotoFavItem(item, 'active favItem'), `</ul>`) : null
    }
})

$('body').on('click','.favItem', function () {
    $(this).parent().remove()
})