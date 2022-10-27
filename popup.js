var url=document.querySelector("#urlPrefix");
url.focus();

const x =5;

var topTabsButton = document.querySelector("#topTabs")
topTabsButton.addEventListener("click", async () => {
  let map = new Map();
  getTopTabs();
  
});


const form = document.querySelector("form");
form.addEventListener("submit", async () => {
  document.getElementById("infoPara").style.visibility = "hidden";
  var urlPrefix=document.querySelector("#urlPrefix").value;
  if (urlPrefix!='' && !urlPrefix.startsWith("https://") && !urlPrefix.startsWith("http://")){
    urlPrefix = "https://".concat(urlPrefix).concat( "/*");
  }
  try {
    chrome.tabs.query(
      {
        url: urlPrefix 
      }, function (tabs) {
      
        try{
          const tabsToClose = tabs.map(({ id }) => id);
          if (tabsToClose.length > 0){
            console.log("closing "+ tabsToClose.length.toString() + " tabs")
            chrome.tabs.remove(
              tabsToClose , () => {
                 updateInfo("visible",  "Closed "+ tabsToClose.length.toString() + " tabs")
                sleeping(2000);     

              } 
            );
          } else {
             updateInfo("visible",  "No tabs found!")
             sleeping(2000);     
          }
        } catch(error){
           updateInfo("visible", error.message)
           console.log(error);
           sleeping(2000);     
    
        }
      }
    );
    
   } catch (error) {
     updateInfo("visible", error.message)
     console.log(error);
     sleeping(2000);     
   
     throw error;
   }
});
function getTopTabs(){
  chrome.tabs.query(
      {
        url: "<all_urls>" 
      }, function (tabs) {
        let map = new Map();
          
        for (let tab in tabs) {
          var domain;
          try{
            domain = new URL(tabs[tab].url)
          }catch(error) {
            continue;
          }
          let h=domain.hostname;
          if(map.has(h)){
            map.set(h, map.get(h)+1)
          } else {
            map.set(h,1);
          }
        }
        map = new Map([...map].sort((a, b) => {
           if (a[1] > b[1]) return -1;
           if (a[1] == b[1]) return 0;
           if (a[1] < b[1]) return 1;
        }))

        const div = document.getElementById("topXTabs");
        var html = "";
        let i =0;
        map.forEach (function(value, key) {
           if(i>=x){ 
             return;
           }
          html += key + ' = ' + value + "<br>";
          i++
        })

        div.innerHTML=html;
      }
  )
}


function updateInfo(isVisible, text) {
  document.getElementById("info").innerHTML = text;
  document.getElementById("infoPara").style.visibility = isVisible;
}

function sleeping(ms) {
    setTimeout(()=>{
      updateInfo("hidden", "")
    }, ms);
}
