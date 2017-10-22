function convert2d(x, y, z){
    return {
        x: (center_x + (x * FOCAL_LENGTH)/((z * .8) + FOCAL_LENGTH)),
        y: (center_y - (y * FOCAL_LENGTH)/((z * .8) + FOCAL_LENGTH))
    }
}

function roundTo(x, precition=10000){
    return Math.round(x * precition) / precition;
}

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name, default_value=null) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return default_value;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}

function checkCookie(name)
{
    return readCookie(name) != null;
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  // return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  return s4() + '-' + s4();
}

function $(selector){
  return document.querySelector(selector)
}