// Saves options to chrome.storage
function save_options() {
  var toSync = {};
  for (e in defaultVal) {
    toSync[e] = document.getElementById(e).value;
  }

  chrome.storage.sync.set(
    toSync
  , function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}


function load_options() {


  
  var toSync = {};
  for (e in defaultVal) {
    var content = document.getElementById(defaultVal[e].type);
    toSync[e] = defaultVal[e].value;
    var container = document.createElement('div');
    container.setAttribute('class', 'form-group');

    var label = document.createElement('label');
    var h6 = document.createElement('h5');
    var helpText = (Array.isArray(defaultVal[e].value))?'(Accepts comma seperated values)':'';
    h6.textContent = defaultVal[e].label+': '+helpText;
    label.setAttribute('for', e);
    label.appendChild(h6);

    var elem = document.createElement('input');
    //elem.setAttribute('value', defaultVal[e].value);
    elem.setAttribute('id', e);
    elem.setAttribute('size', 100);

    container.appendChild(label);
    container.appendChild(elem);

    content.appendChild(container);
    

  }

  

  //console.log(toSync);

  chrome.storage.sync.get(
    toSync
  , function(items) {
    for (e in toSync) {
      document.getElementById(e).value = items[e];  
    }
    
  });
}

function reset_options() {

  var toSync = {};
  for (e in defaultVal) {
    toSync[e] = defaultVal[e].value;
    document.getElementById(e).value = toSync[e];
  }

  chrome.storage.sync.set(
    toSync
  , function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options reset successfully!';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });

}

document.addEventListener('DOMContentLoaded', load_options);
document.getElementById('save').addEventListener('click',save_options);
document.getElementById('reset').addEventListener('click',reset_options);


