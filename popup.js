var url=document.querySelector("#urlPrefix");
url.focus();
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

function updateInfo(isVisible, text) {
  document.getElementById("info").innerHTML = text;
  document.getElementById("infoPara").style.visibility = isVisible;
}

function sleeping(ms) {
    setTimeout(()=>{
      updateInfo("hidden", "")
    }, ms);
}