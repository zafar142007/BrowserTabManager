//Don't use forms as they cause unnecessary reloading of the popup

//Config
const highestOpenedTabs =10;//number of tabs to be shown when getting top tabs by domain count
const searchResults = 10;


var url=document.querySelector("#urlPrefix");
url.focus();


var topTabsButton = document.querySelector("#topTabs")
topTabsButton.addEventListener("click", async () => {
  let map = new Map();
  updateInfo("hidden", "");
  getTopTabs();
});


const searchButton = document.querySelector("#searchButton");
searchButton.addEventListener("click", async () => {
  let searchQ = document.getElementById("searchQuery");
  updateInfo("hidden", "");

  if(searchQ.value=='' || searchQ.value==null)
    return;
  searchInTabTitles(searchQ.value)
});


const urlPrefixButton = document.querySelector("#urlPrefixButton");
urlPrefixButton.addEventListener("click", async () => {
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

        const table = document.getElementById("topXTabs");
        let i =0;
        if(tabs.length>0){
          table.innerHTML="";
          let tr=document.createElement("tr");
          let td1= document.createElement("th")
          let td2= document.createElement("th")
          td1.innerHTML="Count"
          td2.innerHTML="Domain"
          tr.appendChild(td1)
          tr.appendChild(td2)
          table.appendChild(tr)
        }
        map.forEach (function(value, key) {
           if(i>=highestOpenedTabs){ 
             return;
           }
           let tr=document.createElement("tr");
           let td1= document.createElement("td")
           let td2= document.createElement("td")
           td1.innerHTML=value
           td2.innerHTML=key
           tr.appendChild(td1)
           tr.appendChild(td2)
           table.appendChild(tr)
           i++
        })
     }
  )
}

function searchInTabTitles(searchQ){
  chrome.tabs.query(
      {
        title: "*"+searchQ+"*" 
      }, function (tabs) {

        let i = 0;
        let html="Showing "+Math.min(tabs.length, searchResults).toString()+" results out of "+tabs.length.toString()
        
        const list = document.getElementById("searchResults");
        list.innerHTML='';
        if(tabs.length ==0){
          updateInfo("visible", "No results found!");
          sleeping(2000);
          return
        }
        let l= document.createElement("h3")
        l.innerHTML=html
        list.appendChild(l)
 
        for (let tab in tabs) {
          if (i>=searchResults){
            break;
          }
          
          let label=document.createElement("li");
          label.dataset.id=tabs[tab].id;
          label.innerHTML =tabs[tab].title;
          list.appendChild(label)
          label.addEventListener("click",  async () => {
        
            chrome.tabs.update(parseInt(label.dataset.id), {highlighted: true, active:true}, function(tab){});
          
          })
          i++;
        }

      })
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
