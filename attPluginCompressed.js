!function(){function makeRequestPost(e,t){return clearSprintData(),httpRequest?(modalHelper.setMessage("Parsing the RTC query"),httpRequest.onreadystatechange=parseQuery,httpRequest.open("POST",e),httpRequest.setRequestHeader("accept","text/json"),httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),void httpRequest.send(t)):(modalHelper.setMessage("Giving up :( Cannot create an XMLHTTP instance",!0),!1)}function makeRequestWithPromise(e,t,n){return new Promise(function(s,r){var o=new XMLHttpRequest;o.open("GET",e),o.onload=function(){200===o.status?s({id:t,index:n,data:JSON.parse(o.response)}):r(new Error(o.statusText))},o.onerror=function(){r(new Error("Network error"))},o.setRequestHeader("accept","text/json"),o.send()})}function getHistoryQuery(e,t){modalHelper.setMessage("Querying the history of #"+e);var n=rtcURL+"/jazz/service/com.ibm.team.workitem.common.internal.rest.IWorkItemRestService/workItemDTO2?id={itemId}&includeAttributes=false&includeLinks=false&includeApprovals=false&includeHistory=true&includeLinkHistory=false";return n=n.replace("{itemId}",e),makeRequestWithPromise(n,e,t)}function getParent(e,t){modalHelper.setMessage("Looking into the links section of #"+e);var n=rtcURL+"/jazz/service/com.ibm.team.workitem.common.internal.rest.IWorkItemRestService/workItemDTO2?includeHistory=false&id={itemId}&projectAreaItemId="+projectId;return n=n.replace("{itemId}",e),makeRequestWithPromise(n,e,t)}function dateDiff(e,t){var n=new Date(e),s=new Date(t),r=Math.abs(s.getTime()-n.getTime());return Math.ceil(r/864e5)}function RTCQuery(e){this.$defectsArr=[],this.$sprintData=$sprintData,this.$historyArr=[];var t=e["soapenv:Body"].response.returnValue.value.headers?e["soapenv:Body"].response.returnValue.value.headers:[],n=[];t.forEach(function(e,t){n[t]=e.attributeId});var s=e["soapenv:Body"].response.returnValue.value.rows;modalHelper.setMessage("Processing "+s.length+" records"),this.setDefectsArray(n,s),this.processStories()}function parseQuery(){if(httpRequest.readyState===XMLHttpRequest.DONE)if(200===httpRequest.status){if(modalHelper.setMessage("Got 200 OK response"),httpRequest.responseText.indexOf("Loading...")>0)return void modalHelper.setMessage("Please login to RTC and check again!",!0);var e=JSON.parse(httpRequest.responseText);$rtc=new RTCQuery(e),$rtc.processLinksAndHistories()}else modalHelper.setMessage("There was a problem with the request.",!0)}var httpRequest=new XMLHttpRequest,rtcURL="https://swgjazz.ibm.com:8017",projectId="_TpqD8FSeEeCF6b5qT5IShg",queryId=window.location.hash.split("&")[1]?window.location.hash.split("&")[1].split("=")[1]:"",attURL="https://agiletool.mybluemix.net/iteration",$sprintData={defects:0,defectsClosed:0,commStories:0,commStoriesDel:0,commPoints:0,commPointsDel:0,WIPTotal:0,cycleTimeWIP:0,BLTotal:0,cycleTimeInBacklog:0,clientSatisfaction:4,teamSatisfaction:4},$sprintDataLabel={defects:"New this iteration:",defectsClosed:"Resolved this iteration:",commStories:"Stories/Cards/Tickets-Committed:",commStoriesDel:"Stories/Cards/Tickets-Delivered:",commPoints:"Story points - Committed:",commPointsDel:"Story points delivered:",WIPTotal:"Work in progress - Total",cycleTimeWIP:"Cycle time in WIP (days):",BLTotal:"Total backlog (days)",cycleTimeInBacklog:"Cycle time in backlog (days):",clientSatisfaction:"Client satisfaction:",teamSatisfaction:"Team satisfaction:",commFeatures:"Features/Stories comitted and delivered"},clearSprintData=function(){$sprintData={defects:0,defectsClosed:0,commStories:0,commStoriesDel:0,commPoints:0,commPointsDel:0,WIPTotal:0,cycleTimeWIP:0,BLTotal:0,cycleTimeInBacklog:0,clientSatisfaction:4,teamSatisfaction:4,commFeatures:[]}},modalHelper=function(){if(queryId){var e=document.createElement("input");e.setAttribute("value","Generate ATT Fillings"),e.setAttribute("type","button"),e.setAttribute("id","myBtn"),e.setAttribute("class","attButton"),document.body.insertBefore(e,document.body.childNodes[0]);var t='<div id="myModal" class="modal"> <div class="modal-content"> <div class="modal-header"> <span class="close">&times;</span> <h4>RTC=> ATT</h4> </div><div class="modal-body">  <div style="overflow:scroll" id="attFillingResult"></div>  <br /> <h6>Log Messages...</h6><div style="height:100px; overflow:scroll; background-color:black; color:white" id="attLogMessage"></div> </div></div></div>',n=document.createElement("div");n.innerHTML=t,document.body.insertBefore(n,document.body.childNodes[0]);var s=document.getElementById("myModal"),r=document.getElementById("myBtn"),o=document.getElementsByClassName("close")[0],a=document.getElementById("attFillingResult"),i=document.getElementById("attLogMessage");r.addEventListener("click",function(){a.innerHTML="",i.innerHTML="",s.style.display="block"}),r.addEventListener("click",function(){return queryId=window.location.hash.split("&")[1]?window.location.hash.split("&")[1].split("=")[1]:"","undefined"!=typeof queryId&&isNaN(queryId)?void makeRequestPost(rtcURL+"/jazz/service/com.ibm.team.workitem.common.internal.rest.IQueryRestService/getResultSet","startIndex=0&maxResults=100&itemId="+encodeURIComponent(queryId)+"&projectAreaItemId="+encodeURIComponent(projectId)):(modalHelper.setMessage("Seems you are not in RTC query page!",!0),!1)}),o.onclick=function(){s.style.display="none"},window.onclick=function(e){e.target==s&&(s.style.display="none")};var l=function(e){var t=document.getElementById(e);if(!t)return void modalHelper.setMessage("Target Element Missing!");t.focus(),t.setSelectionRange(0,t.value.length),success=!0;try{success=document.execCommand("copy")}catch(e){success=!1}success||(modalHelper.setMessage("Cannot copy the content. Please help yourself!"),t.style.display="block")},d=function(){return"rgb("+(Math.floor(76*Math.random())+230)+","+(Math.floor(76*Math.random())+230)+","+(Math.floor(76*Math.random())+230)+")"};return{createTableFromJSON:function(e,t){for(var n=[],s=0;s<e.length;s++)for(var r in e[s])-1===n.indexOf(r)&&n.push(r);var o=document.createElement("table"),i=t?"display:none;":"";o.setAttribute("style","border-collapse: collapse;border: 1px solid black;"+i);for(var l=o.insertRow(-1),s=0;s<n.length;s++){var c=document.createElement("th");c.setAttribute("style","border: 1px solid black; background-color: "+d()),c.innerHTML=n[s],l.appendChild(c)}for(var s=0;s<e.length;s++){l=o.insertRow(-1);for(var m=0;m<n.length;m++){var u=l.insertCell(-1);u.setAttribute("style","border: 1px solid black;"),u.innerHTML=e[s][n[m]]}}var p=document.createElement("h6");p.textContent=t?"All Work Items (Show/Hide)":"Result",t&&p.addEventListener("click",function(){"block"==o.style.display?o.style.display="none":o.style.display="block"}),a.appendChild(p),a.appendChild(o)},close:function(){s.style.display="none"},renderCopy:function(e){var t=document.createElement("input");t.setAttribute("type","button"),t.setAttribute("value","Click here to copy the summary"),t.setAttribute("class","attButton");var n=document.createElement("span");n.innerHTML='<br /> Now go to  <a href="'+attURL+'">'+attURL+'</a>, paste the content in the textbox and click the button "Execute"';var s=document.createElement("textarea");s.setAttribute("readonly","readonly"),s.setAttribute("id","hiddenCopyText"),s.textContent=e,t.addEventListener("click",function(){l("hiddenCopyText")});var r=document.createElement("h6");r.textContent="Iteration summary",a.appendChild(r),a.appendChild(t),a.appendChild(s),a.appendChild(n)},setMessage:function(e,t){var n=document.createElement("p");t&&n.setAttribute("style","color:red;"),n.textContent=e,i.insertBefore(n,i.childNodes[0])}}}}();!function(){if(!(window.location.toString().indexOf("agiletool.mybluemix.net")<0)){var textelem=document.createElement("input");textelem.setAttribute("type","text"),textelem.setAttribute("style","width:70%; height: 10px"),document.body.insertBefore(textelem,document.body.childNodes[0]);var button=document.createElement("button");button.textContent="Execute",button.setAttribute("class","attButton"),document.body.insertBefore(button,document.body.childNodes[0]),button.addEventListener("click",function(){var iterationDetails=$("#iterationSelectList option:selected").val();if("new"==iterationDetails||!iterationDetails)return void alert("Please select an Iteration!");var teamDetails=$("#teamSelectList option:selected").val();if(!teamDetails)return void alert("Please select an Iteration!");textelem.focus(),textelem.setSelectionRange(0,textelem.value.length),eval(textelem.value);var commPointsDel=isNaN(document.getElementById("commPointsDel").value)?0:document.getElementById("commPointsDel").value,fteThisiteration=isNaN(document.getElementById("fteThisiteration").value)?0:document.getElementById("fteThisiteration").value,commStoriesDel=isNaN(document.getElementById("commStoriesDel").value)?0:document.getElementById("commStoriesDel").value;fteThisiteration>0&&(document.getElementById("unitCostStoryPointsFTE").value=(commPointsDel/fteThisiteration).toFixed(1),document.getElementById("unitCostStoriesFTE").value=(commStoriesDel/fteThisiteration).toFixed(1));var defects=isNaN(document.getElementById("defects").value)?0:document.getElementById("defects").value,defectsClosed=isNaN(document.getElementById("defectsClosed").value)?0:document.getElementById("defectsClosed").value,defectsStartBal=isNaN(document.getElementById("defectsStartBal").value)?0:document.getElementById("defectsStartBal").value;document.getElementById("defectsEndBal").value=parseInt(defects)+parseInt(defectsStartBal)-defectsClosed;var data={},url="https://agiletool.mybluemix.net/api/iteration/"+iterationDetails,sprintData=$sprintData;sprintData.defectsClosed=0,sprintData.defectsStartBal=0,sprintData.defectsEndBal=0;var mapping={commStories:"committedStories",commStoriesDel:"deliveredStories",commPoints:"committedStoryPoints",commPointsDel:"storyPointsDelivered"};for(e in sprintData)if(document.getElementById(e)){var index=e in mapping?mapping[e]:e;data[index]=document.getElementById(e).value}data._id=iterationDetails,data.teamId=teamDetails,$.ajax({url:url,type:"PUT",dataType:"json",data:data,success:function(e,t,n){console.log(e),alert("successfully updated! Click Ok to refresh the screen!"),location.reload()},error:function(e,t,n){console.log("Error in Operation")}})})}}(),RTCQuery.prototype.processLinksAndHistories=function(){if(this.$defectsArr.length>0){if(0==this.$historyArr.length)return void this.summarize();var e=this;Promise.all(this.$historyArr).then(function(t){var n=[];for($indexOfItem in t){var s=t[$indexOfItem];n.push(e.processHistory(s))}Promise.all(n).then(function(t){var n=[];for($link in t)"index"in t[$link]&&n.push(e.processLinks(t[$link]));Promise.all(n).then(function(t){var n=[];for($indexOfItem in t)"object"==typeof t[$indexOfItem]&&n.push(e.processParentHistory(t[$indexOfItem]));Promise.all(n).then(function(){e.summarize()})["catch"](function(e){modalHelper.setMessage(e,!0)})})["catch"](function(e){modalHelper.setMessage("Not able to find parent's history for...",!0),modalHelper.setMessage(e,!0),console.log(e)})})["catch"](function(e){modalHelper.setMessage("Not able to find parent for #"+$id,!0),modalHelper.setMessage(e,!0)})})["catch"](function(e){modalHelper.setMessage(e,!0)})}},RTCQuery.prototype.processStories=function(){var e=this;this.$defectsArr.forEach(function(t,n){if($id=t.id,"undefined"!=typeof $id)if(modalHelper.setMessage("Processing the work item "+t.workItemType+" #"+$id),"Story"==t.workItemType){e.$sprintData.commStories++;var s=parseInt(t["com.ibm.team.apt.attribute.complexity"]);if(s=isNaN(s)?0:s,e.$sprintData.commPoints+=s,"Done"!=t.internalState)return;e.$sprintData.commStoriesDel++,e.$sprintData.commPointsDel+=s,modalHelper.setMessage("Looking into the histry of work item #"+$id),e.$historyArr.push(getHistoryQuery($id,n))}else"environment"in t&&"Production"==t.environment&&(e.$sprintData.defects++,"Resolved"!=t.internalState&&"Verified"!=t.internalState||e.$sprintData.defectsClosed++)})},RTCQuery.prototype.setDefectsArray=function(e,t){$defectsArr=[];for(index in t){var n=t[index],s=n.labels,r={};for(labelIndex in s)r[e[labelIndex]]="item"in n.info[labelIndex]?n.info[labelIndex].item[0].comment:s[labelIndex];$defectsArr.push(r)}this.$defectsArr=$defectsArr},RTCQuery.prototype.processLinks=function(e){var t=this.findParent(e.data);return modalHelper.setMessage("Found the parent of "+e.id+" as "+t),t?(modalHelper.setMessage("Looking into the history of  parent #"+t),getHistoryQuery(t,e.index)):(this.$sprintData.commFeatures.push(e.id),!0)},RTCQuery.prototype.processHistory=function(e){$rows=e.data["soapenv:Body"].response.returnValue.value.changes?e.data["soapenv:Body"].response.returnValue.value.changes:[];var t=e.id,n=e.index;modalHelper.setMessage("Looking into history - finding WIP_start_date &  WIP_end_date for #"+t);var s=this;return $rows.forEach(function(e,t){(e.content.indexOf("&nbsp;&nbsp;&rarr;&nbsp;&nbsp;In Progress")>0||e.content.indexOf("&nbsp;&nbsp;&rarr;&nbsp;&nbsp;Implementing")>0||e.content.indexOf("&nbsp;&nbsp;&rarr;&nbsp;&nbsp;In Dev")>0)&&(s.$defectsArr[n].WIP_start_date=e.modifiedDate),e.content.indexOf("&nbsp;&nbsp;&rarr;&nbsp;&nbsp;Done")>0&&(s.$defectsArr[n].WIP_end_date=e.modifiedDate)}),!("WIP_end_date"in s.$defectsArr[n]&&"WIP_start_date"in s.$defectsArr[n])||(modalHelper.setMessage("Successfully found WIP_start_date &  WIP_end_date for #"+t),s.$defectsArr[n].WIP=dateDiff(s.$defectsArr[n].WIP_start_date,s.$defectsArr[n].WIP_end_date),s.$sprintData.WIPTotal+=s.$defectsArr[n].WIP,modalHelper.setMessage("Finding the parent of "+t),getParent(t,n))},RTCQuery.prototype.processParentHistory=function(e){modalHelper.setMessage("Finding BL_start_date & BL_end_date  of parent #"+e.id+" for the workitem #"+this.$defectsArr[e.index]);var t=e.index,n=e.data["soapenv:Body"].response.returnValue.value.changes?e.data["soapenv:Body"].response.returnValue.value.changes:[],s=this;return n.forEach(function(e,n){e.content.indexOf("&nbsp;&nbsp;&rarr;&nbsp;&nbsp;SC Priority Backlog/SC Approved")>0&&(s.$defectsArr[t].BL_start_date=e.modifiedDate),e.content.indexOf("&nbsp;&nbsp;&rarr;&nbsp;&nbsp;Implementing")>0&&(s.$defectsArr[t].BL_end_date=e.modifiedDate)}),"BL_start_date"in this.$defectsArr[t]&&"BL_end_date"in this.$defectsArr[t]&&(modalHelper.setMessage("Successfully found BL_start_date & BL_end_date  of parent #"+e.id),this.$defectsArr[t].BL=dateDiff(this.$defectsArr[t].BL_start_date,this.$defectsArr[t].BL_end_date),this.$sprintData.BLTotal+=this.$defectsArr[t].BL,this.$sprintData.commFeatures.push(e.id)),!0},RTCQuery.prototype.round=function(e,t){var n=Math.pow(10,t),s=e*n,r=Math.round(s);return r/n},RTCQuery.prototype.summarize=function(){var t=this.$sprintData.commFeatures=this.$sprintData.commFeatures.filter(function(e,t,n){return n.indexOf(e)===t});this.$sprintData.commStoriesDel>0&&(this.$sprintData.cycleTimeWIP=this.round(this.$sprintData.WIPTotal/this.$sprintData.commStoriesDel,1)),t.length>0&&($sprintData.cycleTimeInBacklog=this.round(this.$sprintData.BLTotal/t.length,1)),modalHelper.setMessage("All the records are successfully processed"),$dataToDisplay={};for(e in this.$sprintData)$dataToDisplay[$sprintDataLabel[e]]=this.$sprintData[e];modalHelper.createTableFromJSON([$dataToDisplay]);var n="(function(){ var fieldsToFill =  "+JSON.stringify($sprintData)+";for (e in fieldsToFill) {var elem = document.getElementById(e); if (elem) { elem.value= fieldsToFill[e];}}}())";modalHelper.renderCopy(n),modalHelper.createTableFromJSON(this.$defectsArr,!0)},RTCQuery.prototype.findParent=function(e){var t=e["soapenv:Body"].response.returnValue.value.linkTypes?e["soapenv:Body"].response.returnValue.value.linkTypes:[],n=0;if(t.length)for($key in t){var s=t[$key];if("Parent"==s.displayName){var r=s.linkDTOs[0].comment;return n=parseInt(r.substr(r.indexOf("Feature ")+8,r.indexOf(":")))}}return n}}();