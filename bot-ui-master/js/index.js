var $messages = $('.messages-content');
var serverResponse = "wala";


var suggession;
//speech reco
try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
}

$('#start-record-btn').on('click', function(e) {
  recognition.start();
});

recognition.onresult = (event) => {
  const speechToText = event.results[0][0].transcript;
 document.getElementById("MSG").value= speechToText;
  //console.log(speechToText)
  insertMessage()
}


function listendom(no){
  console.log(no)
  //console.log(document.getElementById(no))
document.getElementById("MSG").value= no.innerHTML;
  insertMessage();
}

$(window).load(function() {
  $messages.mCustomScrollbar();
  setTimeout(function() {
    serverMessage("hello! Welcome to Manomay Insurance Chat Bot");
  }, 100);

});

function updateScrollbar() {
  $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
    scrollInertia: 10,
    timeout: 0
  });
}



function insertMessage() {
  msg = $('.message-input').val();
  if ($.trim(msg) == '') {
    return false;
  }
  $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
  fetchmsg() 
  
  $('.message-input').val(null);
  updateScrollbar();

}

document.getElementById("mymsg").onsubmit = (e)=>{
  e.preventDefault() 
  insertMessage();
  // serverMessage("hello");
  // speechSynthesis.speak( new SpeechSynthesisUtterance("hello"))
}

function serverMessage(response2) {


  if ($('.message-input').val() != '') {
    return false;
  }
  $('<div class="message loading new"><figure class="avatar"><img src="css/bot.png" /></figure><span></span></div>').appendTo($('.mCSB_container'));
  updateScrollbar();
  

  setTimeout(function() {
    $('.message.loading').remove();
    $('<div class="message new"><figure class="avatar"><img src="css/bot.png" /></figure>' + response2 + '</div>').appendTo($('.mCSB_container')).addClass('new');
    updateScrollbar();
  }, 100 + (Math.random() * 20) * 100);

}


function fetchmsg(in_data){

     var url = 'http://localhost:5000/send-msg';
     
     const data = new URLSearchParams();

      if(!in_data) {
        for (const pair of new FormData(document.getElementById("mymsg"))) {
            data.append(pair[0], pair[1]);
        }
      }else{
            data.append("MSG", in_data);
      }
      
    
      console.log("abc",data)
        fetch(url, {
          method: 'POST',
          body:data
        }).then(res => res.json())
         .then(response => {
          console.log(response);

         let loader = create_payload(response.Reply);
         serverMessage(loader);
          speechSynthesis.speak( new SpeechSynthesisUtterance(response.Reply.msg))
        
          
         })
          .catch(error => console.error('Error h:', error));

}

function create_payload(data){

  let html_code = '';

  if(data.payload){
    let key = Object.keys(data.payload)[0];

    switch (key) {
      case 'vechiles':
        data.payload[key].listValue.values.forEach(element => {
          html_code = html_code +  `<br/><button type="button" onclick="fetchmsg('`+element.stringValue+`')" class=" btn-primary m-1">`+element.stringValue+`</button>`;
          console.log(element)
        });
        break;
      case 'assistant_list':
        data.payload[key].listValue.values.forEach(element => {
          html_code = html_code +  `<div class="form-check">
          <label class="form-check-label" for="check1">
            <input type="checkbox" class="form-check-input" id="check1" onclick="fetchmsg('`+element.stringValue+`')" name="option1" value="`+element.stringValue+`" >
            `+element.stringValue+`
          </label>
        </div>`;
      });
      break;

      case 'summary':
        data.msg = data.msg + `Our Service man is on his way to service your vehicle you can track wing this link
        <a href="https://www.google.com/maps/dir/bangalore/chennai/@12.9369553,77.7948207,8.75z/data=!4m13!4m12!1m5!1m1!1s0x3bae1670c9b44e6d:0xf8dfc3e8517e4fe0!2m2!1d77.5945627!2d12.9715987!1m5!1m1!1s0x3a5265ea4f7d3361:0x6e61a70b6863d433!2m2!1d80.2707184!2d13.0826802" target="_blank">here</a>`;
        
        break;
    
      default:
        break;
    }
    console.log(key);
  }else{
    html_code = data.msg;
  }

  return data.msg+html_code;

}

